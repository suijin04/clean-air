import datetime
import math
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
from services.aqi_service import calculate_overall_aqi, calculate_pollutant_sub_index

# Canonical city list with realistic coordinates and base air profiles
CITIES_DB = [
    # India
    {"city": "Delhi", "country": "India", "region": "Asia", "lat": 28.6139, "lon": 77.2090, "station": "Anand Vihar, Delhi - DPCC", "base_pm25": 86.5, "base_pm10": 164.0, "base_no2": 44.2, "base_so2": 14.1, "base_co": 1.6, "base_o3": 38.0},
    {"city": "Mumbai", "country": "India", "region": "Asia", "lat": 19.0760, "lon": 72.8777, "station": "Bandra Kurla Complex, Mumbai - MPCB", "base_pm25": 48.0, "base_pm10": 98.4, "base_no2": 32.0, "base_so2": 11.2, "base_co": 0.9, "base_o3": 28.5},
    {"city": "Bengaluru", "country": "India", "region": "Asia", "lat": 12.9716, "lon": 77.5946, "station": "BTM Layout, Bengaluru - KSPCB", "base_pm25": 28.4, "base_pm10": 62.0, "base_no2": 21.5, "base_so2": 7.4, "base_co": 0.6, "base_o3": 31.0},
    {"city": "Chennai", "country": "India", "region": "Asia", "lat": 13.0827, "lon": 80.2707, "station": "Alandur, Chennai - CPCB", "base_pm25": 32.1, "base_pm10": 71.0, "base_no2": 19.8, "base_so2": 8.0, "base_co": 0.7, "base_o3": 25.4},
    {"city": "Kolkata", "country": "India", "region": "Asia", "lat": 22.5726, "lon": 88.3639, "station": "Victoria Memorial, Kolkata - WBPCB", "base_pm25": 65.8, "base_pm10": 128.0, "base_no2": 38.4, "base_so2": 12.5, "base_co": 1.2, "base_o3": 22.0},
    {"city": "Hyderabad", "country": "India", "region": "Asia", "lat": 17.3850, "lon": 78.4867, "station": "Sanathnagar, Hyderabad - TSPCB", "base_pm25": 39.5, "base_pm10": 85.0, "base_no2": 26.0, "base_so2": 9.1, "base_co": 0.8, "base_o3": 34.0},
    {"city": "Pune", "country": "India", "region": "Asia", "lat": 18.5204, "lon": 73.8567, "station": "Shivajinagar, Pune - IITM", "base_pm25": 35.2, "base_pm10": 78.0, "base_no2": 24.3, "base_so2": 8.5, "base_co": 0.8, "base_o3": 29.0},
    {"city": "Ahmedabad", "country": "India", "region": "Asia", "lat": 23.0225, "lon": 72.5714, "station": "Maninagar, Ahmedabad - GPCB", "base_pm25": 54.0, "base_pm10": 112.0, "base_no2": 33.1, "base_so2": 13.0, "base_co": 1.1, "base_o3": 30.5},
    {"city": "Dehradun", "country": "India", "region": "Asia", "lat": 30.3165, "lon": 78.0322, "station": "Clock Tower, Dehradun - UEPPCB", "base_pm25": 41.0, "base_pm10": 89.0, "base_no2": 18.0, "base_so2": None, "base_co": None, "base_o3": 24.0}, # Partial missing
    
    # International
    {"city": "London", "country": "United Kingdom", "region": "Europe", "lat": 51.5074, "lon": -0.1278, "station": "London Westminster - DEFRA", "base_pm25": 11.2, "base_pm10": 18.5, "base_no2": 29.4, "base_so2": 3.2, "base_co": 0.4, "base_o3": 42.0},
    {"city": "New York", "country": "United States", "region": "Americas", "lat": 40.7128, "lon": -74.0060, "station": "CCNY - Manhattan DEC", "base_pm25": 9.8, "base_pm10": 16.0, "base_no2": 22.1, "base_so2": 2.1, "base_co": 0.3, "base_o3": 48.0},
    {"city": "Paris", "country": "France", "region": "Europe", "lat": 48.8566, "lon": 2.3522, "station": "Paris 1er Les Halles - Airparif", "base_pm25": 13.5, "base_pm10": 21.0, "base_no2": 31.2, "base_so2": 2.8, "base_co": 0.4, "base_o3": 39.0},
    {"city": "Tokyo", "country": "Japan", "region": "Asia", "lat": 35.6762, "lon": 139.6503, "station": "Shinjuku Eco Center - Tokyo Bureau", "base_pm25": 10.4, "base_pm10": 19.2, "base_no2": 24.5, "base_so2": 2.0, "base_co": 0.4, "base_o3": 44.0},
    {"city": "Singapore", "country": "Singapore", "region": "Asia", "lat": 1.3521, "lon": 103.8198, "station": "Central Singapore Station - NEA", "base_pm25": 16.2, "base_pm10": 26.5, "base_no2": 18.2, "base_so2": 5.4, "base_co": 0.5, "base_o3": 35.0},
    {"city": "Dubai", "country": "United Arab Emirates", "region": "Middle East", "lat": 25.2048, "lon": 55.2708, "station": "Safaa Park Station - Dubai Mun.", "base_pm25": 44.5, "base_pm10": 135.0, "base_no2": 36.0, "base_so2": 15.2, "base_co": 0.9, "base_o3": 52.0},
    {"city": "Los Angeles", "country": "United States", "region": "Americas", "lat": 34.0522, "lon": -118.2437, "station": "LA North Main St - SCAQMD", "base_pm25": 17.8, "base_pm10": 34.0, "base_no2": 35.4, "base_so2": 1.8, "base_co": 0.6, "base_o3": 61.2},
    {"city": "Toronto", "country": "Canada", "region": "Americas", "lat": 43.6532, "lon": -79.3832, "station": "Toronto Downtown - MECP", "base_pm25": 8.4, "base_pm10": 15.1, "base_no2": 19.5, "base_so2": 1.5, "base_co": 0.3, "base_o3": 45.0},
    {"city": "Sydney", "country": "Australia", "region": "Oceania", "lat": -33.8688, "lon": 151.2093, "station": "Rozelle Station - NSW EPA", "base_pm25": 7.9, "base_pm10": 14.8, "base_no2": 16.2, "base_so2": 1.4, "base_co": 0.2, "base_o3": 40.5}
]

