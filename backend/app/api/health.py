from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.base import get_db
import redis
from app.core.config import settings

router = APIRouter()

@router.get("/")
async def health_check():
    return {"status": "healthy", "service": "실외기 유지보수 관리 시스템"}

@router.get("/db")
async def health_db(db: Session = Depends(get_db)):
    try:
        db.execute("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

@router.get("/redis")
async def health_redis():
    try:
        r = redis.from_url(settings.REDIS_URL)
        r.ping()
        return {"status": "healthy", "redis": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "redis": "disconnected", "error": str(e)}