from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_assets():
    return {"message": "List all outdoor units"}

@router.post("/")
async def create_asset():
    return {"message": "Create new outdoor unit"}

@router.get("/{asset_id}")
async def get_asset(asset_id: int):
    return {"message": f"Get outdoor unit {asset_id}"}

@router.put("/{asset_id}")
async def update_asset(asset_id: int):
    return {"message": f"Update outdoor unit {asset_id}"}

@router.delete("/{asset_id}")
async def delete_asset(asset_id: int):
    return {"message": f"Delete outdoor unit {asset_id}"}