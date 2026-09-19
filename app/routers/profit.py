from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.repository import repository


router = APIRouter(
    prefix="/api/profit",
    tags=["Profit Simulation"],
)


@router.get("/")
def get_profit_simulation(
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
    Return AgriPulse profit-simulation scenarios.

    These are calculations based on explicit demo yield,
    cost and price assumptions. They are not guaranteed
    financial outcomes.
    """

    try:
        records = repository.get_profit_simulation(
            commodity=commodity,
            limit=limit,
        )

        return {
            "status": "success",
            "count": len(records),
            "data": records,
            "disclaimer": (
                "Profit values are scenario calculations using "
                "demo assumptions and are not guaranteed outcomes."
            ),
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )