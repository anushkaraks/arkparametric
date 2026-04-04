"""
Database seed script.

Prerequisites: Run Alembic migrations first:
    alembic upgrade head

Then run:
    python seed.py
"""

import asyncio
import logging
from app.database import AsyncSessionLocal, engine, Base
from app.models import User, Policy

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def seed_db():
    # Create tables if migrations haven't been run (dev fallback)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        import sqlalchemy as sa

        # Seed demo user
        user_result = await session.execute(sa.select(User).filter(User.id == 1))
        user = user_result.scalars().first()
        if not user:
            logger.info("Seeding initial demo user...")
            user = User(
                id=1,
                name="Ramesh Kumar",
                city="Mumbai",
                platform="Swiggy",
                avg_hours_per_week=40,
                hourly_rate=15.0,
                risk_profile_score=1.2,
            )
            session.add(user)
            await session.commit()
            logger.info("Demo user created (ID=1).")

        # Seed demo policy
        policy_result = await session.execute(
            sa.select(Policy).filter(Policy.user_id == 1)
        )
        policy = policy_result.scalars().first()
        if not policy:
            logger.info("Seeding initial demo policy...")
            policy = Policy(
                user_id=1,
                weekly_premium=25.0,
                coverage_hours=8.0,
                active_status=True,
                risk_score=1.2,
            )
            session.add(policy)
            await session.commit()
            logger.info("Demo policy created.")

    logger.info("Database seeding completed.")


if __name__ == "__main__":
    asyncio.run(seed_db())
