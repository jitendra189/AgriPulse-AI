from app.database import Base, engine
from app import models
from fastapi import FastAPI
from app.routers import auth
from fastapi.middleware.cors import CORSMiddleware

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
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
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
    """
    Verify that all AgriPulse CSV datasets are available
    and readable.
    """
    from app.repository import repository

    return repository.health_check()


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