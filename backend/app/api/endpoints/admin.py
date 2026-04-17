from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.database import get_db
from app.models import User, Policy, Claim, Trigger
from app.schemas import AdminAnalyticsResponse

router = APIRouter()

@router.get("/analytics", response_model=AdminAnalyticsResponse)
async def get_admin_analytics(db: AsyncSession = Depends(get_db)):
    """Get aggregated analytics for insurers."""
    
    # 1. Total Premiums
    result_premiums = await db.execute(select(func.sum(Policy.weekly_premium)))
    total_premiums = result_premiums.scalar() or 0.0
    
    # 2. Total Paid Out (Approved Claims)
    result_paid = await db.execute(select(func.sum(Claim.loss_calculated)).filter(Claim.status == "approved"))
    total_paid = result_paid.scalar() or 0.0
    
    # 3. Loss Ratio
    loss_ratio = total_paid / total_premiums if total_premiums > 0 else 0.0
    
    # 4. Claims by Trigger Type
    # This requires joining Claim and Trigger or just using trigger_type if we added it to Claim
    # For now, let's mock it or do a join
    claims_by_trigger = {
        "rain": 0,
        "heat": 0,
        "pollution": 0,
        "platform_down": 0
    }
    
    # Join Claim and Trigger
    result_triggers = await db.execute(
        select(Trigger.trigger_type, func.count(Claim.id))
        .join(Claim, Claim.trigger_id == Trigger.id)
        .group_by(Trigger.trigger_type)
    )
    for row in result_triggers:
        claims_by_trigger[row[0]] = row[1]
    
    # 5. High Risk Cities
    result_cities = await db.execute(
        select(User.city, func.count(Claim.id))
        .join(Claim, Claim.user_id == User.id)
        .group_by(User.city)
        .order_by(func.count(Claim.id).desc())
        .limit(5)
    )
    high_risk_cities = [{"city": row[0], "claims": row[1]} for row in result_cities]
    
    # 6. Fraud Flags
    result_fraud = await db.execute(select(func.count(Claim.id)).filter(Claim.fraud_confidence > 0.6))
    fraud_flags = result_fraud.scalar() or 0
    
    return {
        "total_premiums": total_premiums,
        "total_paid": total_paid,
        "loss_ratio": loss_ratio,
        "claims_by_trigger": claims_by_trigger,
        "high_risk_cities": high_risk_cities,
        "fraud_flags": fraud_flags
    }
