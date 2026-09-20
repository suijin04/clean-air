from fastapi import APIRouter, Query
from models.schemas import AirQualityResponse, TrendResponse
from services.air_quality_service import air_quality_service

router = APIRouter(prefix="/air-quality", tags=["Air Quality"])

@router.get("/{city}", response_model=AirQualityResponse)
async def get_air_quality(city: str):
    """Retrieve full air quality snapshot for a given city including all available pollutant cards."""
    return await air_quality_service.get_latest_air_quality(city)

@router.get("/{city}/latest", response_model=AirQualityResponse)
async def get_latest_air_quality(city: str):
    """Alias to retrieve latest air quality measurements."""
    return await air_quality_service.get_latest_air_quality(city)

@router.get("/{city}/history", response_model=TrendResponse)
async def get_air_quality_history(
    city: str,
    pollutant: str = Query(default="PM2.5", description="Target pollutant: PM2.5, PM10, NO2, SO2, CO, O3"),
    time_range: str = Query(default="24 hours", description="Time period: 24 hours, 7 days, 30 days")
):
    """Retrieve historical pollutant measurements for a city."""
    return await air_quality_service.get_historical_data(city, pollutant, time_range)
