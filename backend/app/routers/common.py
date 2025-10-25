from typing import List

from fastapi.routing import APIRouter

from ..interfaces.auth_service import UserInfo
from ..interfaces.common_service import RequestTypeInfo, UpdateProfileData
from ..dependencies import CommonServiceDep, SuccessResponse, UserDataDep

router = APIRouter(
    prefix="/common",
)


@router.get("/profile")
async def get_profile(
    common_service: CommonServiceDep, user_data: UserDataDep
) -> SuccessResponse[UserInfo]:
    user_info = await common_service.get_user(user_data["id"])
    return SuccessResponse(
        data=user_info
    )


@router.put("/profile")
async def update_profile(
    common_service: CommonServiceDep, user_data: UserDataDep, body: UpdateProfileData
) -> SuccessResponse[UserInfo]:
    user_info =  await common_service.update_profile(user_data, body)
    return SuccessResponse(
        data=user_info
    )


@router.get("/users/{user_id}")
async def get_user(common_service: CommonServiceDep, _: UserDataDep, user_id: int):
    user_info = await common_service.get_user(user_id)
    return SuccessResponse(
        data=user_info
    )


@router.get("/request-types")
async def list_request_types(
    common_service: CommonServiceDep, user_data: UserDataDep
) -> SuccessResponse[List[RequestTypeInfo]]:
    return SuccessResponse(data=await common_service.list_request_types())
