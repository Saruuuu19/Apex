from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.exercise import Exercise
from app.models.routine import Routine
from app.models.routine_exercise import RoutineExercise
from app.models.routine_set import RoutineSet
from app.models.user import User
from app.schemas.routine_exercise import RoutineExerciseCreate, RoutineExerciseResponse
from app.schemas.routine_set import RoutineSetResponse, RoutineSetUpdate


router = APIRouter(prefix="/routines", tags=["Routines"])


@router.post(
    "/{routine_id}/exercises",
    response_model=RoutineExerciseResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_routine_exercise(
    routine_id: UUID,
    routine_exercise: RoutineExerciseCreate,
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
            detail="Not authorized to modify this routine",
        )

    db_exercise = db.get(Exercise, routine_exercise.exercise_id)

    if not db_exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found"
        )

    routine_sets = [
        RoutineSet(
            order=routine_set.order,
            target_reps=routine_set.target_reps,
            target_weight=routine_set.target_weight,
            set_type=routine_set.set_type,
        )
        for routine_set in routine_exercise.routine_sets
    ]

    db_routine_exercise = RoutineExercise(
        routine_id=routine_id,
        exercise_id=routine_exercise.exercise_id,
        order=routine_exercise.order,
        routine_sets=routine_sets,
    )

    db.add(db_routine_exercise)

    db.commit()

    db.refresh(db_routine_exercise)

    return db_routine_exercise


@router.patch(
    "/{routine_exercise_id}/sets/{routine_set_id}",
    response_model=RoutineSetResponse,
    status_code=status.HTTP_200_OK,
)
def update_routine_set(
    routine_exercise_id: UUID,
    routine_set_id: UUID,
    routine_set_update: RoutineSetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_routine_set = db.scalar(
        select(RoutineSet)
        .where(RoutineSet.id == routine_set_id)
        .options(
            joinedload(RoutineSet.routine_exercise).joinedload(RoutineExercise.routine)
        )
    )

    if not db_routine_set or db_routine_set.routine_exercise_id != routine_exercise_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine set not found in this routine exercise",
        )

    if db_routine_set.routine_exercise.routine.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this routine set",
        )

    for field, value in routine_set_update.model_dump(exclude_unset=True).items():
        setattr(db_routine_set, field, value)

    db.commit()
    db.refresh(db_routine_set)

    return db_routine_set


@router.delete(
    "/{routine_exercise_id}/sets/{routine_set_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_routine_set(
    routine_exercise_id: UUID,
    routine_set_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_routine_set = db.scalar(
        select(RoutineSet)
        .where(RoutineSet.id == routine_set_id)
        .options(
            joinedload(RoutineSet.routine_exercise).joinedload(RoutineExercise.routine)
        )
    )

    if not db_routine_set or db_routine_set.routine_exercise_id != routine_exercise_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine set not found in this routine exercise",
        )

    if db_routine_set.routine_exercise.routine.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to remove this routine set",
        )

    db.delete(db_routine_set)
    db.commit()


@router.delete(
    "/{routine_id}/exercises/{routine_exercise_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_routine_exercise(
    routine_id: UUID,
    routine_exercise_id: UUID,
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
            detail="Not authorized to modify this routine",
        )

    db_routine_exercise = db.get(RoutineExercise, routine_exercise_id)

    if not db_routine_exercise or db_routine_exercise.routine_id != routine_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine exercise not found in this routine",
        )

    db.delete(db_routine_exercise)
    db.commit()
