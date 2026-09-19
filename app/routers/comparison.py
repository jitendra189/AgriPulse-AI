from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.repository import repository


router = APIRouter(
    prefix="/api/comparison",
    tags=["Crop Comparison"],
)


@router.get("/")
def get_crop_comparison(
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
    Return comparative forecast information across crops.

    This endpoint does not rank crops or declare a best crop.
    It serves the validated crop-comparison output generated
    by the AgriPulse pipeline.
    """

    try:
        records = repository.get_crop_comparison(
            state=state,
            district=district,
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