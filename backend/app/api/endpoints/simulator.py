import logging
from fastapi import APIRouter, Depends
from app.worker.tasks import _poll_and_commit
from app.ml.gemini_engine import calculate_dynamic_premium
from app.models import User
from app.core.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/trigger")
async def trigger_simulation(
    city: str = "Mumbai",
    _current_user: User = Depends(get_current_user),
):
    """
    Forces an immediate trigger execution cycle for Demo Mode.
    Normally this runs every 15 minutes via Celery.
    """
    logger.info("Manual trigger simulation requested for city=%s", city)
    await _poll_and_commit(city, force=True)
    return {"message": f"Simulation cycle completed for {city}. Triggers and claims assessed."}


@router.get("/premium")
async def get_premium_estimate(
    city: str = "Mumbai",
    hours: float = 40,
    platform: str = "Delivery",
    _current_user: User = Depends(get_current_user),
):
    """
    Returns a dynamic premium estimate using the Gemini ML engine.
    Used by the frontend premium calculator.
    """
    result = await calculate_dynamic_premium(city, hours, platform)
    return result
