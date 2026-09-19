from pathlib import Path
from typing import Any, Optional

import pandas as pd


class AgriPulseRepository:
    """
    Central CSV data-access layer for AgriPulse.

    The backend is intentionally CSV-backed for the hackathon.
    No ML prediction is performed here.
    This layer only reads and filters outputs already generated
    by the Colab data/ML pipeline.
    """

    def __init__(self) -> None:
        self.base_dir = Path(__file__).resolve().parent.parent
        self.data_dir = self.base_dir / "data"

        self._cache: dict[str, pd.DataFrame] = {}

        self.files = {
            "monthly_market": "agripulse_monthly_market_data.csv",
            "market_forecasts": "agripulse_current_market_forecasts.csv",
            "weather_risk": "agripulse_weather_risk_forecasts.csv",
            "farmer_insights": "agripulse_farmer_insights.csv",
            "crop_comparison": "agripulse_crop_comparison.csv",
            "crop_suitability": "agripulse_crop_suitability.csv",
            "farmer_decision": "agripulse_farmer_decision_view.csv",
            "profit_simulation": "agripulse_profit_simulation.csv",
            "scenario_analysis": "agripulse_scenario_analysis.csv",
            "farmer_explanations": "agripulse_farmer_ai_explanations.csv",
        }

    # =========================================================
    # INTERNAL HELPERS
    # =========================================================

    def _get_path(self, dataset: str) -> Path:
        """
        Resolve a dataset name to its CSV path.
        """
        if dataset not in self.files:
            raise ValueError(
                f"Unknown dataset '{dataset}'. "
                f"Available datasets: {list(self.files.keys())}"
            )

        path = self.data_dir / self.files[dataset]

        if not path.exists():
            raise FileNotFoundError(
                f"Dataset file not found: {path}"
            )

        return path

    @staticmethod
    def _clean_value(value: Any) -> Any:
        """
        Convert pandas/numpy values into JSON-safe Python values.
        """
        if pd.isna(value):
            return None

        if hasattr(value, "item"):
            try:
                return value.item()
            except (ValueError, TypeError):
                pass

        return value

    def _records(self, df: pd.DataFrame) -> list[dict[str, Any]]:
        """
        Convert DataFrame rows into JSON-safe dictionaries.
        """
        records = df.to_dict(orient="records")

        return [
            {
                key: self._clean_value(value)
                for key, value in record.items()
            }
            for record in records
        ]

    # =========================================================
    # DATASET LOADING
    # =========================================================

    def load(self, dataset: str) -> pd.DataFrame:
        """
        Load a dataset from CSV.

        Data is cached after the first read so repeated API
        requests do not repeatedly read the same CSV file.
        """

        if dataset not in self._cache:

            path = self._get_path(dataset)

            df = pd.read_csv(path)

            if df.empty:
                raise ValueError(
                    f"Dataset '{dataset}' is empty."
                )

            self._cache[dataset] = df

        return self._cache[dataset].copy()

    def reload(self, dataset: Optional[str] = None) -> None:
        """
        Clear cached data.

        If dataset is provided, only that dataset is reloaded
        on its next request.

        If dataset is None, the entire cache is cleared.
        """

        if dataset is None:
            self._cache.clear()
        else:
            self._cache.pop(dataset, None)

    # =========================================================
    # GENERIC DATA ACCESS
    # =========================================================

    def get_records(
        self,
        dataset: str,
        limit: Optional[int] = None,
    ) -> list[dict[str, Any]]:
        """
        Return records from a dataset.
        """

        df = self.load(dataset)

        if limit is not None:
            if limit < 1:
                raise ValueError("limit must be greater than 0")

            df = df.head(limit)

        return self._records(df)

    def filter_records(
        self,
        dataset: str,
        filters: Optional[dict[str, Any]] = None,
        limit: Optional[int] = None,
    ) -> list[dict[str, Any]]:
        """
        Filter a dataset using exact column-value matching.

        Example:
            filters={
                "commodity": "Rice",
                "state": "Bihar"
            }
        """

        df = self.load(dataset)

        if filters:
            for column, value in filters.items():

                if column not in df.columns:
                    raise ValueError(
                        f"Column '{column}' does not exist in "
                        f"dataset '{dataset}'."
                    )

                if value is not None:
                    df = df[
                        df[column].astype(str).str.lower()
                        == str(value).lower()
                    ]

        if limit is not None:
            if limit < 1:
                raise ValueError("limit must be greater than 0")

            df = df.head(limit)

        return self._records(df)

    # =========================================================
    # MARKET DATA
    # =========================================================

    def get_monthly_market_data(
        self,
        commodity: Optional[str] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
        market: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> list[dict[str, Any]]:

        filters = {
            "commodity": commodity,
            "state": state,
            "district": district,
            "market": market,
        }

        filters = {
            key: value
            for key, value in filters.items()
            if value is not None
        }

        return self.filter_records(
            "monthly_market",
            filters,
            limit,
        )

    # =========================================================
    # MARKET FORECASTS
    # =========================================================

    def get_market_forecasts(
        self,
        commodity: Optional[str] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
        market: Optional[str] = None,
        horizon: Optional[int] = None,
        limit: Optional[int] = None,
    ) -> list[dict[str, Any]]:

        df = self.load("market_forecasts")

        filters = {
            "commodity": commodity,
            "state": state,
            "district": district,
            "market": market,
        }

        for column, value in filters.items():

            if value is not None and column in df.columns:
                df = df[
                    df[column].astype(str).str.lower()
                    == str(value).lower()
                ]

        if horizon is not None:

            horizon_columns = [
                "horizon_months",
                "horizon",
                "forecast_horizon",
            ]

            horizon_column = next(
                (
                    column
                    for column in horizon_columns
                    if column in df.columns
                ),
                None,
            )

            if horizon_column is not None:
                df = df[
                    pd.to_numeric(
                        df[horizon_column],
                        errors="coerce",
                    )
                    == horizon
                ]

        if limit is not None:
            if limit < 1:
                raise ValueError("limit must be greater than 0")

            df = df.head(limit)

        return self._records(df)

    # =========================================================
    # WEATHER RISK
    # =========================================================

    def get_weather_risk(
        self,
        commodity: Optional[str] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
        market: Optional[str] = None,
        risk_level: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> list[dict[str, Any]]:

        df = self.load("weather_risk")

        filters = {
            "commodity": commodity,
            "state": state,
            "district": district,
            "market": market,
        }

        for column, value in filters.items():

            if value is not None and column in df.columns:
                df = df[
                    df[column].astype(str).str.lower()
                    == str(value).lower()
                ]

        if risk_level is not None:

            possible_columns = [
                "weather_risk_level",
                "risk_level",
                "weather_risk",
            ]

            risk_column = next(
                (
                    column
                    for column in possible_columns
                    if column in df.columns
                ),
                None,
            )

            if risk_column is not None:
                df = df[
                    df[risk_column].astype(str).str.lower()
                    == str(risk_level).lower()
                ]

        if limit is not None:
            if limit < 1:
                raise ValueError("limit must be greater than 0")

            df = df.head(limit)

        return self._records(df)

    # =========================================================
    # FARMER INSIGHTS
    # =========================================================

    def get_farmer_insights(
        self,
        commodity: Optional[str] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
        market_signal: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> list[dict[str, Any]]:

        filters = {
            "commodity": commodity,
            "state": state,
            "district": district,
            "market_signal": market_signal,
        }

        filters = {
            key: value
            for key, value in filters.items()
            if value is not None
        }

        return self.filter_records(
            "farmer_insights",
            filters,
            limit,
        )

    # =========================================================
    # CROP COMPARISON
    # =========================================================

    def get_crop_comparison(
        self,
        state: Optional[str] = None,
        district: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> list[dict[str, Any]]:

        filters = {
            "state": state,
            "district": district,
        }

        filters = {
            key: value
            for key, value in filters.items()
            if value is not None
        }

        return self.filter_records(
            "crop_comparison",
            filters,
            limit,
        )

    # =========================================================
    # CROP SUITABILITY
    # =========================================================

    def get_crop_suitability(
        self,
        state: Optional[str] = None,
        district: Optional[str] = None,
        commodity: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> list[dict[str, Any]]:

        filters = {
            "state": state,
            "district": district,
            "commodity": commodity,
        }

        filters = {
            key: value
            for key, value in filters.items()
            if value is not None
        }

        return self.filter_records(
            "crop_suitability",
            filters,
            limit,
        )

    # =========================================================
    # FARMER DECISION VIEW
    # =========================================================

    def get_farmer_decision(
        self,
        state: Optional[str] = None,
        district: Optional[str] = None,
        commodity: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> list[dict[str, Any]]:

        filters = {
            "state": state,
            "district": district,
            "commodity": commodity,
        }

        filters = {
            key: value
            for key, value in filters.items()
            if value is not None
        }

        return self.filter_records(
            "farmer_decision",
            filters,
            limit,
        )

    # =========================================================
    # PROFIT SIMULATION
    # =========================================================

    def get_profit_simulation(
        self,
        commodity: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> list[dict[str, Any]]:

        filters = {}

        if commodity is not None:
            filters["commodity"] = commodity

        return self.filter_records(
            "profit_simulation",
            filters,
            limit,
        )

    # =========================================================
    # SCENARIO ANALYSIS
    # =========================================================

    def get_scenario_analysis(
        self,
        commodity: Optional[str] = None,
        scenario: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> list[dict[str, Any]]:

        df = self.load("scenario_analysis")

        if commodity is not None and "commodity" in df.columns:
            df = df[
                df["commodity"].astype(str).str.lower()
                == str(commodity).lower()
            ]

        if scenario is not None and "scenario" in df.columns:
            df = df[
                df["scenario"].astype(str).str.lower()
                == str(scenario).lower()
            ]

        if limit is not None:
            if limit < 1:
                raise ValueError("limit must be greater than 0")

            df = df.head(limit)

        return self._records(df)

    # =========================================================
    # FARMER AI EXPLANATIONS
    # =========================================================

    def get_farmer_explanations(
        self,
        commodity: Optional[str] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> list[dict[str, Any]]:

        filters = {
            "commodity": commodity,
            "state": state,
            "district": district,
        }

        filters = {
            key: value
            for key, value in filters.items()
            if value is not None
        }

        return self.filter_records(
            "farmer_explanations",
            filters,
            limit,
        )

    # =========================================================
    # HEALTH / DIAGNOSTICS
    # =========================================================

    def health_check(self) -> dict[str, Any]:
        """
        Verify that all expected CSV datasets exist and can
        be loaded successfully.
        """

        datasets = {}

        for dataset in self.files:

            try:
                df = self.load(dataset)

                datasets[dataset] = {
                    "status": "OK",
                    "rows": int(len(df)),
                    "columns": int(len(df.columns)),
                }

            except Exception as exc:

                datasets[dataset] = {
                    "status": "ERROR",
                    "error": str(exc),
                }

        all_ok = all(
            item["status"] == "OK"
            for item in datasets.values()
        )

        return {
            "status": "healthy" if all_ok else "degraded",
            "storage": "csv",
            "datasets": datasets,
        }


# =============================================================
# SHARED REPOSITORY INSTANCE
# =============================================================

repository = AgriPulseRepository()