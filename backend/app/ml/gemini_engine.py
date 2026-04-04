import google.generativeai as genai
import json
from app.core.config import settings

def configure_gemini():
    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)

async def calculate_dynamic_premium(city: str, avg_hours: float, platform: str) -> dict:
    """
    Uses Gemini to evaluate a risk score and base premium.
    If no API key is present, returns dummy values.
    """
    if not settings.GEMINI_API_KEY:
        return {
            "risk_score": 1.2,
            "weekly_premium": 25.0,
            "hourly_rate": 8.0,
            "reasoning": "Fallback to base rates due to missing GEMINI_API_KEY"
        }
    
    configure_gemini()
    prompt = f"""
    You are an actuary AI for a parametric income protection platform for gig workers.
    Assess the risk profile for a worker with the following details:
    - City: {city}
    - Platform: {platform}
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
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        # Parse JSON
        result = json.loads(response.text.strip().replace('```json', '').replace('```', ''))
        return result
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {
            "risk_score": 1.5,
            "weekly_premium": 20.0,
            "hourly_rate": 10.0,
            "reasoning": "Fallback due to API error"
        }
