from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.routine import Routine
from app.models.routine_exercise import RoutineExercise
from app.models.user import User
from app.models.workout_exercise import WorkoutExercise
from app.models.workout_session import WorkoutSession
from app.schemas.routine import RoutineResponse
from app.schemas.workout_session import WorkoutSessionResponse

router = APIRouter(tags=["Users"])


@router.get("/me/routines", response_model=list[RoutineResponse])
def get_my_routines(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    routines = db.scalars(
        select(Routine)
        .where(Routine.user_id == current_user.id)
        .options(
            selectinload(Routine.routine_exercises).selectinload(
                RoutineExercise.routine_sets
            )
        )
    ).all()
    return routines


@router.get("/users/{user_id}/routines", response_model=list[RoutineResponse])
def get_user_routines(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    routines = db.scalars(
        select(Routine)
        .where(Routine.user_id == user_id)
        .options(
            selectinload(Routine.routine_exercises).selectinload(
                RoutineExercise.routine_sets
            )
        )
    ).all()
    return routines


@router.get("/me/workout-sessions", response_model=list[WorkoutSessionResponse])
def get_my_workout_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_workout_sessions = db.scalars(
        select(WorkoutSession)
        .where(WorkoutSession.user_id == current_user.id)
        .options(
            selectinload(WorkoutSession.workout_exercises).selectinload(
                WorkoutExercise.sets
            )
        )
    ).all()

    return db_workout_sessions
