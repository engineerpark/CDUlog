from fastapi import APIRouter

router = APIRouter()

@router.post("/login")
async def login():
    return {"message": "Login endpoint - OAuth2 SSO to be implemented"}

@router.post("/logout")
async def logout():
    return {"message": "Logout endpoint"}

@router.get("/me")
async def get_current_user():
    return {"message": "Current user endpoint"}