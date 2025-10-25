import asyncio
from datetime import datetime, timedelta
import logging

from app.db import async_session, create_db_and_tables
from app.models import RequestType
from app.services import AuthService
from app.interfaces.auth_service import RegistrationData
from app.services.request_service import RequestService
from app.interfaces.request_service import CreateOrUpdateRequestData
from app.services.application_service import ApplicationService


logger = logging.getLogger(__name__)


async def insert_dummy_data():
    if await create_db_and_tables():
        logger.info("Skipping dummy data insertion since data is already there")
        return

    async with async_session() as session:
        auth_service = AuthService(session)
        request_service = RequestService(session, auth_service)
        application_service = ApplicationService(session, auth_service)

        session.add_all([
            RequestType(name="Shopping"),
            RequestType(name="Dog Walking"),
            RequestType(name="Cleaning"),
        ])
        await session.commit()

        # Register a new user using AuthService and RegistrationData
        user1 = await auth_service.register(RegistrationData(
            first_name="Alice",
            last_name="Smith",
            email="alice@example.com",
            password="alicepassword123",
            date_of_birth=datetime.strptime("1990-01-01", "%Y-%m-%d").date(),
            about_me="A friendly help seeker.",
            is_volunteer=False
        ))

        user2 = await auth_service.register(RegistrationData(
            first_name="Bob",
            last_name="Johnson",
            email="bob@example.com",
            password="bobpassword123",
            date_of_birth=datetime.strptime("1985-05-10", "%Y-%m-%d").date(),
            about_me="An enthusiastic volunteer.",
            is_volunteer=True
        ))

        request1 = await request_service.create_request(
            auth_service.authenticate(user1.tokens.access_token),
            CreateOrUpdateRequestData(
                name="Groceries shopping",
                description="Need help buying groceries from the supermarket.",
                reward=1000,
                start=datetime.now() + timedelta(days=1),
                end=datetime.now() + timedelta(days=1, hours=2),
                address="123 Main St, Anytown",
                longitude=19.0402,
                latitude=47.4979,
                request_type_ids=[1],
            ),
        )
        request2 = await request_service.create_request(
            auth_service.authenticate(user1.tokens.access_token),
            CreateOrUpdateRequestData(
                name="Walk my dog",
                description="My dog needs a walk in the park.",
                reward=500,
                start=datetime.now() + timedelta(days=2),
                end=datetime.now() + timedelta(days=2, hours=1),
                address="456 Oak Ave, Anytown",
                longitude=19.0402,
                latitude=47.4979,
                request_type_ids=[2],
            ),
        )
        request3 = await request_service.create_request(
            auth_service.authenticate(user1.tokens.access_token),
            CreateOrUpdateRequestData(
                name="Apartment cleaning",
                description="Looking for someone to clean my apartment.",
                reward=2000,
                start=datetime.now() + timedelta(days=3),
                end=datetime.now() + timedelta(days=3, hours=4),
                address="789 Pine Ln, Anytown",
                longitude=19.0402,
                latitude=47.4979,
                request_type_ids=[3],
            ),
        )

        await application_service.create_application(
            auth_service.authenticate(user2.tokens.access_token),
            request1.id
        )
        await application_service.accept_application(
            auth_service.authenticate(user1.tokens.access_token),
            request1.id,
            user2.user.id,
        )
        await application_service.create_application(
            auth_service.authenticate(user2.tokens.access_token),
            request2.id
        )
        logger.info("Successfully inserted dummy data into the database")


if __name__ == "__main__":
    logger.setLevel(logging.INFO)
    asyncio.run(insert_dummy_data())
