from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.database import get_db
from app.models import User, Policy
from app.schemas import UserCreate, UserResponse, PolicyResponse
from app.ml.gemini_engine import calculate_dynamic_premium

router = APIRouter()

@router.post("/", response_model=UserResponse)
async def create_user(user_req: UserCreate, db: AsyncSession = Depends(get_db)):
    # Calculate initial risk score and rate from Gemini
    ml_data = await calculate_dynamic_premium(user_req.city, user_req.avg_hours_per_week, user_req.platform)
    
    new_user = User(
        name=user_req.name,
        city=user_req.city,
        platform=user_req.platform,
        avg_hours_per_week=user_req.avg_hours_per_week,
        hourly_rate=ml_data.get("hourly_rate", 10.0),
        risk_profile_score=ml_data.get("risk_score", 1.0)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/{user_id}/policies", response_model=List[PolicyResponse])
async def get_user_policies(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Policy).filter(Policy.user_id == user_id).order_by(Policy.created_at.desc()))
    return result.scalars().all()
