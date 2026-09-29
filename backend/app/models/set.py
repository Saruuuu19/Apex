from decimal import Decimal
from uuid import UUID as PyUUID
from uuid import uuid4

from sqlalchemy import ForeignKey, Numeric, UniqueConstraint
from sqlalchemy import UUID as SqlUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.enums import SetType

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.workout_exercise import WorkoutExercise


class Set(Base):
    __tablename__ = "sets"
    __table_args__ = (
        UniqueConstraint(
            "workout_exercise_id",
            "order",
            name="uq_sets_workout_exercise_order",
        ),
    )

    id: Mapped[PyUUID] = mapped_column(
        SqlUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    workout_exercise_id: Mapped[PyUUID] = mapped_column(
        SqlUUID(as_uuid=True), ForeignKey("workout_exercises.id"), nullable=False
    )
    order: Mapped[int] = mapped_column(nullable=False)
    set_type: Mapped[SetType] = mapped_column(default=SetType.NORMAL)
    reps: Mapped[int | None] = mapped_column(nullable=True)
    weight: Mapped[Decimal | None] = mapped_column(Numeric(6, 2), nullable=True)
    rpe: Mapped[Decimal | None] = mapped_column(Numeric(3, 1), nullable=True)
    completed: Mapped[bool] = mapped_column(default=False, nullable=False)

    workout_exercise: Mapped["WorkoutExercise"] = relationship(back_populates="sets")
