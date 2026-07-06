from uuid import UUID


from pydantic import BaseModel, ConfigDict

from app.schemas.routine_set import RoutineSetResponse, RoutineSetCreate


class RoutineExerciseCreate(BaseModel):
    exercise_id: UUID
    order: int
    routine_sets: list[RoutineSetCreate]


class RoutineExerciseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    routine_id: UUID
    exercise_id: UUID
    order: int
    routine_sets: list[RoutineSetResponse]
