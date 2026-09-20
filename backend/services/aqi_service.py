"""
AQI Calculation Service
Standard: United States Environmental Protection Agency (US EPA) Air Quality Index

Methodology:
The AQI is calculated for individual criteria pollutants (PM2.5, PM10, O3, NO2, SO2, CO)
using the linear interpolation equation:

    I = ((I_high - I_low) / (C_high - C_low)) * (C - C_low) + I_low

Where:
    I      = Air Quality Sub-Index
    C      = Pollutant concentration
    C_low  = Concentration breakpoint <= C
    C_high = Concentration breakpoint >= C
    I_low  = AQI breakpoint corresponding to C_low
    I_high = AQI breakpoint corresponding to C_high

Overall AQI is determined by the highest sub-index:
    Overall AQI = max(I_PM25, I_PM10, I_O3, I_NO2, I_SO2, I_CO)

If no calculable pollutant measurements are available, the service returns None and status "Unavailable".
"""

from typing import Dict, Optional, Tuple

# Official US EPA AQI Categories and Breakpoints
AQI_CATEGORIES = [
    {"min": 0, "max": 50, "status": "Good", "color": "#10b981", "description": "Air quality is satisfactory, and air pollution poses little or no risk."},
    {"min": 51, "max": 100, "status": "Moderate", "color": "#f59e0b", "description": "Air quality is acceptable; however, some pollutants may cause moderate health concern for a very small number of sensitive individuals."},
    {"min": 101, "max": 150, "status": "Unhealthy for Sensitive Groups", "color": "#f97316", "description": "Members of sensitive groups may experience health effects. The general public is less likely to be affected."},
    {"min": 151, "max": 200, "status": "Unhealthy", "color": "#ef4444", "description": "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects."},
    {"min": 201, "max": 300, "status": "Very Unhealthy", "color": "#8b5cf6", "description": "Health alert: The risk of health effects is increased for everyone."},
    {"min": 301, "max": 500, "status": "Hazardous", "color": "#7f1d1d", "description": "Health warning of emergency conditions: The entire population is more likely to be affected."},
]

# Breakpoints for each pollutant: (C_low, C_high, I_low, I_high)
# Concentrations in standard metric units:
# PM2.5 (µg/m³), PM10 (µg/m³), NO2 (µg/m³), SO2 (µg/m³), O3 (µg/m³), CO (mg/m³)
BREAKPOINTS = {
    "pm25": [
        (0.0, 12.0, 0, 50),
        (12.1, 35.4, 51, 100),
        (35.5, 55.4, 101, 150),
        (55.5, 150.4, 151, 200),
        (150.5, 250.4, 201, 300),
        (250.5, 500.4, 301, 500),
    ],
    "pm10": [
        (0.0, 54.0, 0, 50),
        (55.0, 154.0, 51, 100),
        (155.0, 254.0, 101, 150),
        (255.0, 354.0, 151, 200),
        (355.0, 424.0, 201, 300),
        (425.0, 604.0, 301, 500),
    ],
    "no2": [
        (0.0, 100.0, 0, 50),
        (101.0, 188.0, 51, 100),
        (189.0, 677.0, 101, 150),
        (678.0, 1220.0, 151, 200),
        (1221.0, 2349.0, 201, 300),
        (2350.0, 3849.0, 301, 500),
    ],
    "so2": [
        (0.0, 92.0, 0, 50),
        (93.0, 197.0, 51, 100),
        (198.0, 485.0, 101, 150),
        (486.0, 796.0, 151, 200),
        (797.0, 1583.0, 201, 300),
        (1584.0, 2629.0, 301, 500),
    ],
    "o3": [
        (0.0, 106.0, 0, 50),
        (107.0, 137.0, 51, 100),
        (138.0, 167.0, 101, 150),
        (168.0, 206.0, 151, 200),
        (207.0, 392.0, 201, 300),
        (393.0, 784.0, 301, 500),
    ],
    "co": [
        (0.0, 5.0, 0, 50),
        (5.1, 10.8, 51, 100),
        (10.9, 14.2, 101, 150),
        (14.3, 17.6, 151, 200),
        (17.7, 34.9, 201, 300),
        (35.0, 57.8, 301, 500),
    ],
}


def calculate_pollutant_sub_index(pollutant_key: str, concentration: float) -> Optional[int]:
    """
    Calculate the AQI sub-index for a given pollutant and concentration.
    Returns integer AQI (0-500) or None if not calculable.
    """
    if concentration is None or concentration < 0:
        return None

    key = pollutant_key.lower().replace(".", "")
    if key not in BREAKPOINTS:
        return None

    bp_list = BREAKPOINTS[key]

    for c_low, c_high, i_low, i_high in bp_list:
        if c_low <= concentration <= c_high:
            # Linear interpolation formula
            aqi = ((i_high - i_low) / (c_high - c_low)) * (concentration - c_low) + i_low
            return round(aqi)

    # If concentration exceeds highest breakpoint
    if concentration > bp_list[-1][1]:
        return 500

    return None


def get_aqi_status(aqi: Optional[int]) -> str:
    """
    Return human-readable status for a given AQI number based on US EPA thresholds.
    """
    if aqi is None:
        return "Unavailable"

    for cat in AQI_CATEGORIES:
        if cat["min"] <= aqi <= cat["max"]:
            return cat["status"]

    if aqi > 500:
        return "Hazardous"

    return "Unavailable"


def calculate_overall_aqi(pollutants_dict: Dict[str, Optional[float]]) -> Tuple[Optional[int], str, Optional[str]]:
    """
    Calculate the overall AQI from a dict of pollutant concentrations.
    Returns:
        (aqi_value, aqi_status, dominant_pollutant)
    
    If no valid pollutant data exists to calculate AQI, returns (None, "Unavailable", None).
    """
    sub_indices: Dict[str, int] = {}

    for key, val in pollutants_dict.items():
        if val is not None:
            sub = calculate_pollutant_sub_index(key, float(val))
            if sub is not None:
                sub_indices[key] = sub

    if not sub_indices:
        return None, "Unavailable", None

    # Overall AQI is the maximum of sub-indices
    dominant = max(sub_indices, key=sub_indices.get)
    max_aqi = sub_indices[dominant]
    status = get_aqi_status(max_aqi)

    return max_aqi, status, dominant
