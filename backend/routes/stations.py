from typing import List
from fastapi import APIRouter
from models.schemas import StationItem
from services.air_quality_service import air_quality_service

router = APIRouter(tags=["Stations"])

@router.get("/stations", response_model=List[StationItem])
async def get_stations():
    """Retrieve all available air monitoring stations with geographic coordinates."""
    return await air_quality_service.get_stations()
