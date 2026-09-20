from fastapi import APIRouter, Query
from models.schemas import TrendResponse
from services.air_quality_service import air_quality_service

router = APIRouter(tags=["Trends"])

@router.get("/trends/{city}", response_model=TrendResponse)
async def get_trends(
    city: str,
    pollutant: str = Query(default="PM2.5", description="Pollutant: PM2.5, PM10, NO2, SO2, CO, O3"),
    time_range: str = Query(default="24 hours", description="Time range: 24 hours, 7 days, 30 days")
):
    """Retrieve trends, averages, min/max, and chart points for a specific city and pollutant."""
    return await air_quality_service.get_historical_data(city, pollutant, time_range)
