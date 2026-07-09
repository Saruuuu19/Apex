from uuid import UUID as PyUUID
from uuid import uuid4

from sqlalchemy import ForeignKey, String
from sqlalchemy import UUID as SqlUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from app.models.user import User
    from app.models.routine_exercise import RoutineExercise
    from app.models.workout_session import WorkoutSession


class Routine(Base):
    __tablename__ = "routines"
    id: Mapped[PyUUID] = mapped_column(
        SqlUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    user_id: Mapped[PyUUID] = mapped_column(
        SqlUUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    user: Mapped["User"] = relationship(back_populates="routines")
    routine_exercises: Mapped[list["RoutineExercise"]] = relationship(
        back_populates="routine", cascade="all, delete-orphan"
    )
    workout_sessions: Mapped[list["WorkoutSession"]] = relationship(
        back_populates="routine"
    )
