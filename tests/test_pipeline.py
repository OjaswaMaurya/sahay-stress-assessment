import os
import pytest
from src.pipeline import run_pipeline

def test_low_severity_text_runs():
    result = run_pipeline(text="I wanted to ask about my complaint status.")
    assert "top_emotion" in result
    assert 0 <= result["confidence"] <= 1


DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "sample_transcripts.txt")


def load_labeled_samples(path):
    samples = []
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            expected, text = line.split(": ", 1)
            samples.append((expected.strip().title(), text.strip()))
    return samples


@pytest.mark.parametrize("expected,text", load_labeled_samples(DATA_PATH))
def test_severity_matches_labeled_samples(expected, text):
    result = run_pipeline(text=text)
    actual = result["severity"]
    assert actual == expected, (
        f"Input: {text!r} | Expected: {expected} | Actual: {actual} | "
        f"Reasoning: {result['reasoning']}"
    )