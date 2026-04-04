from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    city: str
    platform: str
    avg_hours_per_week: float

class UserResponse(BaseModel):
    id: int
    name: str
    city: str
    platform: str
    avg_hours_per_week: float
    hourly_rate: float
    risk_profile_score: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class PolicyCreate(BaseModel):
    user_id: int
    coverage_hours: float

class PolicyResponse(BaseModel):
    id: int
    user_id: int
    weekly_premium: float
    coverage_hours: float
    active_status: bool
    risk_score: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class TriggerResponse(BaseModel):
    id: int
    trigger_type: str
    severity: float
    zone: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

class ClaimPayoutSummary(BaseModel):
    amount: float
    status: str

    class Config:
        from_attributes = True

class ClaimResponse(BaseModel):
    id: int
    user_id: int
    trigger_id: int
    trigger_type: Optional[str] = None  # joined from Trigger
    disruption_hours: float
    loss_calculated: float
    status: str
    fraud_confidence: float
    created_at: datetime
    payout: Optional[ClaimPayoutSummary] = None

    class Config:
        from_attributes = True

class PayoutResponse(BaseModel):
    id: int
    claim_id: int
    amount: float
    status: str
    processed_at: datetime

    class Config:
        from_attributes = True
