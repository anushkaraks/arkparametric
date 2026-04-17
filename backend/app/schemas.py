from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── Auth ───────────────────────────────────────────────────────────────────────

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class LoginRequest(BaseModel):
    user_id: int = Field(..., gt=0, description="User ID to authenticate as")


class OTPRequest(BaseModel):
    phone: str = Field(..., min_length=7, max_length=20, description="Phone number")


class OTPVerify(BaseModel):
    phone: str = Field(..., min_length=7, max_length=20)
    otp: str = Field(..., min_length=4, max_length=6)


# ── Users ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    city: str = Field(..., min_length=1, max_length=50)
    platform: str = Field(..., min_length=1, max_length=100)
    avg_hours_per_week: float = Field(..., gt=0, le=168, description="Hours worked per week (1-168)")


class UserResponse(BaseModel):
    id: int
    name: str
    phone: Optional[str] = None
    city: str
    platform: str
    avg_hours_per_week: float
    hourly_rate: float
    risk_profile_score: float
    created_at: datetime

    class Config:
        from_attributes = True


# ── Policies ───────────────────────────────────────────────────────────────────

class PolicyCreate(BaseModel):
    user_id: int = Field(..., gt=0)
    coverage_hours: float = Field(..., gt=0, le=168, description="Coverage hours per week (1-168)")


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


# ── Triggers ───────────────────────────────────────────────────────────────────

class TriggerResponse(BaseModel):
    id: int
    trigger_type: str
    severity: float
    zone: str
    timestamp: datetime

    class Config:
        from_attributes = True


# ── Claims ─────────────────────────────────────────────────────────────────────

class ClaimPayoutSummary(BaseModel):
    amount: float
    status: str
    transaction_id: Optional[str] = None

    class Config:
        from_attributes = True


class ClaimResponse(BaseModel):
    id: int
    user_id: int
    trigger_id: int
    trigger_type: Optional[str] = None
    disruption_hours: float
    loss_calculated: float
    status: str
    fraud_confidence: float
    created_at: datetime
    payout: Optional[ClaimPayoutSummary] = None

    class Config:
        from_attributes = True


# ── Payouts ────────────────────────────────────────────────────────────────────

class PayoutInitiateRequest(BaseModel):
    claim_id: int
    method: str = Field(..., description="Payment method: 'UPI', 'CARD', or 'BANK'")


class PayoutResponse(BaseModel):
    id: int
    claim_id: int
    amount: float
    status: str
    transaction_id: Optional[str] = None
    processed_at: datetime

    class Config:
        from_attributes = True


# ── Fraud ──────────────────────────────────────────────────────────────────────

class FraudAnalysisResponse(BaseModel):
    claim_id: int
    fraud_confidence: float
    gps_spoofing_flag: bool
    weather_authenticity: bool
    behavioral_pattern: str


# ── Admin ──────────────────────────────────────────────────────────────────────

class AdminAnalyticsResponse(BaseModel):
    total_premiums: float
    total_paid: float
    loss_ratio: float
    claims_by_trigger: dict
    high_risk_cities: list
    fraud_flags: int


# Fix forward ref for TokenResponse
TokenResponse.model_rebuild()
