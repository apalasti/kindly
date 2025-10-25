import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class RefreshToken(Base):
    __tablename__ = "refresh_token"
    __table_args__ = (
        sa.UniqueConstraint("user_id", "token"),
    )

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(sa.Integer, sa.ForeignKey("user.id"), nullable=False)
    token: Mapped[str] = mapped_column(sa.String, nullable=False)
