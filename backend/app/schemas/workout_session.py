from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.workout_exercise import WorkoutExerciseCreate, WorkoutExerciseResponse


class WorkoutSessionCreate(BaseModel):
    routine_id: UUID | None = None
    workout_exercises: list[WorkoutExerciseCreate]


class WorkoutSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    routine_id: UUID | None = None
    started_at: datetime
    completed_at: datetime | None = None
    workout_exercises: list[WorkoutExerciseResponse]
