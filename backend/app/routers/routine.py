# Routines.py router
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from uuid import UUID

from app.core.dependencies import get_current_user
from app.models.routine import Routine
from app.models.routine_exercise import RoutineExercise
from app.models.routine_set import RoutineSet
from app.models.user import User
from app.schemas.routine import RoutineCreate, RoutineResponse
from app.schemas.routine_exercise import RoutineExerciseCreate, RoutineExerciseResponse

router = APIRouter(prefix="/routines", tags=["Routines"])


@router.post(
    "/",
    response_model=RoutineResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_routine(
    routine: RoutineCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_routine = Routine(name=routine.name, user_id=current_user.id)

    db.add(db_routine)

    db.commit()

    db.refresh(db_routine)

    return db_routine


@router.get(
    "/{routine_id}",
    response_model=RoutineResponse,
    status_code=status.HTTP_200_OK,
)
def get_routine(
    routine_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_routine = db.get(Routine, routine_id)

    if not db_routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Routine not found"
        )

    return db_routine


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
