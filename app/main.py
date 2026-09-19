from app.database import Base, engine
from app import models
from fastapi import FastAPI
from app.routers import auth
from fastapi.middleware.cors import CORSMiddleware
from app.config import CORS_ORIGINS, ENVIRONMENT

from app.routers import (
    market,
    weather,
    insights,
    comparison,
    suitability,
    decision,
    profit,
    scenarios,
    explanations,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AgriPulse AI API",
    description=(
        "Agricultural market intelligence and decision-support "
        "API powered by validated AgriPulse ML and rule-based "
        "analytics outputs."
    ),
    version="1.0.0",
)

# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "name": "AgriPulse AI",
        "version": "1.0.0",
        "status": "running",
        "description": (
            "Agricultural market intelligence and "
            "farmer decision-support API."
        ),
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():
    """Check application and dataset health."""
    from app.repository import repository
    return {"environment": ENVIRONMENT, **repository.health_check()}


@app.get("/health/live")
def health_live():
    """Liveness probe: the process is running."""
    return {"status": "alive"}


@app.get("/health/ready")
def health_ready():
    """Readiness probe: required datasets are available."""
    from fastapi import HTTPException
    from app.repository import repository
    result = repository.health_check()
    if result.get("status") != "healthy":
        raise HTTPException(status_code=503, detail=result)
    return {"status": "ready"}


# ============================================================
# ROUTERS
# ============================================================

app.include_router(market.router)
app.include_router(weather.router)
app.include_router(insights.router)
app.include_router(comparison.router)
app.include_router(suitability.router)
app.include_router(decision.router)
app.include_router(profit.router)
app.include_router(scenarios.router)
app.include_router(explanations.router)

app.include_router(auth.router)