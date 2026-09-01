"""
keywords.py
Rule-based safety-net layer for SAHAY.

Purpose: catch self-harm / threat / violence signals that a raw
sentiment/emotion model can miss or misclassify (e.g. flat/plain
phrasing being read as "anger" instead of a crisis signal).

This is intentionally simple string matching for the hackathon build.
Future scope (mention in pitch, not needed now): regex word-boundaries,
negation handling ("I don't want to hurt myself"), multilingual keyword
sets for Hindi/regional languages via AI4Bharat/IndicNLP.
"""

SELF_HARM = [
    "end it",
    "end my life",
    "want to die",
    "kill myself",
    "can't take this anymore",
    "cant take this anymore",
    "no point in continuing",
    "no point living",
    "nobody is helping me",
    "give up on me",
    "given up on me",
    "better off without me",
    "i just want it to end",
]

THREAT = [
    "threatening my family",
    "threatening me",
    "they said they'll hurt",
    "they said theyll hurt",
    "will hurt my children",
    "hurt my children",
    "kill me",
    "kill my family",
    "won't let me live",
    "wont let me live",
]

VIOLENCE = [
    "beaten",
    "attacked",
    "assaulted",
    "assault",
    "raped",
    "sexually abused",
    "hit me",
    "hit by",
    "physically abused",
]


def contains_flagged_keywords(text: str) -> dict:
    """
    Scan input text against SELF_HARM, THREAT, VIOLENCE keyword lists.

    Returns:
        {
            "matched": bool,
            "category": "self_harm" | "threat" | "violence" | None,
            "matched_phrase": str | None,
        }

    Priority order if multiple categories match: self_harm > threat > violence,
    since self-harm risk should always win the override.
    """
    if not text:
        return {"matched": False, "category": None, "matched_phrase": None}

    lowered = text.lower()

    for phrase in SELF_HARM:
        if phrase in lowered:
            return {"matched": True, "category": "self_harm", "matched_phrase": phrase}

    for phrase in THREAT:
        if phrase in lowered:
            return {"matched": True, "category": "threat", "matched_phrase": phrase}

    for phrase in VIOLENCE:
        if phrase in lowered:
            return {"matched": True, "category": "violence", "matched_phrase": phrase}

    return {"matched": False, "category": None, "matched_phrase": None}
