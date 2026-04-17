import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.api import api_router

# ── Logging ─────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Create app ──────────────────────────────────────────────────
app = FastAPI()

# 🔥 ADD CORS FIRST (VERY IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Exception handler ───────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Error: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Server error"})

# 🔥 INCLUDE ROUTER AFTER CORS
app.include_router(api_router, prefix="/api")

# ── Routes ─────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "API working"}

@app.get("/health")
async def health():
    return {"status": "ok"}
