import logging
import re
from datetime import UTC, datetime, timedelta
from uuid import UUID

from authlib.integrations.starlette_client import OAuthError
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import delete, or_, select, update
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.limiter import limiter
from app.core.oauth import oauth
from app.core.security import (
    create_access_token,
    generate_opaque_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.database import get_db
from app.models.exchange_code import ExchangeCode
from app.models.oauth_account import OAuthAccount
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import (
    ExchangeRequest,
    LogoutRequest,
    RefreshRequest,
    TokenPairResponse,
)
from app.schemas.user import UserCreate, UserResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Users"])

# Precomputed bcrypt hash compared against when the account does not exist,
# so login response time cannot be used to enumerate registered users.
DUMMY_PASSWORD_HASH = "$2b$12$ecEB/u4fIX7sa/nZ3z8v8.HR2xIBXpE3HKu1CKdxL89fLJswuA2eK"


def _create_refresh_token(db: Session, user_id: UUID) -> str:
    token = generate_opaque_token()
    db.add(
        RefreshToken(
            user_id=user_id,
            token_hash=hash_token(token),
            expires_at=datetime.now(UTC)
            + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
    )
    return token


def _revoke_all_sessions(db: Session, user_id: UUID) -> None:
    db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=datetime.now(UTC))
    )


def _follow_live_token(db: Session, row: RefreshToken) -> RefreshToken | None:
    current = row
    while current.replaced_by_hash:
        next_row = db.scalar(
            select(RefreshToken).where(
                RefreshToken.token_hash == current.replaced_by_hash
            )
        )
        if next_row is None:
            break
        current = next_row
    return current


def _purge_expired_refresh_tokens(db: Session, now: datetime) -> None:
    cutoff = now - timedelta(hours=1)
    db.execute(
        delete(RefreshToken).where(
            or_(
                RefreshToken.expires_at <= now,
                RefreshToken.revoked_at <= cutoff,
            )
        )
    )


def _purge_expired_exchange_codes(db: Session, now: datetime) -> None:
    cutoff = now - timedelta(hours=1)
    db.execute(
        delete(ExchangeCode).where(
            or_(
                ExchangeCode.expires_at <= now,
                ExchangeCode.used_at <= cutoff,
            )
        )
    )


def _create_exchange_code(db: Session, user_id: UUID) -> str:
    code = generate_opaque_token()
    db.add(
        ExchangeCode(
            user_id=user_id,
            code_hash=hash_token(code),
            expires_at=datetime.now(UTC)
            + timedelta(seconds=settings.EXCHANGE_CODE_EXPIRE_SECONDS),
        )
    )
    return code


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


@router.post("/login", response_model=TokenPairResponse)
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
    refresh_token = _create_refresh_token(db, user.id)
    db.commit()

    return TokenPairResponse(
        access_token=access_token, refresh_token=refresh_token, token_type="bearer"
    )


@router.post("/refresh", response_model=TokenPairResponse)
@limiter.limit("30/minute")
def refresh_tokens(
    request: Request,
    payload: RefreshRequest,
    db: Session = Depends(get_db),
):
    now = datetime.now(UTC)
    _purge_expired_refresh_tokens(db, now)

    row = db.scalar(
        select(RefreshToken)
        .where(RefreshToken.token_hash == hash_token(payload.refresh_token))
        .with_for_update()
    )

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired",
        )

    if row.revoked_at is not None:
        within_grace = (
            now - row.revoked_at
        ) <= timedelta(seconds=settings.REFRESH_GRACE_SECONDS)

        if not within_grace:
            _revoke_all_sessions(db, row.user_id)
            db.commit()
            logger.warning(
                "Reused refresh token detected; revoked all sessions for user %s",
                row.user_id,
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired",
            )

        live = _follow_live_token(db, row)
        if live is None or live.revoked_at is not None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired",
            )

        new_refresh = _create_refresh_token(db, live.user_id)
        live.revoked_at = now
        live.replaced_by_hash = hash_token(new_refresh)
        access_token = create_access_token({"sub": str(live.user_id)})
        db.commit()

        return TokenPairResponse(
            access_token=access_token,
            refresh_token=new_refresh,
            token_type="bearer",
        )

    new_refresh = _create_refresh_token(db, row.user_id)
    row.revoked_at = now
    row.replaced_by_hash = hash_token(new_refresh)
    access_token = create_access_token({"sub": str(row.user_id)})
    db.commit()

    return TokenPairResponse(
        access_token=access_token, refresh_token=new_refresh, token_type="bearer"
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def logout(
    request: Request,
    payload: LogoutRequest,
    db: Session = Depends(get_db),
):
    row = db.scalar(
        select(RefreshToken).where(
            RefreshToken.token_hash == hash_token(payload.refresh_token)
        )
    )
    if row is not None and row.revoked_at is None:
        row.revoked_at = datetime.now(UTC)
        db.commit()


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

    code = _create_exchange_code(db, user.id)
    db.commit()

    return RedirectResponse(
        url=f"{settings.FRONTEND_URL}/auth/callback?code={code}"
    )


@router.post("/exchange", response_model=TokenPairResponse)
@limiter.limit("10/minute")
def exchange_code(
    request: Request,
    payload: ExchangeRequest,
    db: Session = Depends(get_db),
):
    now = datetime.now(UTC)
    _purge_expired_exchange_codes(db, now)

    row = db.scalar(
        select(ExchangeCode)
        .where(ExchangeCode.code_hash == hash_token(payload.code))
        .with_for_update()
    )

    if row is None or row.used_at is not None or row.expires_at <= now:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired code",
        )

    row.used_at = now
    access_token = create_access_token({"sub": str(row.user_id)})
    refresh_token = _create_refresh_token(db, row.user_id)
    db.commit()

    return TokenPairResponse(
        access_token=access_token, refresh_token=refresh_token, token_type="bearer"
    )