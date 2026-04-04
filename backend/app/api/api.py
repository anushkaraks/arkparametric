from fastapi import APIRouter
from app.api.endpoints import users, policies, simulator, claims

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(policies.router, prefix="/policies", tags=["policies"])
api_router.include_router(simulator.router, prefix="/simulator", tags=["simulator"])
api_router.include_router(claims.router, prefix="/claims", tags=["claims"])
