from datetime import UTC, datetime
from uuid import UUID as PyUUID, uuid4

from sqlalchemy import UUID as SqlUUID, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.oauth_account import OAuthAccount
    from app.models.routine import Routine
    from app.models.workout_session import WorkoutSession


class User(Base):
    __tablename__ = "users"

    id: Mapped[PyUUID] = mapped_column(
        SqlUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    username: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )
    routines: Mapped[list["Routine"]] = relationship(back_populates="user")
    workout_sessions: Mapped[list["WorkoutSession"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    oauth_accounts: Mapped[list["OAuthAccount"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
