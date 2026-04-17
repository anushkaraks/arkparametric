from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models import Claim
from app.schemas import FraudAnalysisResponse
import random

router = APIRouter()

@router.get("/{claim_id}/fraud-analysis", response_model=FraudAnalysisResponse)
async def get_fraud_analysis(claim_id: int, db: AsyncSession = Depends(get_db)):
    """Analyze a claim for potential fraud."""
    result = await db.execute(select(Claim).filter(Claim.id == claim_id))
    claim = result.scalars().first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    # Simulated fraud detection logic
    # In a real app, this would involve GPS distance checks, weather API cross-referencing, etc.
    
    # GPS Spoofing check: Simulated - detected if claim filed very soon after creation
    gps_spoofing = claim.fraud_confidence > 0.7
    
    # Weather Authenticity: Cross-check against Open-Meteo historical data flag (simulated)
    weather_auth = random.random() > 0.1 # 90% chance it's authentic in demo
    
    # Behavioral Pattern: Simulated based on claim ID or random
    behavioral = "Normal"
    if claim.fraud_confidence > 0.5:
        behavioral = "Suspicious frequency"
    elif claim.fraud_confidence > 0.8:
        behavioral = "Extreme outlier"

    return {
        "claim_id": claim.id,
        "fraud_confidence": claim.fraud_confidence,
        "gps_spoofing_flag": gps_spoofing,
        "weather_authenticity": weather_auth,
        "behavioral_pattern": behavioral
    }
