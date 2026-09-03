from datetime import UTC, datetime
from uuid import UUID as PyUUID, uuid4

from sqlalchemy import UUID as SqlUUID, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from app.models.routine import Routine
    from app.models.user import User
    from app.models.workout_exercise import WorkoutExercise
    from app.models.workout_post import WorkoutPost


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id: Mapped[PyUUID] = mapped_column(
        SqlUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_id: Mapped[PyUUID] = mapped_column(
        SqlUUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    routine_id: Mapped[PyUUID | None] = mapped_column(
        SqlUUID(as_uuid=True), ForeignKey("routines.id", ondelete="SET NULL"), nullable=True
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    routine: Mapped["Routine | None"] = relationship(back_populates="workout_sessions")
    user: Mapped["User"] = relationship(back_populates="workout_sessions")
    workout_exercises: Mapped[list["WorkoutExercise"]] = relationship(
        back_populates="workout_session", cascade="all, delete-orphan"
    )
    workout_posts: Mapped[list["WorkoutPost"]] = relationship(back_populates="workout_session")
