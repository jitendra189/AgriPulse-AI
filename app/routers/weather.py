from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.repository import repository


router = APIRouter(
    prefix="/api/weather",
    tags=["Weather"],
)


@router.get("/risk")
def get_weather_risk(
    commodity: Optional[str] = Query(
        default=None,
        description="Filter by crop/commodity",
    ),
    state: Optional[str] = Query(
        default=None,
        description="Filter by state",
    ),
    district: Optional[str] = Query(
        default=None,
        description="Filter by district",
    ),
    market: Optional[str] = Query(
        default=None,
        description="Filter by market",
    ),
    risk_level: Optional[str] = Query(
        default=None,
        description="Filter by weather risk level: LOW, MODERATE, HIGH",
    ),
    limit: Optional[int] = Query(
        default=None,
        ge=1,
        description="Maximum number of records",
    ),
):
    """
    Return weather-risk context associated with AgriPulse
    market forecasts.

    This endpoint serves precomputed weather-risk features.
    It does not claim to forecast future weather.
    """

    try:
        records = repository.get_weather_risk(
            commodity=commodity,
            state=state,
            district=district,
            market=market,
            risk_level=risk_level,
            limit=limit,
        )

        return {
            "status": "success",
            "count": len(records),
            "data": records,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )