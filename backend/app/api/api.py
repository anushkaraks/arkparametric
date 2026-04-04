from fastapi import APIRouter
from app.api.endpoints import users, policies

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(policies.router, prefix="/policies", tags=["policies"])
