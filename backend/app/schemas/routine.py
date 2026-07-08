from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.routine_exercise import RoutineExerciseResponse


class RoutineCreate(BaseModel):
    name: str


class RoutineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    user_id: UUID
    routine_exercises: list[RoutineExerciseResponse]
