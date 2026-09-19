from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.repository import repository


router = APIRouter(
    prefix="/api/insights",
    tags=["Farmer Insights"],
)


@router.get("/")
def get_farmer_insights(
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
    market_signal: Optional[str] = Query(
        default=None,
        description="Filter by market signal: RISING, FALLING, STABLE",
    ),
    limit: Optional[int] = Query(
        default=None,
        ge=1,
        description="Maximum number of records",
    ),
):
    """
    Return farmer-oriented market insights generated from
    existing AgriPulse forecast outputs.
    """

    try:
        records = repository.get_farmer_insights(
            commodity=commodity,
            state=state,
            district=district,
            market_signal=market_signal,
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