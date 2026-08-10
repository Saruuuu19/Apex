from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.routine_set import RoutineSetCreate, RoutineSetResponse


class RoutineExerciseCreate(BaseModel):
    exercise_id: UUID
    order: int
    routine_sets: list[RoutineSetCreate] = Field(default_factory=list)


class RoutineExerciseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    routine_id: UUID
    exercise_id: UUID
    order: int
    routine_sets: list[RoutineSetResponse]
