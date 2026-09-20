from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class PollutantMeasurement(BaseModel):
    name: str
    value: Optional[float] = None
    unit: str
    timestamp: Optional[str] = None
    status: str = "available"  # "available" or "unavailable"

class Coordinates(BaseModel):
    latitude: float
    longitude: float

class AirQualityResponse(BaseModel):
    city: str
    country: str
    source: str = "OpenAQ"
    is_demo: bool = False
    last_updated: Optional[str] = None
    aqi: Optional[int] = None
    aqi_status: str = "Unavailable"  # Good, Moderate, Unhealthy for Sensitive Groups, Unhealthy, Very Unhealthy, Hazardous, Unavailable
    aqi_standard: str = "US EPA AQI"
    dominant_pollutant: Optional[str] = None
    station: Optional[str] = None
    coordinates: Optional[Coordinates] = None
    pollutants: Dict[str, Optional[PollutantMeasurement]] = Field(default_factory=dict)
    message: Optional[str] = None

class StationItem(BaseModel):
    id: str
    name: str
    city: str
    country: str
    coordinates: Coordinates
    available_pollutants: List[str]
    latest_measurement: Optional[str] = None
    timestamp: Optional[str] = None
    source: str = "OpenAQ"
    is_demo: bool = False

class TrendPoint(BaseModel):
    timestamp: str
    value: float

class TrendResponse(BaseModel):
    city: str
    pollutant: str
    unit: str
    time_range: str
    data: List[TrendPoint] = Field(default_factory=list)
    average: Optional[float] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    latest_value: Optional[float] = None
    is_demo: bool = False
    message: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    city: Optional[str] = None
    current_data: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    reply: str
    source: str = "CleanAir AI"
    timestamp: str
    is_demo: bool = False
    provider: str = "Groq"

class CitySummary(BaseModel):
    city: str
    country: str
    region: str
    coordinates: Coordinates
    aqi: Optional[int] = None
    aqi_status: str = "Unavailable"
    pm25: Optional[float] = None
    last_updated: Optional[str] = None
    is_demo: bool = False
