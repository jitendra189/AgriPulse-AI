from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.repository import repository


router = APIRouter(
    prefix="/api/market",
    tags=["Market"],
)


@router.get("/monthly")
def get_monthly_market_data(
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
    limit: Optional[int] = Query(
        default=None,
        ge=1,
        description="Maximum number of records",
    ),
):
    """
    Return historical monthly agricultural market data.
    """

    try:
        records = repository.get_monthly_market_data(
            commodity=commodity,
            state=state,
            district=district,
            market=market,
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


@router.get("/forecasts")
def get_market_forecasts(
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
    horizon: Optional[int] = Query(
        default=None,
        ge=1,
        le=3,
        description="Forecast horizon in months: 1, 2, or 3",
    ),
    limit: Optional[int] = Query(
        default=None,
        ge=1,
        description="Maximum number of records",
    ),
):
    """
    Return existing AgriPulse ML market forecasts.

    This endpoint does NOT train a model or generate a new
    prediction. It serves the validated forecast output
    produced by the Colab ML pipeline.
    """

    try:
        records = repository.get_market_forecasts(
            commodity=commodity,
            state=state,
            district=district,
            market=market,
            horizon=horizon,
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