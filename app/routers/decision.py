from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.repository import repository


router = APIRouter(
    prefix="/api/decision",
    tags=["Farmer Decision"],
)


@router.get("/")
def get_farmer_decision(
    state: Optional[str] = Query(
        default=None,
        description="Filter by state",
    ),
    district: Optional[str] = Query(
        default=None,
        description="Filter by district",
    ),
    commodity: Optional[str] = Query(
        default=None,
        description="Filter by crop/commodity",
    ),
    limit: Optional[int] = Query(
        default=None,
        ge=1,
        description="Maximum number of records",
    ),
):
    """
    Return the integrated farmer decision-support view.

    This endpoint combines existing AgriPulse outputs such as
    market signals, weather context, suitability and related
    decision-support fields.

    It does not automatically rank crops, guarantee profit,
    or make a cultivation decision for the farmer.
    """

    try:
        records = repository.get_farmer_decision(
            state=state,
            district=district,
            commodity=commodity,
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