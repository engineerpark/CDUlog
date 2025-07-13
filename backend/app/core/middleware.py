from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import time
import uuid
import logging

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Log request
        start_time = time.time()
        logger.info(
            f"Request started - ID: {request_id}, Method: {request.method}, "
            f"URL: {request.url}, Client: {request.client.host if request.client else 'unknown'}"
        )
        
        try:
            response = await call_next(request)
            
            # Log response
            process_time = time.time() - start_time
            logger.info(
                f"Request completed - ID: {request_id}, Status: {response.status_code}, "
                f"Duration: {process_time:.3f}s"
            )
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as exc:
            process_time = time.time() - start_time
            logger.error(
                f"Request failed - ID: {request_id}, Error: {str(exc)}, "
                f"Duration: {process_time:.3f}s", exc_info=True
            )
            raise

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response