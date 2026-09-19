from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.repository import repository


router = APIRouter(
    prefix="/api/scenarios",
    tags=["Scenario Analysis"],
)


@router.get("/")
def get_scenario_analysis(
    commodity: Optional[str] = Query(
        default=None,
        description="Filter by crop/commodity",
    ),
    scenario: Optional[str] = Query(
        default=None,
        description="Filter by scenario: DOWNSIDE, EXPECTED, UPSIDE",
    ),
    limit: Optional[int] = Query(
        default=None,
        ge=1,
        description="Maximum number of records",
    ),
):
    """
    Return AgriPulse scenario-analysis results.

    Scenarios modify assumptions around the existing forecast.
    They do not create new ML predictions and do not guarantee
    profit or agricultural outcomes.
    """

    try:
        records = repository.get_scenario_analysis(
            commodity=commodity,
            scenario=scenario,
            limit=limit,
        )

        return {
            "status": "success",
            "count": len(records),
            "data": records,
            "disclaimer": (
                "Scenario results are calculations based on "
                "explicit assumptions around existing AgriPulse "
                "forecast outputs. They are not guaranteed outcomes."
            ),
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )