from uuid import UUID as PyUUID
from uuid import uuid4


from sqlalchemy import ARRAY, String, Enum as SqlEnum
from sqlalchemy import UUID as SqlUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.enums import Equipment, MuscleGroup

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.routine_exercise import RoutineExercise
    from app.models.workout_exercise import WorkoutExercise


class Exercise(Base):
    __tablename__ = "exercises"
    id: Mapped[PyUUID] = mapped_column(
        SqlUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    primary_muscle: Mapped[MuscleGroup] = mapped_column(SqlEnum(MuscleGroup), nullable=False)
    secondary_muscles: Mapped[list[MuscleGroup]] = mapped_column(
        ARRAY(SqlEnum(MuscleGroup)), default=list
    )
    equipment: Mapped[Equipment] = mapped_column(SqlEnum(Equipment), nullable=False)
    media_url: Mapped[str | None] = mapped_column(String(255), nullable=True)

    routine_exercises: Mapped[list["RoutineExercise"]] = relationship(
        back_populates="exercise"
    )
    workout_exercises: Mapped[list["WorkoutExercise"]] = relationship(
        back_populates="exercise"
    )
