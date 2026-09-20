import logging
from typing import List, Optional
from models.schemas import AirQualityResponse, StationItem, TrendResponse, CitySummary
from services.providers.base import BaseAirQualityProvider
from services.providers.mock_provider import MockAirQualityProvider
from services.providers.openaq_provider import OpenAQProvider
from utils.config import OPENAQ_API_KEY, is_openaq_configured

logger = logging.getLogger("cleanair.service")

class AirQualityService:
    """
    Main Air Quality Service Abstraction.
    Delegates requests to either the live OpenAQProvider (if API key is supplied)
    or MockAirQualityProvider (with clearly labelled demo state).
    """

    def __init__(self):
        self.mock_provider = MockAirQualityProvider()
        self.live_provider: Optional[OpenAQProvider] = None
        if is_openaq_configured():
            logger.info("OpenAQ API key detected. Initializing live OpenAQ provider.")
            self.live_provider = OpenAQProvider(api_key=OPENAQ_API_KEY)
        else:
            logger.info("No OpenAQ API key detected. Running in DEMO mode.")

    @property
    def active_provider(self) -> BaseAirQualityProvider:
        if self.live_provider:
            return self.live_provider
        return self.mock_provider

    async def get_cities(self) -> List[CitySummary]:
        return await self.active_provider.get_cities()

    async def get_latest_air_quality(self, city: str) -> AirQualityResponse:
        return await self.active_provider.get_latest_air_quality(city)

    async def get_historical_data(self, city: str, pollutant: str = "PM2.5", time_range: str = "24 hours") -> TrendResponse:
        return await self.active_provider.get_historical_data(city, pollutant, time_range)

    async def get_stations(self) -> List[StationItem]:
        return await self.active_provider.get_stations()

# Singleton instance
air_quality_service = AirQualityService()
