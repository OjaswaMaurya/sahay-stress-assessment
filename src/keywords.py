

SELF_HARM = [
    "end it",
    "end my life",
    "want to die",
    "i want to die",
    "kill myself",
    "can't take this anymore",
    "cant take this anymore",
    "can't cope",
    "cant cope",
    "can't cope with this",
    "cant cope with this",
    "can't handle this anymore",
    "cant handle this anymore",
    "too much to handle",
    "no point in continuing",
    "no point living",
    "no point in anything",
    "nothing matters anymore",
    "nothing i do matters",
    "feel hopeless",
    "completely hopeless",
    "i feel hopeless",
    "nobody is helping me",
    "give up on me",
    "given up on me",
    "i give up",
    "better off without me",
    "i just want it to end",
    "want to suicide",
    "don't want to live",
    "do not want to live",
    "don't want to live anymore",
    "want to end it",
    "don't want to stay anymore",
]

THREAT_EXPLICIT = [
    "they said they'll hurt",
    "they said theyll hurt",
    "will hurt my children",
    "hurt my children",
    "kill me",
    "kill my family",
    "won't let me live",
    "wont let me live",
    "kill him",
    "hurt them",
]

THREAT_VAGUE = [
    "threatening my family",
    "threatening me",
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
    "going to hurt",
    "i am going to hurt",
    "i'm going to hurt",
    "will hurt that person",
]


def contains_flagged_keywords(text: str) -> dict:
    """
    Scan input text against SELF_HARM, THREAT_EXPLICIT, THREAT_VAGUE,
    VIOLENCE keyword lists.

    Returns:
        {
            "matched": bool,
            "category": "self_harm" | "threat_explicit" | "threat_vague"
                        | "violence" | None,
            "matched_phrase": str | None,
        }

    Priority order if multiple categories match:
        self_harm > threat_explicit > violence > threat_vague
    self-harm risk always wins; explicit named threats / already-occurred
    violence outrank a vague/ambient threat mention.
    """
    if not text:
        return {"matched": False, "category": None, "matched_phrase": None}

    lowered = text.lower()

    for phrase in SELF_HARM:
        if phrase in lowered:
            return {"matched": True, "category": "self_harm", "matched_phrase": phrase}

    for phrase in THREAT_EXPLICIT:
        if phrase in lowered:
            return {"matched": True, "category": "threat_explicit", "matched_phrase": phrase}

    for phrase in VIOLENCE:
        if phrase in lowered:
            return {"matched": True, "category": "violence", "matched_phrase": phrase}

    for phrase in THREAT_VAGUE:
        if phrase in lowered:
            return {"matched": True, "category": "threat_vague", "matched_phrase": phrase}

    return {"matched": False, "category": None, "matched_phrase": None}
