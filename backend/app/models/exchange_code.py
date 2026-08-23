from datetime import UTC, datetime, timedelta
from uuid import UUID as PyUUID, uuid4

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy import UUID as SqlUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.config import settings
from app.database import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User


class ExchangeCode(Base):
    __tablename__ = "exchange_codes"

    id: Mapped[PyUUID] = mapped_column(
        SqlUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_id: Mapped[PyUUID] = mapped_column(
        SqlUUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    code_hash: Mapped[str] = mapped_column(
        String(64), nullable=False, unique=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC)
        + timedelta(seconds=settings.EXCHANGE_CODE_EXPIRE_SECONDS),
    )
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    user: Mapped["User"] = relationship(back_populates="exchange_codes")