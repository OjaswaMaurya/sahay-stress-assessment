from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import os
import shutil
import tempfile
from fastapi import UploadFile, File
from src.pipeline import run_pipeline
from src.companion import generate_supportive_reply

class RespondResponse(AssessResponse):
    counselor_reply: str
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
@app.post("/assess-audio", response_model=AssessResponse)
async def assess_audio(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename)[1] or ".mp3"
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
        try:
            result = run_pipeline(audio_path=tmp_path)
        finally:
            os.remove(tmp_path)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment failed: {e}")
    return result
@app.post("/respond", response_model=RespondResponse)
def respond(payload: AssessRequest):
    try:
        result = run_pipeline(text=payload.text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment failed: {e}")

    reply = generate_supportive_reply(payload.text, result["severity"])
    return {**result, "counselor_reply": reply}