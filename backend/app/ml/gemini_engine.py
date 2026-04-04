import json
import logging
from app.ml.gemini_utils import configure_gemini, sanitize_input, get_model

logger = logging.getLogger(__name__)


async def calculate_dynamic_premium(city: str, avg_hours: float, platform: str) -> dict:
    """
    Uses Gemini to evaluate a risk score and base premium.
    If no API key is present, returns fallback values.
    """
    if not configure_gemini():
        logger.warning("GEMINI_API_KEY not set — using fallback premium values.")
        return {
            "risk_score": 1.2,
            "weekly_premium": 25.0,
            "hourly_rate": 8.0,
            "reasoning": "Fallback to base rates due to missing GEMINI_API_KEY",
        }

    safe_city = sanitize_input(city)
    safe_platform = sanitize_input(platform)

    prompt = f"""
    You are an actuary AI for a parametric income protection platform for gig workers.
    Assess the risk profile for a worker with the following details:
    - City: {safe_city}
    - Platform: {safe_platform}
    - Average Hours/Week: {avg_hours}

    Generate a JSON response (and only JSON) with the following structure:
    {{
      "risk_score": float (1.0 to 3.0 where higher is riskier),
      "weekly_premium": float (in USD, typically between $5 and $50 depending on hours and risk),
      "hourly_rate": float (estimated hourly earnings for this platform in this city, typically $5 to $25),
      "reasoning": "A short 1 sentence explanation."
    }}
    Do not output any markdown formatting, only raw valid JSON.
    """
    try:
        model = get_model()
        response = model.generate_content(prompt)
        raw = response.text.strip().replace("```json", "").replace("```", "")
        result = json.loads(raw)
        logger.info("Gemini premium calculation completed for city=%s", safe_city)
        return result
    except Exception as e:
        logger.error("Gemini API Error during premium calculation: %s", e)
        return {
            "risk_score": 1.5,
            "weekly_premium": 20.0,
            "hourly_rate": 10.0,
            "reasoning": "Fallback due to API error",
        }
