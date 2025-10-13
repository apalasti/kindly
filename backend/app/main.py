from contextlib import asynccontextmanager

from fastapi import FastAPI, status
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.responses import JSONResponse

from .db import create_db_and_tables
from .routers import auth, common, help_seeker


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(auth.router, prefix="/api/v1")
app.include_router(common.router, prefix="/api/v1")
app.include_router(help_seeker.router, prefix="/api/v1")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    return JSONResponse(
        {
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request",
                "details": [
                    {"field": e["loc"], "message": e["msg"]}
                    for e in exc.errors()
                ],
            },
        },
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
    )


@app.exception_handler(HTTPException)
async def validation_exception_handler(request, exc: HTTPException):
    error_codes = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        409: "CONFLICT",
        500: "INTERNAL_ERROR"
    }
    
    return JSONResponse(
        {
            "success": False,
            "error": {
                "code": error_codes.get(exc.status_code, f"HTTP_ERROR_{exc.status_code}"),
                "message": exc.detail,
                "details": [],
            },
        },
        status_code=exc.status_code,
    )
