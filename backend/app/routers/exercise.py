from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import exists, or_, select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.exercise import Exercise
from app.models.routine_exercise import RoutineExercise
from app.models.user import User
from app.models.workout_exercise import WorkoutExercise
from app.schemas.exercise import ExerciseCreate, ExerciseResponse, ExerciseUpdate

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


@router.patch(
    "/{exercise_id}",
    response_model=ExerciseResponse,
)
def update_exercise(
    exercise_id: UUID,
    exercise_update: ExerciseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_exercise = db.get(Exercise, exercise_id)

    if not db_exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found"
        )

    update_data = exercise_update.model_dump(exclude_unset=True)

    if "media_url" in update_data and update_data["media_url"] is not None:
        update_data["media_url"] = str(update_data["media_url"])

    for key, value in update_data.items():
        setattr(db_exercise, key, value)

    db.commit()
    db.refresh(db_exercise)

    return db_exercise


@router.delete(
    "/{exercise_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_exercise(
    exercise_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_exercise = db.get(Exercise, exercise_id)
    if not db_exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found"
        )

    is_referenced = db.scalar(
        select(
            exists().where(
                or_(
                    RoutineExercise.exercise_id == exercise_id,
                    WorkoutExercise.exercise_id == exercise_id,
                )
            )
        )
    )
    if is_referenced:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Exercise is referenced by routines or workout sessions and cannot be deleted",
        )

    db.delete(db_exercise)
    db.commit()
