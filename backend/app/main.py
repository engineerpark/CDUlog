from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.exceptions import (
    MaintenanceException,
    global_exception_handler,
    maintenance_exception_handler
)
from app.core.middleware import RequestLoggingMiddleware, SecurityHeadersMiddleware
from app.api import health, auth, assets, maintenance
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

# Add middleware (order matters)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add exception handlers
app.add_exception_handler(MaintenanceException, maintenance_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

app.include_router(health.router, prefix=f"{settings.API_V1_STR}/health", tags=["health"])
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(assets.router, prefix=f"{settings.API_V1_STR}/assets", tags=["assets"])
app.include_router(maintenance.router, prefix=f"{settings.API_V1_STR}/maintenance", tags=["maintenance"])

@app.get("/")
async def root():
    return {"message": "실외기 유지보수 관리 시스템 API"}