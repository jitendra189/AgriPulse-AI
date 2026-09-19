from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root():
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "AgriPulse AI"
    assert data["status"] == "running"


def test_health():
    response = client.get("/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "healthy"
    assert data["storage"] == "csv"

    assert len(data["datasets"]) == 10


def test_market_monthly():
    response = client.get(
        "/api/market/monthly",
        params={"limit": 5},
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert data["count"] == 5
    assert len(data["data"]) == 5


def test_market_forecasts():
    response = client.get(
        "/api/market/forecasts",
        params={
            "commodity": "Onion",
            "horizon": 1,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert data["count"] > 0


def test_weather_risk():
    response = client.get(
        "/api/weather/risk",
        params={
            "commodity": "Onion",
            "limit": 5,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert data["count"] > 0


def test_farmer_insights():
    response = client.get(
        "/api/insights/",
        params={
            "commodity": "Onion",
            "limit": 5,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert data["count"] > 0


def test_crop_comparison():
    response = client.get(
        "/api/comparison/",
        params={"limit": 5},
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert data["count"] == 5


def test_crop_suitability():
    response = client.get(
        "/api/suitability/",
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert data["count"] == 5


def test_farmer_decision():
    response = client.get(
        "/api/decision/",
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert data["count"] == 5


def test_profit_simulation():
    response = client.get(
        "/api/profit/",
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert data["count"] == 5
    assert "disclaimer" in data


def test_scenario_analysis():
    response = client.get(
        "/api/scenarios/",
        params={
            "commodity": "Onion",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert data["count"] == 3


def test_farmer_explanations():
    response = client.get(
        "/api/explanations/",
        params={
            "commodity": "Onion",
            "limit": 5,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert data["count"] == 5
    assert "disclaimer" in data