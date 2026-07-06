from uuid import UUID as PyUUID
from uuid import uuid4

from sqlalchemy import ForeignKey, Integer
from sqlalchemy import UUID as SqlUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.routine import Routine
    from app.models.exercise import Exercise
    from app.models.routine_set import RoutineSet


class RoutineExercise(Base):
    __tablename__ = "routine_exercises"
    id: Mapped[PyUUID] = mapped_column(
        SqlUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    routine_id: Mapped[PyUUID] = mapped_column(
        SqlUUID(as_uuid=True), ForeignKey("routines.id"), nullable=False
    )
    exercise_id: Mapped[PyUUID] = mapped_column(
        SqlUUID(as_uuid=True), ForeignKey("exercises.id"), nullable=False
    )
    order: Mapped[int] = mapped_column(Integer, nullable=False)

    routine: Mapped["Routine"] = relationship(back_populates="routine_exercises")
    exercise: Mapped["Exercise"] = relationship(back_populates="routine_exercises")
    routine_sets: Mapped[list["RoutineSet"]] = relationship(
        back_populates="routine_exercise", cascade="all, delete-orphan"
    )
