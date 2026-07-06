from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.set import SetCreate, SetResponse


class WorkoutExerciseCreate(BaseModel):
    exercise_id: UUID
    order: int
    sets: list[SetCreate] | None = None


class WorkoutExerciseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    workout_session_id: UUID
    exercise_id: UUID
    order: int
    sets: list[SetResponse] | None = None
