import os
import shutil
import tempfile
from typing import List

from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel, Field

from src.pipeline import run_pipeline
from src.companion import generate_supportive_reply
from fastapi.middleware.cors import CORSMiddleware
import time
import uuid
from fastapi import WebSocket, WebSocketDisconnect
from src.counselors import is_counselor


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


class RespondResponse(AssessResponse):
    counselor_reply: str

class CaseResponse(RespondResponse):
    id: str
    timestamp: float
    status: str


class StatusUpdate(BaseModel):
    status: str


class EmailInput(BaseModel):
    email: str = Field(..., min_length=3)


class RoleResponse(BaseModel):
    role: str  

app = FastAPI(
    title="SAHAY — Stress Assessment API",
    description="Real-time stress/trauma severity assessment for NHAA (14566) helpline inputs.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
class ConnectionManager:
    """Tracks connected counselor dashboards and pushes live case updates."""

    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active:
            self.active.remove(websocket)

    async def broadcast(self, message: dict):
        dead = []
        for connection in self.active:
            try:
                await connection.send_json(message)
            except Exception:
                dead.append(connection)
        for connection in dead:
            self.disconnect(connection)


manager = ConnectionManager()

CASES: list[dict] = []
SEVERITY_ORDER = {"High": 3, "Medium": 2, "Low": 1}


async def _store_and_broadcast_case(result: dict) -> dict:
    case = {
        "id": str(uuid.uuid4()),
        "timestamp": time.time(),
        "status": "new",
        **result,
    }
    CASES.append(case)
    await manager.broadcast({"type": "new_case", "case": case})
    return case


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
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
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


@app.post("/respond", response_model=CaseResponse)
async def respond(payload: AssessRequest):
    try:
        result = run_pipeline(text=payload.text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment failed: {e}")

    reply = generate_supportive_reply(payload.text, result["severity"])
    full_result = {**result, "counselor_reply": reply}
    return await _store_and_broadcast_case(full_result)

@app.get("/cases", response_model=list[CaseResponse])
def get_cases():
    return sorted(
        CASES,
        key=lambda c: (SEVERITY_ORDER.get(c["severity"], 0), c["timestamp"]),
        reverse=True,
    )


@app.patch("/cases/{case_id}", response_model=CaseResponse)
async def update_case_status(case_id: str, payload: StatusUpdate):
    for case in CASES:
        if case["id"] == case_id:
            case["status"] = payload.status
            await manager.broadcast({"type": "case_updated", "case": case})
            return case
    raise HTTPException(status_code=404, detail="Case not found")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # we don't use incoming messages, just keep the connection open
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.post("/auth/check-role", response_model=RoleResponse)
def check_role(payload: EmailInput):
    role = "counselor" if is_counselor(payload.email) else "user"
    return {"role": role}