from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models import Claim, Payout
from app.schemas import PayoutInitiateRequest, PayoutResponse
import uuid
import asyncio

router = APIRouter()

@router.post("/initiate", response_model=PayoutResponse)
async def initiate_payout(req: PayoutInitiateRequest, db: AsyncSession = Depends(get_db)):
    """Initiate a mock payout for an approved claim."""
    result = await db.execute(select(Claim).filter(Claim.id == req.claim_id))
    claim = result.scalars().first()
    
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    if claim.status != "approved":
        raise HTTPException(status_code=400, detail="Only approved claims can be paid out")

    # Check if already paid
    existing_payout = await db.execute(select(Payout).filter(Payout.claim_id == req.claim_id))
    if existing_payout.scalars().first():
        raise HTTPException(status_code=400, detail="Payout already initiated for this claim")

    # Create payout record
    mock_transaction_id = f"ARK-{req.method}-{uuid.uuid4().hex[:8].upper()}"
    new_payout = Payout(
        claim_id=claim.id,
        amount=claim.loss_calculated,
        status="completed", # Immediately complete for demo
        transaction_id=mock_transaction_id
    )
    
    db.add(new_payout)
    await db.commit()
    await db.refresh(new_payout)
    
    # Simulate processing delay for "instant" feel
    await asyncio.sleep(1) 
    
    return new_payout