class MockAirQualityProvider(BaseAirQualityProvider):
    """
    Demo/Mock Data Provider for CleanAir AI.
    Provides mathematically sound, structured test data with clear demo indicators
    so UI and calculation features can be comprehensively verified.
    """

    def __init__(self):
        self.is_demo = True
        self.source_label = "OpenAQ (Demo Mode)"

    def _find_city(self, city_name: str) -> Optional[Dict]:
        city_lower = city_name.strip().lower()
        for c in CITIES_DB:
            if c["city"].lower() == city_lower:
                return c
        # Partial match
        for c in CITIES_DB:
            if city_lower in c["city"].lower():
                return c
        return None

    async def get_cities(self) -> List[CitySummary]:
        results = []
        now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        for c in CITIES_DB:
            pollutants_dict = {
                "pm25": c["base_pm25"],
                "pm10": c["base_pm10"],
                "no2": c["base_no2"],
                "so2": c["base_so2"],
                "co": c["base_co"],
                "o3": c["base_o3"]
            }
            aqi, status, _ = calculate_overall_aqi(pollutants_dict)
            results.append(
                CitySummary(
                    city=c["city"],
                    country=c["country"],
                    region=c["region"],
                    coordinates=Coordinates(latitude=c["lat"], longitude=c["lon"]),
                    aqi=aqi,
                    aqi_status=status,
                    pm25=c["base_pm25"],
                    last_updated=now_str,
                    is_demo=True
                )
            )
        return results

    async def get_latest_air_quality(self, city: str) -> AirQualityResponse:
        city_meta = self._find_city(city)
        if not city_meta:
            return AirQualityResponse(
                city=city,
                country="Unknown",
                source=self.source_label,
                is_demo=True,
                aqi_status="Unavailable",
                message=f"Live air-quality data is currently unavailable for {city}."
            )

        now = datetime.datetime.now(datetime.timezone.utc)
        now_str = now.isoformat()

        # Build pollutant dictionary
        pollutants_dict = {
            "pm25": city_meta["base_pm25"],
            "pm10": city_meta["base_pm10"],
            "no2": city_meta["base_no2"],
            "so2": city_meta["base_so2"],
            "co": city_meta["base_co"],
            "o3": city_meta["base_o3"]
        }

        aqi, status, dominant = calculate_overall_aqi(pollutants_dict)

        pollutants_result = {}
        meta_configs = [
            ("pm25", "PM2.5", "µg/m³"),
            ("pm10", "PM10", "µg/m³"),
            ("no2", "NO₂", "µg/m³"),
            ("so2", "SO₂", "µg/m³"),
            ("co", "CO", "mg/m³"),
            ("o3", "O₃", "µg/m³")
        ]

        for key, display_name, unit in meta_configs:
            val = city_meta[f"base_{key}"]
            if val is not None:
                pollutants_result[key] = PollutantMeasurement(
                    name=display_name,
                    value=val,
                    unit=unit,
                    timestamp=now_str,
                    status="available"
                )
            else:
                pollutants_result[key] = None

        return AirQualityResponse(
            city=city_meta["city"],
            country=city_meta["country"],
            source=self.source_label,
            is_demo=True,
            last_updated=now_str,
            aqi=aqi,
            aqi_status=status,
            aqi_standard="US EPA AQI",
            dominant_pollutant=dominant.upper() if dominant else None,
            station=city_meta["station"],
            coordinates=Coordinates(latitude=city_meta["lat"], longitude=city_meta["lon"]),
            pollutants=pollutants_result
        )

    async def get_historical_data(self, city: str, pollutant: str, time_range: str) -> TrendResponse:
        city_meta = self._find_city(city)
        pollutant_clean = pollutant.lower().replace(".", "")
        unit = "mg/m³" if pollutant_clean == "co" else "µg/m³"

        if not city_meta:
            return TrendResponse(
                city=city,
                pollutant=pollutant,
                unit=unit,
                time_range=time_range,
                data=[],
                is_demo=True,
                message="Historical data is currently unavailable."
            )

        base_val = city_meta.get(f"base_{pollutant_clean}")
        if base_val is None:
            return TrendResponse(
                city=city_meta["city"],
                pollutant=pollutant,
                unit=unit,
                time_range=time_range,
                data=[],
                is_demo=True,
                message=f"Historical data for {pollutant} is currently unavailable for this location."
            )

        # Generate realistic trend points based on time_range
        # 24h: 24 hourly points
        # 7d: 7 daily points (or every 6h)
        # 30d: 30 daily points
        now = datetime.datetime.now(datetime.timezone.utc)
        points: List[TrendPoint] = []

        if time_range == "24 hours" or time_range == "24h":
            count = 24
            delta = datetime.timedelta(hours=1)
            time_format = "%H:%M"
        elif time_range == "7 days" or time_range == "7d":
            count = 28  # 4 points per day
            delta = datetime.timedelta(hours=6)
            time_format = "%b %d %H:%M"
        else: # 30 days
            count = 30
            delta = datetime.timedelta(days=1)
            time_format = "%b %d"

        for i in range(count - 1, -1, -1):
            pt_time = now - (delta * i)
            # Add natural diurnal curve
            hour_factor = math.sin((pt_time.hour - 6) * math.pi / 12) * 0.25
            day_variation = math.cos(i * 0.5) * 0.15
            val = round(max(1.0, base_val * (1 + hour_factor + day_variation)), 1)
            points.append(TrendPoint(timestamp=pt_time.strftime(time_format), value=val))

        values = [p.value for p in points]
        return TrendResponse(
            city=city_meta["city"],
            pollutant=pollutant,
            unit=unit,
            time_range=time_range,
            data=points,
            average=round(sum(values) / len(values), 1) if values else None,
            min_value=min(values) if values else None,
            max_value=max(values) if values else None,
            latest_value=values[-1] if values else None,
            is_demo=True
        )

    async def get_stations(self) -> List[StationItem]:
        stations = []
        now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        for idx, c in enumerate(CITIES_DB):
            available = []
            for p in ["pm25", "pm10", "no2", "so2", "co", "o3"]:
                if c.get(f"base_{p}") is not None:
                    available.append(p.upper())

            stations.append(
                StationItem(
                    id=f"station_{idx+1}",
                    name=c["station"],
                    city=c["city"],
                    country=c["country"],
                    coordinates=Coordinates(latitude=c["lat"], longitude=c["lon"]),
                    available_pollutants=available,
                    latest_measurement=f"PM2.5: {c['base_pm25']} µg/m³" if c.get("base_pm25") else "Active",
                    timestamp=now_str,
                    source=self.source_label,
                    is_demo=True
                )
            )
        return stations
