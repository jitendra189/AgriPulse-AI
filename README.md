# AgriPulse AI

AgriPulse AI is an agricultural market-intelligence and farmer decision-support platform. It combines a trained Random Forest forecasting pipeline with weather-risk context, crop suitability context, economic scenario simulation, and explainable farmer insights.

> **Hackathon / development status:** the current application uses development/demo datasets and assumptions. Model metrics shown by the project are development-data evaluation results and must not be interpreted as real-world forecasting accuracy.

## What the project does

- Forecasts agricultural market prices for 1, 2, and 3 months ahead.
- Uses chronological time-series feature engineering to reduce future-data leakage.
- Provides weather-risk context alongside market forecasts.
- Separates crop suitability from market signals.
- Compares crops without automatically ranking what a farmer should grow.
- Simulates downside, expected, and upside economic scenarios.
- Generates rule-based explanations from existing model and scenario outputs.
- Stores farmer profile preferences for personalized dashboard context.

## ML pipeline

The current forecasting prototype uses a Random Forest Regressor trained on engineered historical market features:

- 1, 2, 3, 6, and 12-month price lags
- rolling mean and standard deviation features
- price changes and percentage changes
- month number and cyclical seasonal features

Validation includes:

- chronological train/validation/test splitting
- naive and seasonal baselines
- feature ablation
- multi-horizon evaluation
- walk-forward backtesting
- leakage sanity checks

The current development dataset is synthetic. Therefore the reported metrics are useful for validating the implementation and pipeline, not for claiming production agricultural accuracy.

## Architecture

```
Next.js frontend
      |
      v
FastAPI backend
      |
      +--> CSV repository / forecast artifacts
      +--> SQLite development database
      +--> authentication and farmer profile
```

The backend keeps data access centralized in app/repository.py, while the frontend uses a centralized API client in agripulse-frontend/lib/api.ts.

## Local setup

### Backend

1. Create and activate a Python virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Copy .env.example to .env and set a strong local SECRET_KEY.
4. Start the API:

```bash
uvicorn app.main:app --reload
```

API documentation is available at /docs.

### Frontend

```bash
cd agripulse-frontend
npm install
```

Create .env.local:

```text
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Run:

```bash
npm run dev
```

## Testing

Backend:

```bash
python -m pytest -q
```

Frontend production build:

```bash
cd agripulse-frontend
npm run build
```

GitHub Actions runs the backend test suite and frontend production build on pushes and pull requests.

## Responsible AI and limitations

AgriPulse is decision support, not a guarantee of price, yield, revenue, profit, or agricultural outcome.

- Development/demo data is explicitly labeled.
- The LLM/explanation layer must not generate numerical forecasts.
- Weather indicators are contextual risk features, not causal claims about price movement.
- Crop suitability and market attractiveness remain separate.
- Economic scenarios depend on assumptions and are not guaranteed outcomes.
- Production use requires verified authoritative data sources, data freshness/provenance, model monitoring, and production infrastructure.

## Current production gap

Before production deployment, the project still needs verified production data ingestion, managed PostgreSQL, database migrations, stronger authentication/session handling, rate limiting, production observability, automated data/model refresh, and deployment-specific infrastructure.

For a hackathon, the priority is a stable end-to-end demonstration of the existing ML and decision-support workflow without overstating the development data.
