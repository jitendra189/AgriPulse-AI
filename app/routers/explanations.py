from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.repository import repository


router = APIRouter(
    prefix="/api/explanations",
    tags=["Farmer Explanations"],
)


@router.get("/")
def get_farmer_explanations(
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
    limit: Optional[int] = Query(
        default=None,
        ge=1,
        description="Maximum number of records",
    ),
):
    """
    Return farmer-facing explanations generated from existing
    AgriPulse forecast, weather-risk and scenario outputs.

    This endpoint does not create new ML predictions.
    """

    try:
        records = repository.get_farmer_explanations(
            commodity=commodity,
            state=state,
            district=district,
            limit=limit,
        )

        return {
            "status": "success",
            "count": len(records),
            "data": records,
            "disclaimer": (
                "Explanations summarize existing AgriPulse "
                "outputs and do not guarantee agricultural or "
                "financial outcomes."
            ),
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )