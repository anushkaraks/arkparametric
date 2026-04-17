import asyncio
import logging
from app.core.celery_app import celery_app
from app.services.weather_service import fetch_weather_and_aqi, mock_platform_status
from app.database import AsyncSessionLocal
from app.models import Trigger, User, Policy, Claim, Payout
from sqlalchemy.future import select
from app.ml.fraud_engine import assess_fraud_risk

logger = logging.getLogger(__name__)


@celery_app.task
def poll_environmental_triggers(city: str = "Mumbai"):
    """Periodic Celery Task to evaluate environment for risk triggers."""
    asyncio.run(_poll_and_commit(city))


async def _poll_and_commit(city: str = "Mumbai", force: bool = False):
    from app.services.weather_service import CITY_COORDS

    coords = CITY_COORDS.get(city.lower(), {"lat": 19.076, "lon": 72.877})
    data = await fetch_weather_and_aqi(lat=coords["lat"], lon=coords["lon"])
    platform_state = await mock_platform_status(city)

    triggers = []

    # Logic for trigger assessment:
    if data["rainfall_mm"] > 10.0 or force:
        triggers.append({"type": "rain", "severity": max(12.5, data["rainfall_mm"])})

    if data["temperature"] > 40.0:
        triggers.append({"type": "heat", "severity": data["temperature"]})

    if data["aqi"] > 150:
        triggers.append({"type": "pollution", "severity": float(data["aqi"])})

    if platform_state == "down":
        triggers.append({"type": "platform_down", "severity": 1.0})

    if not triggers:
        logger.info("No threshold breaches detected for city=%s. System nominal.", city)
        return

    # Write triggers to the database and generate claims
    async with AsyncSessionLocal() as session:
        for t in triggers:
            trigger_row = Trigger(
                trigger_type=t["type"],
                severity=t["severity"],
                zone=city,
            )
            session.add(trigger_row)
            await session.commit()
            await session.refresh(trigger_row)

            # Find active policies for affected users
            policies_result = await session.execute(
                select(Policy).filter(Policy.active_status == True)
            )
            active_policies = policies_result.scalars().all()

            for policy in active_policies:
                # Load the actual user to get their hourly rate
                user_result = await session.execute(
                    select(User).filter(User.id == policy.user_id)
                )
                user = user_result.scalars().first()
                if not user:
                    logger.warning(
                        "User not found for policy %d, skipping.", policy.id
                    )
                    continue

                # Calculate loss based on actual user hourly rate × disruption hours
                disruption_hours = 1.0  # 1 hour disruption per trigger tick
                loss_amount = user.hourly_rate * disruption_hours

                fraud_data = await assess_fraud_risk(
                    policy.user_id, policy.id, t["type"], city
                )

                claim = Claim(
                    user_id=policy.user_id,
                    trigger_id=trigger_row.id,
                    disruption_hours=disruption_hours,
                    loss_calculated=loss_amount,
                    status="approved"
                    if fraud_data.get("fraud_score", 0) < 0.7
                    else "pending",
                    fraud_confidence=fraud_data.get("fraud_score", 0.0),
                )
                session.add(claim)
                await session.commit()
                await session.refresh(claim)

                if claim.status == "approved":
                    import uuid
                    payout = Payout(
                        claim_id=claim.id,
                        amount=loss_amount,
                        status="completed",
                        transaction_id=f"ARK-AUTO-{uuid.uuid4().hex[:8].upper()}"
                    )
                    session.add(payout)
                    await session.commit()

                logger.info(
                    "Claim #%d created for user #%d — type=%s loss=%.2f status=%s",
                    claim.id,
                    user.id,
                    t["type"],
                    loss_amount,
                    claim.status,
                )

    logger.info(
        "Recorded %d triggers for city=%s and generated respective claims/payouts.",
        len(triggers),
        city,
    )
