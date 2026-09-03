from fastapi.testclient import TestClient
from src.api import app
import os
client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_assess_low_severity():
    response = client.post(
        "/assess",
        json={"text": "I wanted to ask about the status of my complaint filed last month."},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["severity"] == "Low"
    assert "top_emotion" in data
    assert 0 <= data["confidence"] <= 1
    assert isinstance(data["all_emotions"], list)


def test_assess_high_severity_explicit_threat():
    response = client.post(
        "/assess",
        json={"text": "They said they'll hurt my children if I don't withdraw the case."},
    )
    assert response.status_code == 200
    assert response.json()["severity"] == "High"


def test_assess_medium_severity_vague_threat():
    response = client.post(
        "/assess",
        json={"text": "I'm scared, they keep threatening my family, I don't know what to do anymore."},
    )
    assert response.status_code == 200
    assert response.json()["severity"] == "Medium"


def test_assess_empty_text_rejected():
    response = client.post("/assess", json={"text": ""})
    assert response.status_code == 422


def test_assess_missing_text_field():
    response = client.post("/assess", json={})
    assert response.status_code == 422




def test_assess_audio_endpoint():
    audio_path = os.path.join(os.path.dirname(__file__), "..", "data", "audio", "test.mp3")
    with open(audio_path, "rb") as f:
        response = client.post("/assess-audio", files={"file": ("test.mp3", f, "audio/mpeg")})
    assert response.status_code == 200
    data = response.json()
    assert data["severity"] in ("Low", "Medium", "High")
    assert "input_text" in data
    assert len(data["input_text"]) > 0