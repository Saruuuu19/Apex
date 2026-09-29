from uuid import UUID as PyUUID, uuid4

from sqlalchemy import UUID as SqlUUID, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.workout_session import WorkoutSession
    from app.models.exercise import Exercise
    from app.models.set import Set


class WorkoutExercise(Base):
    __tablename__ = "workout_exercises"
    __table_args__ = (
        UniqueConstraint(
            "workout_session_id",
            "order",
            name="uq_workout_exercises_session_order",
        ),
    )

    id: Mapped[PyUUID] = mapped_column(
        SqlUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    workout_session_id: Mapped[PyUUID] = mapped_column(
        SqlUUID(as_uuid=True), ForeignKey("workout_sessions.id"), nullable=False
    )
    exercise_id: Mapped[PyUUID] = mapped_column(
        SqlUUID(as_uuid=True), ForeignKey("exercises.id"), nullable=False
    )
    order: Mapped[int] = mapped_column(nullable=False)

    workout_session: Mapped["WorkoutSession"] = relationship(
        back_populates="workout_exercises"
    )
    exercise: Mapped["Exercise"] = relationship(back_populates="workout_exercises")
    sets: Mapped[list["Set"]] = relationship(
        back_populates="workout_exercise",
        cascade="all, delete-orphan",
        order_by="Set.order",
    )
