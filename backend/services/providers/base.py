from abc import ABC, abstractmethod
from typing import List, Optional
from models.schemas import AirQualityResponse, StationItem, TrendResponse, CitySummary

class BaseAirQualityProvider(ABC):
    """Abstract Base Class for Air Quality Data Providers."""

    @abstractmethod
    async def get_cities(self) -> List[CitySummary]:
        """Return list of supported cities with summary air quality."""
        pass

    @abstractmethod
    async def get_latest_air_quality(self, city: str) -> AirQualityResponse:
        """Fetch latest air quality snapshot for a given city."""
        pass

    @abstractmethod
    async def get_historical_data(self, city: str, pollutant: str, time_range: str) -> TrendResponse:
        """Fetch historical trends for a given city, pollutant, and time range."""
        pass

    @abstractmethod
    async def get_stations(self) -> List[StationItem]:
        """Fetch available monitoring stations with geographic coordinates."""
        pass
