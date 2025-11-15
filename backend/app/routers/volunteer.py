from typing import Annotated

from fastapi import Query
from fastapi.routing import APIRouter

from ..pagination import Pagination
from ..interfaces.request_service import (
    RequestDetailForVolunteer,
    RequestWithApplicationStatus,
    RequestsFilter,
)
from ..interfaces.application_service import RateSeekerData
from ..dependencies import (
    RequestServiceDep,
    SuccessResponse,
    UserDataDep,
    ApplicationServiceDep,
)


router = APIRouter(prefix="/volunteer/requests", tags=["volunteer"])

@router.get("/")
async def get_requests(
    request_service: RequestServiceDep, user: UserDataDep, body: Annotated[RequestsFilter, Query()]
) -> Pagination[RequestWithApplicationStatus]:
    return await request_service.get_requests(user, body)


@router.get("/{request_id}")
async def get_request(
    request_service: RequestServiceDep, user: UserDataDep, request_id: int
) -> SuccessResponse[RequestDetailForVolunteer]:
    return SuccessResponse(
        data=await request_service.get_request_for_volunteer(user, request_id),
    )


@router.post("/{request_id}/application")
async def create_application(
    application_service: ApplicationServiceDep, 
    user: UserDataDep, 
    request_id: int
) -> SuccessResponse[None]:
    application = await application_service.create_application(user, request_id)
    return SuccessResponse(
        data=None,
        message="Application submitted successfully"
    )


@router.delete("/{request_id}/application")
async def delete_application(
    application_service: ApplicationServiceDep, 
    user: UserDataDep, 
    request_id: int
) -> SuccessResponse[None]:
    await application_service.delete_application(user, request_id)
    return SuccessResponse(
        data=None,
        message="Application withdrawn successfully"
    )


@router.post("/{request_id}/rate-seeker")
async def rate_seeker(
    application_service: ApplicationServiceDep, 
    user: UserDataDep, 
    request_id: int, 
    body: RateSeekerData
) -> SuccessResponse[None]:
    await application_service.rate_seeker(user, request_id, body)
    return SuccessResponse(
        data=None,
        message="Rating submitted successfully"
    )
