import os
import shutil
import tempfile
import time
from typing import List

from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.pipeline import run_pipeline
from src.companion import generate_supportive_reply
from src.people import register_person, get_person
from src.counselors import register_counselor, is_counselor, get_counselor


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


class CounselorRegister(BaseModel):
    name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=3)
    phone: str = Field(..., min_length=7)


class PersonRegister(BaseModel):
    name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=3)


class EmailInput(BaseModel):
    email: str = Field(..., min_length=3)


class RoleResponse(BaseModel):
    role: str
    person_id: str | None = None
    name: str | None = None


class VictimMessageRequest(BaseModel):
    person_id: str = Field(..., min_length=1)
    person_name: str = Field(..., min_length=1)
    text: str = Field(..., min_length=1)


class CounselorMessageRequest(BaseModel):
    counselor_email: str
    text: str


class ClaimRequest(BaseModel):
    counselor_email: str


class TransferRequest(BaseModel):
    by_counselor_email: str
    to_counselor_email: str


class AIToggleRequest(BaseModel):
    counselor_email: str
    enabled: bool


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

CASES: dict[str, dict] = {}  # keyed by person_id
VICTIM_CONNECTIONS: dict[str, list[WebSocket]] = {}
COUNSELOR_CONNECTIONS: list[WebSocket] = []
SEVERITY_ORDER = {"High": 3, "Medium": 2, "Low": 1}


def _get_or_create_case(person_id: str, person_name: str) -> dict:
    if person_id not in CASES:
        CASES[person_id] = {
            "person_id": person_id,
            "person_name": person_name,
            "messages": [],
            "severity": "Low",
            "reasoning": "",
            "top_emotion": "",
            "confidence": 0.0,
            "status": "new",
            "assigned_to": None,
            "ai_enabled": True,
            "created_at": time.time(),
            "updated_at": time.time(),
        }
    return CASES[person_id]


async def _broadcast_counselors(message: dict):
    dead = []
    for ws in COUNSELOR_CONNECTIONS:
        try:
            await ws.send_json(message)
        except Exception:
            dead.append(ws)
    for ws in dead:
        COUNSELOR_CONNECTIONS.remove(ws)


async def _push_to_victim(person_id: str, message: dict):
    for ws in VICTIM_CONNECTIONS.get(person_id, []):
        try:
            await ws.send_json(message)
        except Exception:
            pass


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/assess", response_model=AssessResponse)
def assess(payload: AssessRequest):
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


@app.post("/respond")
async def respond(payload: VictimMessageRequest):
    case = _get_or_create_case(payload.person_id, payload.person_name)
    is_first_message = len(case["messages"]) == 0

    try:
        result = run_pipeline(text=payload.text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment failed: {e}")

    case["messages"].append({
        "sender": "victim", "sender_name": payload.person_name,
        "text": payload.text, "timestamp": time.time(),
    })
    case["severity"] = result["severity"]
    case["reasoning"] = result["reasoning"]
    case["top_emotion"] = result["top_emotion"]
    case["confidence"] = result["confidence"]
    case["updated_at"] = time.time()

    if case["ai_enabled"]:
        reply_text = generate_supportive_reply(payload.text, result["severity"])
        case["messages"].append({
            "sender": "assistant", "sender_name": "Sahayak Assistant",
            "text": reply_text, "timestamp": time.time(),
        })

    await _broadcast_counselors({
        "type": "new_case" if is_first_message else "case_updated",
        "case": case,
    })
    return case


@app.get("/cases")
def get_cases():
    return sorted(
        CASES.values(),
        key=lambda c: (SEVERITY_ORDER.get(c["severity"], 0), c["updated_at"]),
        reverse=True,
    )


@app.post("/cases/{person_id}/claim")
async def claim_case(person_id: str, payload: ClaimRequest):
    case = CASES.get(person_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case["assigned_to"] and case["assigned_to"] != payload.counselor_email:
        raise HTTPException(status_code=409, detail=f"Already claimed by {case['assigned_to']}")
    case["assigned_to"] = payload.counselor_email
    case["status"] = "claimed"
    case["updated_at"] = time.time()
    await _broadcast_counselors({"type": "case_updated", "case": case})
    return case


@app.post("/cases/{person_id}/transfer")
async def transfer_case(person_id: str, payload: TransferRequest):
    case = CASES.get(person_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case["assigned_to"] != payload.by_counselor_email:
        raise HTTPException(status_code=403, detail="Only the assigned counselor can transfer this case")
    if not is_counselor(payload.to_counselor_email):
        raise HTTPException(status_code=400, detail="That email isn't a registered counselor")
    case["assigned_to"] = payload.to_counselor_email
    case["updated_at"] = time.time()
    await _broadcast_counselors({"type": "case_updated", "case": case})
    return case


@app.post("/cases/{person_id}/ai-toggle")
async def toggle_ai(person_id: str, payload: AIToggleRequest):
    case = CASES.get(person_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case["assigned_to"] != payload.counselor_email:
        raise HTTPException(status_code=403, detail="Only the assigned counselor can toggle AI for this case")
    case["ai_enabled"] = payload.enabled
    case["updated_at"] = time.time()
    await _broadcast_counselors({"type": "case_updated", "case": case})
    return case


@app.post("/cases/{person_id}/message")
async def counselor_message(person_id: str, payload: CounselorMessageRequest):
    case = CASES.get(person_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case["assigned_to"] != payload.counselor_email:
        raise HTTPException(status_code=403, detail="Only the assigned counselor can message this case")

    counselor = get_counselor(payload.counselor_email)
    sender_name = counselor["name"] if counselor else payload.counselor_email

    msg = {
        "sender": "counselor", "sender_name": sender_name,
        "text": payload.text, "timestamp": time.time(),
    }
    case["messages"].append(msg)
    case["updated_at"] = time.time()

    await _push_to_victim(person_id, {"type": "new_message", "message": msg})
    await _broadcast_counselors({"type": "case_updated", "case": case})
    return case


@app.post("/auth/register-counselor")
def register_counselor_endpoint(payload: CounselorRegister):
    counselor = register_counselor(payload.name, payload.email, payload.phone)
    return {"role": "counselor", "name": counselor["name"]}


@app.post("/auth/register-person")
def register_person_endpoint(payload: PersonRegister):
    person = register_person(payload.name, payload.email)
    return {"person_id": person["person_id"], "name": person["name"]}


@app.post("/auth/check-role", response_model=RoleResponse)
def check_role(payload: EmailInput):
    if is_counselor(payload.email):
        return {"role": "counselor"}
    person = get_person(payload.email)
    if person:
        return {"role": "user", "person_id": person["person_id"], "name": person["name"]}
    return {"role": "user"}


@app.websocket("/ws/counselors")
async def ws_counselors(websocket: WebSocket):
    await websocket.accept()
    COUNSELOR_CONNECTIONS.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in COUNSELOR_CONNECTIONS:
            COUNSELOR_CONNECTIONS.remove(websocket)


@app.websocket("/ws/victim/{person_id}")
async def ws_victim(websocket: WebSocket, person_id: str):
    await websocket.accept()
    VICTIM_CONNECTIONS.setdefault(person_id, []).append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        VICTIM_CONNECTIONS[person_id].remove(websocket)