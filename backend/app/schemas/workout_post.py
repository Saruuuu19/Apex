from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.workout_session import WorkoutSessionResponse
from app.schemas.user import UserPublic


class WorkoutPostCreate(BaseModel):
    title: str | None = Field(default=None, max_length=100)
    caption: str | None = None
    image_url: str | None = Field(default=None, max_length=255)


class WorkoutPostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    user: UserPublic
    workout_session_id: UUID | None = None
    title: str | None = None
    image_url: str | None = None
    caption: str | None = None
    performed_at: datetime
    published_at: datetime
    workout_session: WorkoutSessionResponse | None = None
    duration_seconds: int | None = None


class PostImageUploadResponse(BaseModel):
    image_url: str
