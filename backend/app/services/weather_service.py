import logging
import httpx
from typing import Dict, Any

logger = logging.getLogger(__name__)

# City → lat/lon lookup for Indian cities
CITY_COORDS: Dict[str, Dict[str, float]] = {
    "mumbai": {"lat": 19.076, "lon": 72.877},
    "delhi": {"lat": 28.614, "lon": 77.209},
    "bangalore": {"lat": 12.972, "lon": 77.595},
    "chennai": {"lat": 13.083, "lon": 80.271},
    "hyderabad": {"lat": 17.385, "lon": 78.487},
    "pune": {"lat": 18.520, "lon": 73.857},
    "kolkata": {"lat": 22.573, "lon": 88.364},
    "ahmedabad": {"lat": 23.023, "lon": 72.571},
}


async def fetch_weather_and_aqi(
    lat: float = 19.076, lon: float = 72.877
) -> Dict[str, Any]:
    """
    Fetches real-time weather and AQI from Open-Meteo (free, no API key).
    """
    weather_url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}&current_weather=true&hourly=precipitation"
    )
    aqi_url = (
        f"https://air-quality-api.open-meteo.com/v1/air-quality"
        f"?latitude={lat}&longitude={lon}&current=european_aqi"
    )

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            weather_res = await client.get(weather_url)
            aqi_res = await client.get(aqi_url)

            weather_data = weather_res.json()
            aqi_data = aqi_res.json()

            return {
                "temperature": weather_data.get("current_weather", {}).get(
                    "temperature", 25.0
                ),
                "rainfall_mm": weather_data.get("hourly", {}).get(
                    "precipitation", [0.0]
                )[0],
                "aqi": aqi_data.get("current", {}).get("european_aqi", 50.0),
            }
        except Exception as e:
            logger.error("Error fetching open-meteo data: %s", e)
            return {"temperature": 25.0, "rainfall_mm": 0.0, "aqi": 50.0}


def get_coords_for_city(city: str) -> Dict[str, float]:
    """Resolve a city name to lat/lon coordinates."""
    return CITY_COORDS.get(city.lower(), {"lat": 19.076, "lon": 72.877})


async def mock_platform_status(city: str) -> str:
    """Mock platform API returning 'up' or 'down'."""
    if city.lower() == "simulation_down":
        return "down"
    return "up"
