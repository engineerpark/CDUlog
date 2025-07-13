from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from typing import Union
import logging

logger = logging.getLogger(__name__)

class MaintenanceException(HTTPException):
    def __init__(self, status_code: int, detail: str, headers: dict = None):
        super().__init__(status_code=status_code, detail=detail, headers=headers)

class AssetNotFoundException(MaintenanceException):
    def __init__(self, asset_id: Union[int, str]):
        super().__init__(
            status_code=404,
            detail=f"Asset with ID {asset_id} not found"
        )

class DatabaseConnectionException(MaintenanceException):
    def __init__(self):
        super().__init__(
            status_code=503,
            detail="Database connection failed"
        )

class AuthenticationException(MaintenanceException):
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=401,
            detail=detail
        )

class ValidationException(MaintenanceException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=422,
            detail=detail
        )

async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(f"Global exception: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "예상치 못한 오류가 발생했습니다.",
            "request_id": getattr(request.state, "request_id", None)
        }
    )

async def maintenance_exception_handler(request: Request, exc: MaintenanceException) -> JSONResponse:
    logger.warning(f"Maintenance exception: {exc.detail}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.__class__.__name__,
            "message": exc.detail,
            "request_id": getattr(request.state, "request_id", None)
        }
    )