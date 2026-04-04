"""Auth endpoints — login / token generation."""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, TokenResponse, UserResponse
from app.core.auth import create_access_token

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Simple login by user_id for demo purposes.
    In production, replace with email/password or OAuth.
    """
    result = await db.execute(select(User).filter(User.id == req.user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token = create_access_token({"sub": str(user.id)})
    logger.info("User #%d logged in successfully.", user.id)

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )
