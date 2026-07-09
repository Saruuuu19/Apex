from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.routine import Routine
from app.models.user import User
from app.schemas.routine import RoutineResponse

router = APIRouter(tags=["Users"])


@router.get(
    "/me/routines",
    response_model=list[RoutineResponse]
)
def get_my_routines(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    routines = db.scalars(
        select(Routine).where(Routine.user_id == current_user.id)
    ).all()
    return routines


@router.get("/users/{user_id}/routines", response_model=list[RoutineResponse])
def get_user_routines(
    user_id: UUID,
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    routines = db.scalars(select(Routine).where(Routine.user_id == user_id)).all()
    return routines
