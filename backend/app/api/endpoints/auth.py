"""Auth endpoints — OTP-based phone login + legacy user_id login."""

import logging
import random
import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, TokenResponse, UserResponse, OTPRequest, OTPVerify
from app.core.auth import create_access_token
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

OTP_TTL_SECONDS = 300  # 5 minutes


def get_redis():
    return aioredis.from_url(settings.REDIS_URL, decode_responses=True)


# ── OTP: Request ──────────────────────────────────────────────────────────────

@router.post("/request-otp")
async def request_otp(req: OTPRequest, db: AsyncSession = Depends(get_db)):
    """
    Generate a 4-digit OTP for a phone number and store in Redis.
    The OTP is returned in the response (demo mode).
    In production, send via SMS provider (Twilio / AWS SNS).
    """
    phone = req.phone.strip()

    # Check if phone belongs to a registered user
    result = await db.execute(select(User).filter(User.phone == phone))
    user = result.scalars().first()

    otp = str(random.randint(1000, 9999))

    r = get_redis()
    try:
        await r.setex(f"otp:{phone}", OTP_TTL_SECONDS, otp)
    finally:
        await r.aclose()

    if user:
        logger.info("OTP requested for existing user phone %s", phone)
        return {"message": "OTP sent", "demo_otp": otp, "user_exists": True}
    else:
        logger.info("OTP requested for new registration phone %s", phone)
        return {"message": "OTP sent", "demo_otp": otp, "user_exists": False}


# ── OTP: Verify (Login) ───────────────────────────────────────────────────────

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(req: OTPVerify, db: AsyncSession = Depends(get_db)):
    """Verify OTP and return JWT token for the user."""
    phone = req.phone.strip()

    r = get_redis()
    try:
        stored_otp = await r.get(f"otp:{phone}")
        if not stored_otp or stored_otp != req.otp:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        # Delete OTP after successful verification
        await r.delete(f"otp:{phone}")
    finally:
        await r.aclose()

    result = await db.execute(select(User).filter(User.phone == phone))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found for this phone number. Please sign up first.")

    token = create_access_token({"sub": str(user.id)})
    logger.info("User #%d authenticated via OTP.", user.id)

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


# ── Legacy: Login by user_id (for demo / internal use) ───────────────────────

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Simple login by user_id for demo/seed purposes."""
    result = await db.execute(select(User).filter(User.id == req.user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token = create_access_token({"sub": str(user.id)})
    logger.info("User #%d logged in via legacy user_id.", user.id)

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )
