from pydantic import BaseModel, ConfigDict
from uuid import UUID
from decimal import Decimal

from app.models.enums import SetType


class RoutineSetCreate(BaseModel):
    order: int
    target_reps: int | None = None
    target_weight: Decimal | None = None
    set_type: SetType = SetType.NORMAL


class RoutineSetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    routine_exercise_id: UUID
    target_reps: int | None = None
    target_weight: Decimal | None = None
    set_type: SetType
