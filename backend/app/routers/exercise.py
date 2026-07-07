from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.exercise import Exercise
from app.models.user import User
from app.schemas.exercise import ExerciseCreate, ExerciseResponse

router = APIRouter(prefix="/exercises", tags=["Exercises"])


@router.post(
    "/",
    response_model=ExerciseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_exercise(
    exercise: ExerciseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_exercise = Exercise(
        name=exercise.name,
        primary_muscle=exercise.primary_muscle,
        secondary_muscles=exercise.secondary_muscles,
        equipment=exercise.equipment,
        media_url=str(exercise.media_url) if exercise.media_url else None,
    )
    db.add(db_exercise)

    db.commit()

    db.refresh(db_exercise)

    return db_exercise


@router.get(
    "/{exercise_id}",
    response_model=ExerciseResponse,
    status_code=status.HTTP_200_OK,
)
def get_exercise(
    exercise_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_exercise = db.get(Exercise, exercise_id)

    if not db_exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found"
        )

    return db_exercise


@router.get(
    "/",
    response_model=list[ExerciseResponse],
    status_code=status.HTTP_200_OK,
)
def get_all_exercises(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    exercises = db.scalars(select(Exercise)).all()
    return exercises
