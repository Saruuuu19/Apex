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
    """

    @property
    def duration_seconds(self) -> int | None:
        if self.workout_session is None:
            return None
        if self.workout_session.completed_at is None:
            return None
        return int(
            (
                self.workout_session.completed_at - self.workout_session.started_at
            ).total_seconds()
        )

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
