from typing import List
from fastapi import APIRouter
from models.schemas import CitySummary
from services.air_quality_service import air_quality_service

router = APIRouter(tags=["Cities"])

@router.get("/cities", response_model=List[CitySummary])
async def get_cities():
    """Retrieve list of major cities with current air quality summary."""
    return await air_quality_service.get_cities()
