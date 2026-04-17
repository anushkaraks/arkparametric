from fastapi import APIRouter
from app.api.endpoints import users, policies, simulator, claims, auth, fraud, payouts, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(policies.router, prefix="/policies", tags=["policies"])
api_router.include_router(simulator.router, prefix="/simulator", tags=["simulator"])
api_router.include_router(claims.router, prefix="/claims", tags=["claims"])
api_router.include_router(fraud.router, prefix="/fraud", tags=["fraud"])
api_router.include_router(payouts.router, prefix="/payouts", tags=["payouts"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
