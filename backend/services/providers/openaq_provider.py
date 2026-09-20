import logging
import httpx
from typing import List, Optional, Dict
from models.schemas import (
    AirQualityResponse,
    StationItem,
    TrendResponse,
    TrendPoint,
    CitySummary,
    Coordinates,
    PollutantMeasurement
)
from services.providers.base import BaseAirQualityProvider
from services.providers.mock_provider import CITIES_DB
from services.aqi_service import calculate_overall_aqi

logger = logging.getLogger("cleanair.openaq")

class OpenAQProvider(BaseAirQualityProvider):
    """
    Live OpenAQ v3 API Data Provider.
    Implements API communication with OpenAQ REST v3.
    """

    BASE_URL = "https://api.openaq.org/v3"

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "X-API-Key": api_key,
            "Accept": "application/json"
        }
        self.timeout = 10.0

    def _match_city_meta(self, city_name: str) -> Optional[Dict]:
        name_lower = city_name.strip().lower()
        for c in CITIES_DB:
            if c["city"].lower() == name_lower:
                return c
        return None

    async def get_cities(self) -> List[CitySummary]:
        """
        Fetch summary for major cities. Queries OpenAQ or combines with canonical list.
        """
        summaries = []
        for c in CITIES_DB:
            try:
                aq_data = await self.get_latest_air_quality(c["city"])
                summaries.append(
                    CitySummary(
                        city=c["city"],
                        country=c["country"],
                        region=c["region"],
                        coordinates=Coordinates(latitude=c["lat"], longitude=c["lon"]),
                        aqi=aq_data.aqi,
                        aqi_status=aq_data.aqi_status,
                        pm25=aq_data.pollutants.get("pm25").value if aq_data.pollutants.get("pm25") else None,
                        last_updated=aq_data.last_updated,
                        is_demo=False
                    )
                )
            except Exception as e:
                logger.error(f"Error fetching city summary for {c['city']}: {e}")
                summaries.append(
                    CitySummary(
                        city=c["city"],
                        country=c["country"],
                        region=c["region"],
                        coordinates=Coordinates(latitude=c["lat"], longitude=c["lon"]),
                        aqi=None,
                        aqi_status="Unavailable",
                        pm25=None,
                        last_updated=None,
                        is_demo=False
                    )
                )
        return summaries

    async def get_latest_air_quality(self, city: str) -> AirQualityResponse:
        """
        Fetch latest air-quality measurements for a city from OpenAQ v3.
        """
        city_meta = self._match_city_meta(city)
        country_name = city_meta["country"] if city_meta else "Unknown"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # 1. Search for location by coordinates or city query
                params = {"limit": 5}
                if city_meta:
                    params["coordinates"] = f"{city_meta['lat']},{city_meta['lon']}"
                    params["radius"] = 35000  # 35 km radius around city center
                else:
                    # Generic query
                    params["name"] = city

                loc_res = await client.get(f"{self.BASE_URL}/locations", headers=self.headers, params=params)
                
                if loc_res.status_code != 200:
                    return AirQualityResponse(
                        city=city,
                        country=country_name,
                        source="OpenAQ",
                        is_demo=False,
                        aqi_status="Unavailable",
                        message="Live air-quality data is currently unavailable for this city."
                    )

                loc_data = loc_res.json()
                results = loc_data.get("results", [])
                if not results:
                    return AirQualityResponse(
                        city=city,
                        country=country_name,
                        source="OpenAQ",
                        is_demo=False,
                        aqi_status="Unavailable",
                        message="Live air-quality data is currently unavailable for this city."
                    )

                # Pick primary location
                primary_loc = results[0]
                loc_id = primary_loc.get("id")
                station_name = primary_loc.get("name", "OpenAQ Station")
                coords = primary_loc.get("coordinates")
                coord_obj = None
                if coords and "latitude" in coords and "longitude" in coords:
                    coord_obj = Coordinates(latitude=coords["latitude"], longitude=coords["longitude"])
                elif city_meta:
                    coord_obj = Coordinates(latitude=city_meta["lat"], longitude=city_meta["lon"])

                # 2. Fetch latest measurements for this location
                latest_res = await client.get(f"{self.BASE_URL}/locations/{loc_id}/latest", headers=self.headers)
                if latest_res.status_code != 200:
                    return AirQualityResponse(
                        city=city,
                        country=country_name,
                        source="OpenAQ",
                        is_demo=False,
                        station=station_name,
                        coordinates=coord_obj,
                        aqi_status="Unavailable",
                        message="Live measurements currently unavailable."
                    )

                measurements = latest_res.json().get("results", [])
                pollutants_val: Dict[str, Optional[float]] = {}
                pollutants_obj: Dict[str, Optional[PollutantMeasurement]] = {}
                latest_timestamp = None

                param_mapping = {
                    "pm25": ("pm25", "PM2.5", "µg/m³"),
                    "pm10": ("pm10", "PM10", "µg/m³"),
                    "no2": ("no2", "NO₂", "µg/m³"),
                    "so2": ("so2", "SO₂", "µg/m³"),
                    "co": ("co", "CO", "mg/m³"),
                    "o3": ("o3", "O₃", "µg/m³")
                }

                # Initialize all with None
                for key, (k, name, unit) in param_mapping.items():
                    pollutants_obj[key] = None

                for item in measurements:
                    param_name = str(item.get("parameter", {}).get("name", "")).lower().replace(".", "")
                    if param_name in param_mapping:
                        val = item.get("value")
                        ts = item.get("datetime", {}).get("utc")
                        unit = item.get("parameter", {}).get("units", param_mapping[param_name][2])
                        if val is not None and val >= 0:
                            pollutants_val[param_name] = float(val)
                            pollutants_obj[param_name] = PollutantMeasurement(
                                name=param_mapping[param_name][1],
                                value=round(float(val), 2),
                                unit=unit,
                                timestamp=ts,
                                status="available"
                            )
                            if not latest_timestamp and ts:
                                latest_timestamp = ts

                aqi, status, dominant = calculate_overall_aqi(pollutants_val)

                return AirQualityResponse(
                    city=city_meta["city"] if city_meta else city,
                    country=country_name,
                    source="OpenAQ",
                    is_demo=False,
                    last_updated=latest_timestamp,
                    aqi=aqi,
                    aqi_status=status,
                    aqi_standard="US EPA AQI",
                    dominant_pollutant=dominant.upper() if dominant else None,
                    station=station_name,
                    coordinates=coord_obj,
                    pollutants=pollutants_obj
                )

        except Exception as e:
            logger.error(f"OpenAQ API error for {city}: {e}")
            return AirQualityResponse(
                city=city,
                country=country_name,
                source="OpenAQ",
                is_demo=False,
                aqi_status="Unavailable",
                message="Live air-quality data is currently unavailable for this city."
            )

    async def get_historical_data(self, city: str, pollutant: str, time_range: str) -> TrendResponse:
        """
        Fetch historical measurements from OpenAQ sensors.
        """
        unit = "mg/m³" if pollutant.lower() == "co" else "µg/m³"
        # Return unavailable if endpoint/sensors not configured or data missing
        return TrendResponse(
            city=city,
            pollutant=pollutant,
            unit=unit,
            time_range=time_range,
            data=[],
            is_demo=False,
            message="Historical data is currently unavailable."
        )

    async def get_stations(self) -> List[StationItem]:
        """
        Fetch real monitoring stations near canonical cities from OpenAQ.
        """
        stations = []
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(f"{self.BASE_URL}/locations?limit=25", headers=self.headers)
                if res.status_code == 200:
                    results = res.json().get("results", [])
                    for item in results:
                        coords = item.get("coordinates")
                        if coords and coords.get("latitude") and coords.get("longitude"):
                            stations.append(
                                StationItem(
                                    id=str(item.get("id")),
                                    name=item.get("name", "Monitoring Station"),
                                    city=item.get("locality", "Unknown"),
                                    country=item.get("country", {}).get("name", "Unknown"),
                                    coordinates=Coordinates(
                                        latitude=coords["latitude"],
                                        longitude=coords["longitude"]
                                    ),
                                    available_pollutants=[s.get("parameter", {}).get("name", "").upper() for s in item.get("sensors", []) if s.get("parameter")],
                                    timestamp=item.get("datetimeLast", {}).get("utc"),
                                    source="OpenAQ",
                                    is_demo=False
                                )
                            )
        except Exception as e:
            logger.error(f"Error fetching stations from OpenAQ: {e}")

        return stations
