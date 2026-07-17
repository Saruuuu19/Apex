from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from app.database import get_db

from app.core.dependencies import get_current_user
from app.models.routine import Routine
from app.models.user import User
from app.models.workout_session import WorkoutSession
from app.schemas.workout_session import (
    WorkoutSessionCreate,
    WorkoutSessionResponse,
)
from uuid import UUID
from app.models.workout_exercise import WorkoutExercise
from app.models.set import Set
from app.schemas.set import SetResponse, SetUpdate


router = APIRouter(prefix="/workout_sessions", tags=["workout_sessions"])


@router.post(
    "/",
    response_model=WorkoutSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_workout_session(
    workout_session: WorkoutSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if workout_session.routine_id is not None:
        db_routine = db.get(Routine, workout_session.routine_id)
        if not db_routine:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Routine not found"
            )
        if db_routine.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to use this routine",
            )

    db_workout_session = WorkoutSession(
        user_id=current_user.id, routine_id=workout_session.routine_id
    )

    db.add(db_workout_session)

    db.commit()

    db.refresh(db_workout_session)

    return db_workout_session


@router.post(
    "/routines/{routine_id}/start",
    response_model=WorkoutSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_workout_session_from_routine(
    routine_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_routine = db.get(Routine, routine_id)

    if not db_routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Routine not found"
        )
    if db_routine.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to use this routine",
        )

    workout_session = WorkoutSession(user_id=current_user.id, routine_id=routine_id)

    workout_exercises = [
        WorkoutExercise(
            exercise_id=re.exercise_id,
            order=re.order,
            sets=[
                Set(
                    order=rs.order,
                    set_type=rs.set_type,
                )
                for rs in re.routine_sets
            ],
        )
        for re in db_routine.routine_exercises
    ]

    workout_session.workout_exercises = workout_exercises

    db.add(workout_session)

    db.commit()

    db.refresh(workout_session)

    return workout_session


@router.patch(
    "/sets/{set_id}",
    response_model=SetResponse,
    status_code=status.HTTP_200_OK,
)
def update_set(
    set_id: UUID,
    set_update: SetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_set = db.scalar(
        select(Set)
        .where(Set.id == set_id)
        .options(
            joinedload(Set.workout_exercise).joinedload(WorkoutExercise.workout_session)
        )
    )

    if not db_set:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Set not found"
        )

    if db_set.workout_exercise.workout_session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this set",
        )

    update_data = set_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_set, field, value)

    db.commit()

    db.refresh(db_set)

    return db_set
