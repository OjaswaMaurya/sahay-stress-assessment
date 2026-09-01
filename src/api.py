"""
api.py
FastAPI layer for SAHAY — exposes the pipeline (src/pipeline.py) over HTTP
so the counselor dashboard / demo frontend can call it.

Step 1a: bare app skeleton + /health only.
Deliberately NOT importing src.pipeline here yet — that pulls in
transformers/whisper (heavy, slow first-load). Endpoints that need it
get wired in step 1c.
"""

from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from src.pipeline import run_pipeline


class AssessRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Victim's message/transcript to assess.")


class EmotionScore(BaseModel):
    label: str
    score: float


class AssessResponse(BaseModel):
    input_text: str
    top_emotion: str
    confidence: float
    all_emotions: List[EmotionScore]
    severity: str
    reasoning: str


app = FastAPI(
    title="SAHAY — Stress Assessment API",
    description="Real-time stress/trauma severity assessment for NHAA (14566) helpline inputs.",
    version="0.1.0",
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/assess", response_model=AssessResponse)
def assess(payload: AssessRequest):
    """
    Run the full SAHAY pipeline (emotion model + keyword safety-net +
    severity fusion) on a piece of text and return a structured result.
    """
    try:
        result = run_pipeline(text=payload.text)
    except ValueError as e:
        # e.g. empty/whitespace-only text reaching the pipeline
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # model load / inference failure — don't leak internals, but don't crash either
        raise HTTPException(status_code=500, detail=f"Assessment failed: {e}")

    return result
