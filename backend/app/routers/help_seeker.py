from typing import Annotated, List

from fastapi import APIRouter, Query

from ..pagination import Pagination
from ..interfaces.ai_service import CategoryGenerationRequest
from ..interfaces.common_service import RequestTypeInfo
from ..interfaces.application_service import RateVolunteerData
from ..interfaces.request_service import (
    CreateOrUpdateRequestData,
    MyRequestsFilter,
    RequestDetailForHelpSeeker,
    RequestInfo,
)
from ..dependencies import (
    AIServiceDep,
    ApplicationServiceDep,
    RequestServiceDep,
    SuccessResponse,
    UserDataDep,
)


router = APIRouter(prefix="/help-seeker/requests", tags=["help-seeker"])


@router.get("/{request_id}")
async def get_request(
    user: UserDataDep, request_service: RequestServiceDep, request_id: int
) -> SuccessResponse[RequestDetailForHelpSeeker]:
    result = await request_service.get_request_for_help_seeker(user, request_id)
    return SuccessResponse(
        data=result
    )


@router.post("/")
async def create_request(
    user: UserDataDep, request_service: RequestServiceDep, body: CreateOrUpdateRequestData
) -> SuccessResponse[RequestInfo]:
    request_info = await request_service.create_request(user, body)
    return SuccessResponse(
        data=request_info
    )


@router.put("/{request_id}")
async def update_request(
    user: UserDataDep, request_service: RequestServiceDep, body: CreateOrUpdateRequestData, request_id: int
) -> SuccessResponse[RequestInfo]:
    request_info = await request_service.update_request(user, request_id, body)
    return SuccessResponse(
        data=request_info
    )


@router.delete("/{request_id}")
async def delete_request(
    user: UserDataDep, request_service: RequestServiceDep, request_id: int
) -> SuccessResponse[None]:
    await request_service.delete_request(user, request_id)
    return SuccessResponse(
        data=None,
    )


@router.get("/")
async def get_my_requests(
    user: UserDataDep, request_service: RequestServiceDep, body: Annotated[MyRequestsFilter, Query()]
) -> Pagination[RequestInfo]:
    return await request_service.get_my_requests(user, body)


@router.patch("/{request_id}/complete")
async def complete_request(
    user: UserDataDep, request_service: RequestServiceDep, request_id: int
) -> SuccessResponse[None]:
    await request_service.complete_request(user, request_id)
    return SuccessResponse(data=None)


@router.patch("/{request_id}/applications/{volunteer_id}/accept")
async def accept_application(
    user: UserDataDep, application_service: ApplicationServiceDep, request_id: int, volunteer_id: int
) -> SuccessResponse[None]:
    await application_service.accept_application(user, request_id, volunteer_id)
    return SuccessResponse(data=None)


@router.post("/{request_id}/rate-volunteer")
async def rate_volunteer(
    user: UserDataDep, application_service: ApplicationServiceDep, request_id: int, body: RateVolunteerData
) -> SuccessResponse[None]:
    await application_service.rate_volunteer(user, request_id, body)
    return SuccessResponse(data=None)


@router.post("/generate-categories")
async def generate_categories(
    user: UserDataDep, ai_service: AIServiceDep, body: CategoryGenerationRequest
) -> SuccessResponse[List[RequestTypeInfo]]:
    return SuccessResponse(data=await ai_service.generate_categories(user, body))
