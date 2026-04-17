import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.api import api_router

# ── Logging ─────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── App ──────────────────────────────────────────────────────────────────────────
app = FastAPI(title="Ark (Arcutis) API", version="1.0.0")

# ── CORS (FINAL WORKING FIX) ────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://arks-two.vercel.app" 
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global exception handler ────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        "Unhandled exception on %s %s: %s",
        request.method,
        request.url,
        exc,
        exc_info=True
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."},
    )

# ── Routers ─────────────────────────────────────────────────────────────────────
app.include_router(api_router, prefix="/api")

# ── Health + Root ───────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "Ark API is online", "docs": "/docs"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ark-backend"}
