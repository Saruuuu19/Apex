from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.routine_exercise import RoutineExerciseResponse


class RoutineCreate(BaseModel):
    name: str = Field(max_length=100)


class RoutineUpdate(BaseModel):
    name: str | None = None


class RoutineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    user_id: UUID
    routine_exercises: list[RoutineExerciseResponse]
