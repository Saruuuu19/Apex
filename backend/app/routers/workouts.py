from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.exercise import Exercise
from app.models.routine import Routine
from app.models.set import Set
from app.models.user import User
from app.models.workout_exercise import WorkoutExercise
from app.models.workout_session import WorkoutSession
from app.schemas.set import SetCreate, SetResponse, SetUpdate
from app.schemas.workout_exercise import (
    WorkoutExerciseCreate,
    WorkoutExerciseResponse,
    WorkoutExerciseUpdate,
)
from app.schemas.workout_session import WorkoutSessionCreate, WorkoutSessionResponse
from app.schemas.workout_post import WorkoutPostCreate
from app.models.workout_post import WorkoutPost


router = APIRouter(prefix="/workout-sessions", tags=["workout-sessions"])


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


@router.post(
    "/{workout_session_id}/exercises",
    response_model=WorkoutExerciseResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_workout_exercise(
    workout_session_id: UUID,
    workout_exercise: WorkoutExerciseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_workout_session = db.get(WorkoutSession, workout_session_id)

    if not db_workout_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout session not found",
        )
    if db_workout_session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this workout session",
        )
    if db_workout_session.completed_at is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot modify a completed workout session",
        )

    db_exercise = db.get(Exercise, workout_exercise.exercise_id)
    if not db_exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found"
        )

    db_workout_exercise = WorkoutExercise(
        workout_session_id=workout_session_id,
        exercise_id=workout_exercise.exercise_id,
        order=workout_exercise.order,
        sets=[
            Set(
                order=set_data.order,
                set_type=set_data.set_type,
                reps=set_data.reps,
                weight=set_data.weight,
                rpe=set_data.rpe,
            )
            for set_data in (workout_exercise.sets or [])
        ],
    )

    db.add(db_workout_exercise)
    db.commit()
    db.refresh(db_workout_exercise)

    return db_workout_exercise


@router.post(
    "/{id}/complete",
    response_model=WorkoutSessionResponse,
    status_code=status.HTTP_200_OK,
)
def complete_workout_session(
    id: UUID,
    current_user: User = Depends(get_current_user),
    payload: WorkoutPostCreate | None = Body(default=None),
    db: Session = Depends(get_db),
):
    workout_session = db.get(WorkoutSession, id)

    if not workout_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout session not found",
        )

    if workout_session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to complete this workout session",
        )
    if workout_session.completed_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Workout session is already completed",
        )

    workout_session.completed_at = datetime.now(UTC)

    post = WorkoutPost(
        user_id=current_user.id,
        workout_session_id=workout_session.id,
        caption=payload.caption if payload else None,
        performed_at=workout_session.started_at,
    )

    db.add(post)
    db.commit()
    db.refresh(workout_session)

    return workout_session


@router.delete(
    "/{workout_session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_workout_session(
    workout_session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_workout_session = db.get(WorkoutSession, workout_session_id)

    if not db_workout_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout session not found",
        )
    if db_workout_session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this workout session",
        )
    if db_workout_session.completed_at is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete a completed workout session",
        )

    db.delete(db_workout_session)
    db.commit()


@router.post(
    "/workout-exercises/{workout_exercise_id}/sets",
    response_model=SetResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_set(
    workout_exercise_id: UUID,
    set_data: SetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workout_exercise = db.scalar(
        select(WorkoutExercise)
        .where(WorkoutExercise.id == workout_exercise_id)
        .options(joinedload(WorkoutExercise.workout_session))
    )

    if not workout_exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Workout exercise not found"
        )

    if workout_exercise.workout_session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add a set to this workout exercise",
        )
    if workout_exercise.workout_session.completed_at is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot add sets to a completed workout session",
        )

    new_set = Set(
        order=set_data.order,
        set_type=set_data.set_type,
        reps=set_data.reps,
        weight=set_data.weight,
        rpe=set_data.rpe,
        workout_exercise_id=workout_exercise_id,
    )

    db.add(new_set)
    db.commit()
    db.refresh(new_set)

    return new_set


@router.get("/{workout_session_id}", response_model=WorkoutSessionResponse)
def get_workout_session(
    workout_session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_workout_session = db.get(
        WorkoutSession,
        workout_session_id,
        options=[
            selectinload(WorkoutSession.workout_exercises).selectinload(
                WorkoutExercise.sets
            )
        ],
    )

    if not db_workout_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Workout session not found"
        )
    if db_workout_session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this workout session",
        )

    return db_workout_session


@router.patch(
    "/workout-exercises/{workout_exercise_id}",
    response_model=WorkoutExerciseResponse,
    status_code=status.HTTP_200_OK,
)
def update_workout_exercise(
    workout_exercise_id: UUID,
    workout_exercise_update: WorkoutExerciseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_workout_exercise = db.scalar(
        select(WorkoutExercise)
        .where(WorkoutExercise.id == workout_exercise_id)
        .options(joinedload(WorkoutExercise.workout_session))
    )

    if not db_workout_exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Workout exercise not found"
        )

    if db_workout_exercise.workout_session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this workout exercise",
        )
    if db_workout_exercise.workout_session.completed_at is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot modify a completed workout session",
        )

    update_data = workout_exercise_update.model_dump(exclude_unset=True)

    if "exercise_id" in update_data:
        db_exercise = db.get(Exercise, update_data["exercise_id"])
        if not db_exercise:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found"
            )
    for field, value in update_data.items():
        setattr(db_workout_exercise, field, value)

    db.commit()
    db.refresh(db_workout_exercise)

    return db_workout_exercise


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
    if db_set.workout_exercise.workout_session.completed_at is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot modify a completed workout session",
        )

    update_data = set_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_set, field, value)

    db.commit()

    db.refresh(db_set)

    return db_set


@router.delete(
    "/sets/{set_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_set(
    set_id: UUID,
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
            detail="Not authorized to remove this set",
        )
    if db_set.workout_exercise.workout_session.completed_at is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot modify a completed workout session",
        )

    db.delete(db_set)
    db.commit()


@router.delete(
    "/workout-exercises/{workout_exercise_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_workout_exercise(
    workout_exercise_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_workout_exercise = db.scalar(
        select(WorkoutExercise)
        .where(WorkoutExercise.id == workout_exercise_id)
        .options(joinedload(WorkoutExercise.workout_session))
    )

    if not db_workout_exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Workout exercise not found"
        )
    if db_workout_exercise.workout_session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this workout exercise",
        )

    db.delete(db_workout_exercise)
    db.commit()
