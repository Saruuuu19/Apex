from typing import Annotated

from pydantic import AnyUrl, BaseModel, ConfigDict, Field, UrlConstraints
from uuid import UUID

from app.models.enums import MuscleGroup, Equipment

# HTTP(S) URL capped at 255 chars to fit the exercises.media_url column
HttpUrl = Annotated[
    AnyUrl, UrlConstraints(max_length=255, allowed_schemes=["http", "https"])
]


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
