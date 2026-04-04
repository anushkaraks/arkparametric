import json
import logging
from app.ml.gemini_utils import configure_gemini, sanitize_input, get_model

logger = logging.getLogger(__name__)


async def assess_fraud_risk(
    user_id: int, policy_id: int, trigger_type: str, city: str
) -> dict:
    """
    Uses Gemini as a proxy fraud detection model (Zero-Touch AI validation layer).
    """
    if not configure_gemini():
        logger.warning("GEMINI_API_KEY not set — auto-approving claim (fallback).")
        return {
            "fraud_score": 0.05,
            "status": "approved",
            "reasoning": "Fallback zero-touch approval due to missing API Key.",
        }

    safe_trigger = sanitize_input(trigger_type)
    safe_city = sanitize_input(city)

    prompt = f"""
    You are an AI anti-fraud engine for an income protection platform.
    A zero-touch claim is being triggered automatically by an environmental/system event.
    Evaluate the fraud probability.
    - User ID: {user_id}
    - Policy ID: {policy_id}
    - Trigger Type: {safe_trigger}
    - Location: {safe_city}

    Because this is an automated external payload (parametrics), the fraud risk is generally low,
    but you should score it between 0.0 and 1.0 (where 1.0 is definitive fraud).
    Generate a JSON response:
    {{
      "fraud_score": float,
      "status": "approved" | "flagged_for_review",
      "reasoning": "A 1-sentence reasoning."
    }}
    Do not output markdown format. Only raw valid JSON.
    """
    try:
        model = get_model()
        response = model.generate_content(prompt)
        raw = response.text.strip().replace("```json", "").replace("```", "")
        result = json.loads(raw)
        logger.info(
            "Fraud assessment completed — user=%d score=%.2f",
            user_id,
            result.get("fraud_score", 0),
        )
        return result
    except Exception as e:
        logger.error("Gemini Fraud API Error: %s", e)
        return {
            "fraud_score": 0.1,
            "status": "approved",
            "reasoning": "Fallback automated approval due to API error.",
        }
