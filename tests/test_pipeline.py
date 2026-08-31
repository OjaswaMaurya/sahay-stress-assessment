from src.pipeline import run_pipeline

def test_low_severity_text_runs():
    result = run_pipeline(text="I wanted to ask about my complaint status.")
    assert "top_emotion" in result
    assert 0 <= result["confidence"] <= 1