from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.repository import repository


router = APIRouter(
    prefix="/api/suitability",
    tags=["Crop Suitability"],
)


@router.get("/")
def get_crop_suitability(
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
    Return crop suitability information for the configured
    farmer profile.

    Suitability is a separate decision-support layer from
    market forecasting. This endpoint does not calculate
    profitability or guarantee agronomic success.
    """

    try:
        records = repository.get_crop_suitability(
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