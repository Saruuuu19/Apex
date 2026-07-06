from uuid import UUID
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field
from app.models.enums import SetType


class SetCreate(BaseModel):
    order: int
    set_type: SetType = SetType.NORMAL
    reps: int | None = None
    weight: Decimal | None = None
    rpe: Decimal | None = Field(default=None, ge=7, le=10)


class SetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    workout_exercise_id: UUID
    order: int
    set_type: SetType
    reps: int | None = None
    weight: Decimal | None = None
    rpe: Decimal | None = Field(default=None, ge=7, le=10)
