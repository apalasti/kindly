from datetime import datetime
from enum import Enum
from typing import Optional

import sqlalchemy as sa
from sqlalchemy import event
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class ApplicationStatus(Enum):
    PENDING = "PENDING"
    DECLINED = "DECLINED"
    ACCEPTED = "ACCEPTED"


class Application(Base):
    __tablename__ = "application"
    __table_args__ = (
        sa.UniqueConstraint("request_id", "user_id"),
    )

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True)

    request_id: Mapped[int] = mapped_column(sa.Integer, sa.ForeignKey("request.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(sa.Integer, sa.ForeignKey("user.id"), nullable=False)

    status: Mapped[ApplicationStatus] = mapped_column(
        sa.Enum(ApplicationStatus), nullable=False, default=ApplicationStatus.PENDING
    )

    applied_at: Mapped[datetime] = mapped_column(
        sa.TIMESTAMP(timezone=True),
        nullable=False,
        server_default=sa.text("CURRENT_TIMESTAMP"),
    )

    volunteer_rating: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    help_seeker_rating: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    volunteer: Mapped["User"] = relationship("User", viewonly=True)
    request: Mapped["Request"] = relationship("Request", viewonly=True)


update_help_seeker_func = sa.DDL("""
CREATE OR REPLACE FUNCTION update_help_seeker_avg_rating_func()
RETURNS TRIGGER AS $$
DECLARE
    help_seeker_id INT;
BEGIN
    IF (OLD.help_seeker_rating IS DISTINCT FROM NEW.help_seeker_rating) THEN
        -- Get the creator_id (help seeker's ID) from the request table
        SELECT creator_id INTO help_seeker_id
        FROM request
        WHERE id = NEW.request_id;

        UPDATE "user"
        SET avg_rating = (
            SELECT COALESCE(AVG(a.help_seeker_rating), 0)
            FROM application a
            JOIN request r ON a.request_id = r.id
            WHERE r.creator_id = help_seeker_id AND a.help_seeker_rating IS NOT NULL
        )
        WHERE id = help_seeker_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
""")

update_help_seeker_trigger = sa.DDL("""
CREATE OR REPLACE TRIGGER update_avg_help_seeker_rating
AFTER UPDATE OF help_seeker_rating ON application
FOR EACH ROW
EXECUTE FUNCTION update_help_seeker_avg_rating_func();
""")

update_volunteer_func = sa.DDL("""
CREATE OR REPLACE FUNCTION update_volunteer_avg_rating_func()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.volunteer_rating IS DISTINCT FROM NEW.volunteer_rating) THEN
        UPDATE "user"
        SET avg_rating = (
            SELECT COALESCE(AVG(a.volunteer_rating), 0)
            FROM application a
            WHERE a.user_id = NEW.user_id AND a.volunteer_rating IS NOT NULL
        )
        WHERE id = NEW.user_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
""")

update_volunteer_trigger = sa.DDL("""
CREATE OR REPLACE TRIGGER update_avg_volunteer_rating
AFTER UPDATE OF volunteer_rating ON application
FOR EACH ROW
EXECUTE FUNCTION update_volunteer_avg_rating_func();
""")

event.listen(Application.__table__, "after_create", update_help_seeker_func.execute_if(dialect="postgresql"))
event.listen(Application.__table__, "after_create", update_help_seeker_trigger.execute_if(dialect="postgresql"))
event.listen(Application.__table__, "after_create", update_volunteer_func.execute_if(dialect="postgresql"))
event.listen(Application.__table__, "after_create", update_volunteer_trigger.execute_if(dialect="postgresql"))
