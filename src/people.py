import json
import os
import uuid

REGISTRY_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "people.json")


def _load() -> dict:
    if not os.path.exists(REGISTRY_PATH):
        return {}
    with open(REGISTRY_PATH) as f:
        return json.load(f)


def _save(data: dict) -> None:
    os.makedirs(os.path.dirname(REGISTRY_PATH), exist_ok=True)
    with open(REGISTRY_PATH, "w") as f:
        json.dump(data, f, indent=2)


def register_person(name: str, email: str) -> dict:
    data = _load()
    key = email.strip().lower()
    if key in data:
        return data[key]  # already registered — same id on every future login
    person = {
        "person_id": "SHY-" + uuid.uuid4().hex[:6].upper(),
        "name": name.strip(),
        "email": key,
    }
    data[key] = person
    _save(data)
    return person


def get_person(email: str):
    return _load().get(email.strip().lower())