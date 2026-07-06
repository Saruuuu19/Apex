from pydantic import BaseModel, ConfigDict, Field, HttpUrl
from uuid import UUID

from app.models.enums import MuscleGroup, Equipment


class ExerciseCreate(BaseModel):
    name: str = Field(max_length=100)
    primary_muscle: MuscleGroup
    secondary_muscles: list[MuscleGroup] = Field(default_factory=list)
    equipment: Equipment
    media_url: HttpUrl | None = None


class ExerciseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    primary_muscle: MuscleGroup
    secondary_muscles: list[MuscleGroup] = Field(default_factory=list)
    equipment: Equipment
    media_url: HttpUrl | None = None
