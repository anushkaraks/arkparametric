from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.database import get_db
from app.models import Policy, User
from app.schemas import PolicyCreate, PolicyResponse
from app.ml.gemini_engine import calculate_dynamic_premium

router = APIRouter()

@router.post("/", response_model=PolicyResponse)
async def create_policy(policy_req: PolicyCreate, db: AsyncSession = Depends(get_db)):
    # Verify user exists
    user_result = await db.execute(select(User).filter(User.id == policy_req.user_id))
    user = user_result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Calculate premium based dynamically
    ml_data = await calculate_dynamic_premium(user.city, policy_req.coverage_hours, user.platform)
    
    new_policy = Policy(
        user_id=user.id,
        coverage_hours=policy_req.coverage_hours,
        weekly_premium=ml_data.get("weekly_premium", 15.0),
        active_status=True,
        risk_score=ml_data.get("risk_score", 1.0)
    )
    db.add(new_policy)
    await db.commit()
    await db.refresh(new_policy)
    return new_policy

@router.patch("/{policy_id}/toggle", response_model=PolicyResponse)
async def toggle_policy_status(policy_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Policy).filter(Policy.id == policy_id))
    policy = result.scalars().first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
        
    policy.active_status = not policy.active_status
    await db.commit()
    await db.refresh(policy)
    return policy

@router.get("/", response_model=List[PolicyResponse])
async def list_policies(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Policy).order_by(Policy.created_at.desc()))
    return result.scalars().all()
