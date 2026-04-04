from fastapi import APIRouter
from app.worker.tasks import _poll_and_commit
from app.ml.gemini_engine import calculate_dynamic_premium

router = APIRouter()

@router.post("/trigger")
async def trigger_simulation(city: str = "Mumbai"):
    """
    Forces an immediate trigger execution cycle for Demo Mode.
    Normally this runs every 15 minutes via Celery.
    """
    await _poll_and_commit()
    return {"message": "Simulation cycle completed. Triggers and claims assessed."}

@router.get("/premium")
async def get_premium_estimate(city: str = "Mumbai", hours: float = 40, platform: str = "Delivery"):
    """
    Returns a dynamic premium estimate using the Gemini ML engine.
    Used by the frontend premium calculator.
    """
    result = await calculate_dynamic_premium(city, hours, platform)
    return result
