from sqlalchemy import Boolean, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class RefreshToken(Base):
    __tablename__ = "refresh_token"
    __table_args__ = (
        UniqueConstraint("user_id", "token"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("user.id"), nullable=False)
    token: Mapped[str] = mapped_column(String, nullable=False)
