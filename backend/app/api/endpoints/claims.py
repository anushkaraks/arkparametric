import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.database import get_db
from app.models import Claim, Payout, Trigger, User
from app.schemas import ClaimResponse, PayoutResponse
from app.core.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=List[ClaimResponse])
async def list_claims(
    user_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    query = (
        select(Claim)
        .options(selectinload(Claim.payout), selectinload(Claim.trigger))
        .order_by(Claim.created_at.desc())
    )
    if user_id:
        query = query.filter(Claim.user_id == user_id)
    result = await db.execute(query)
    claims = result.scalars().all()

    # Manually inject trigger_type since it's a relationship field
    output = []
    for c in claims:
        d = {
            "id": c.id,
            "user_id": c.user_id,
            "trigger_id": c.trigger_id,
            "trigger_type": c.trigger.trigger_type if c.trigger else None,
            "disruption_hours": c.disruption_hours,
            "loss_calculated": c.loss_calculated,
            "status": c.status,
            "fraud_confidence": c.fraud_confidence,
            "created_at": c.created_at,
            "payout": (
                {
                    "amount": c.payout.amount, 
                    "status": c.payout.status,
                    "transaction_id": c.payout.transaction_id
                }
                if c.payout
                else None
            ),
        }
        output.append(ClaimResponse(**d))
    return output


@router.get("/payouts", response_model=List[PayoutResponse])
async def list_payouts(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Payout).order_by(Payout.processed_at.desc())
    )
    return result.scalars().all()
