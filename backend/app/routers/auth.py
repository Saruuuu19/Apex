import re

from authlib.integrations.starlette_client import OAuthError
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select, or_
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.limiter import limiter
from app.core.oauth import oauth
from app.database import get_db
from app.models.oauth_account import OAuthAccount
from app.models.user import User
from app.schemas.user import TokenResponse, UserCreate, UserResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Users"])

# Precomputed bcrypt hash compared against when the account does not exist,
# so login response time cannot be used to enumerate registered users.
DUMMY_PASSWORD_HASH = "$2b$12$ecEB/u4fIX7sa/nZ3z8v8.HR2xIBXpE3HKu1CKdxL89fLJswuA2eK"


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("10/minute")
def register_user(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.scalar(
        select(User).where(
            or_(User.username == user.username, User.email == user.email)
        )
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already registered",
        )

    hashed_password = hash_password(user.password)

    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    identifier = form_data.username

    user = db.scalar(
        select(User).where((User.username == identifier) | (User.email == identifier))
    )

    hashed_password = (
        user.hashed_password if user and user.hashed_password else DUMMY_PASSWORD_HASH
    )
    password_valid = verify_password(form_data.password, hashed_password)

    if user is None or not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    access_token = create_access_token({"sub": str(user.id)})

    return TokenResponse(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user


def _unique_username(db: Session, email: str | None) -> str:
    """Derive a unique username from the email address (social users have
    no password, but the username column is required)."""
    base = re.sub(r"[^a-zA-Z0-9_]", "", (email or "user").split("@")[0])[:20]
    if not base:
        base = "user"

    candidate = base
    suffix = 1
    while db.scalar(select(User.id).where(User.username == candidate)) is not None:
        candidate = f"{base[: 20 - len(str(suffix))]}{suffix}"
        suffix += 1

    return candidate


@router.get("/google/login")
async def google_login(request: Request):
    return await oauth.google.authorize_redirect(
        request, redirect_uri=settings.GOOGLE_REDIRECT_URI
    )


@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
        userinfo = await oauth.google.userinfo(token=token)
    except OAuthError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google authorization failed",
        )

    provider_user_id = str(userinfo["sub"])
    email = userinfo.get("email") if userinfo.get("email_verified") else None

    account = db.scalar(
        select(OAuthAccount).where(
            OAuthAccount.provider == "google",
            OAuthAccount.provider_user_id == provider_user_id,
        )
    )

    if account is not None:
        user = account.user
    else:
        user = db.scalar(select(User).where(User.email == email)) if email else None

        if user is None:
            user = User(
                username=_unique_username(db, email),
                email=email or f"{provider_user_id}@google.oauth",
                hashed_password=None,
            )
            db.add(user)
            db.flush()

        db.add(
            OAuthAccount(
                user_id=user.id,
                provider="google",
                provider_user_id=provider_user_id,
            )
        )
        db.commit()

    access_token = create_access_token({"sub": str(user.id)})

    return RedirectResponse(
        url=f"{settings.FRONTEND_URL}/auth/callback?token={access_token}"
    )