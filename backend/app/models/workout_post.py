from datetime import UTC, datetime
from uuid import UUID as PyUUID, uuid4

from sqlalchemy import UUID as SqlUUID, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from app.models.user import User
    from app.models.workout_session import WorkoutSession


class WorkoutPost(Base):
    """A published workout snapshot.

    performed_at is the date/time the user started the workout session (copied
    from WorkoutSession.started_at), not when the post was published.

    duration_seconds is NOT stored. It is derived from the linked
    WorkoutSession as (completed_at or now) - started_at, and is None when
    workout_session_id is NULL because the session was deleted.
    """

    __tablename__ = "workout_posts"

    id: Mapped[PyUUID] = mapped_column(
        SqlUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_id: Mapped[PyUUID] = mapped_column(
        SqlUUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    workout_session_id: Mapped[PyUUID | None] = mapped_column(
        SqlUUID(as_uuid=True),
        ForeignKey("workout_sessions.id", ondelete="SET NULL"),
        nullable=True,
    )
    caption: Mapped[str | None] = mapped_column(String, nullable=True)
    performed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    published_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )

    user: Mapped["User"] = relationship(back_populates="workout_posts")
    workout_session: Mapped["WorkoutSession | None"] = relationship(
        back_populates="workout_posts"
    )