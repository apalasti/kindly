from datetime import datetime
from typing import Optional

from sqlalchemy import DDL, TIMESTAMP, ForeignKey, Integer, String, event, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql.schema import UniqueConstraint

from .base import Base


class Application(Base):
    __tablename__ = "application"
    __table_args__ = (
        UniqueConstraint("request_id", "user_id"),
    )
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    request_id: Mapped[int] = mapped_column(Integer, ForeignKey("request.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("user.id"), nullable=False)

    # Possible values PENDING, DECLINED, ACCEPTED
    status: Mapped[str] = mapped_column(String(length=10), nullable=False, default="PENDING")

    applied_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    volunteer_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    help_seeker_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    volunteer: Mapped["User"] = relationship("User", viewonly=True)
    request: Mapped["Request"] = relationship("Request", viewonly=True)


update_help_seeker_func = DDL("""
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

update_help_seeker_trigger = DDL("""
CREATE OR REPLACE TRIGGER update_avg_help_seeker_rating
AFTER UPDATE OF help_seeker_rating ON application
FOR EACH ROW
EXECUTE FUNCTION update_help_seeker_avg_rating_func();
""")

update_volunteer_func = DDL("""
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

update_volunteer_trigger = DDL("""
CREATE OR REPLACE TRIGGER update_avg_volunteer_rating
AFTER UPDATE OF volunteer_rating ON application
FOR EACH ROW
EXECUTE FUNCTION update_volunteer_avg_rating_func();
""")

event.listen(Application.__table__, "after_create", update_help_seeker_func.execute_if(dialect="postgresql"))
event.listen(Application.__table__, "after_create", update_help_seeker_trigger.execute_if(dialect="postgresql"))
event.listen(Application.__table__, "after_create", update_volunteer_func.execute_if(dialect="postgresql"))
event.listen(Application.__table__, "after_create", update_volunteer_trigger.execute_if(dialect="postgresql"))
