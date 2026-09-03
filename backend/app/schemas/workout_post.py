from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.workout_session import WorkoutSessionResponse
from app.schemas.user import UserResponse


class WorkoutPostCreate(BaseModel):
    caption: str | None = None


class WorkoutPostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    user: UserResponse
    workout_session_id: UUID | None = None
    caption: str | None = None
    performed_at: datetime
    published_at: datetime
    workout_session: WorkoutSessionResponse | None = None
    duration_seconds: int | None = None
