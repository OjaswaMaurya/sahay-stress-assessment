SELF_HARM = [
    # direct suicidal statements
    "end it",
    "end it all",
    "end my life",
    "end this life",
    "want to die",
    "i want to die",
    "need to die",
    "i need to die",
    "have to die",
    "i have to die",
    "should die",
    "i should die",
    "deserve to die",
    "i deserve to die",
    "supposed to die",
    "meant to die",
    "wish i was dead",
    "wish i were dead",
    "wish i wasn't alive",
    "kill myself",
    "want to suicide",
    "commit suicide",
    "take my own life",
    "not want to be alive",
    "don't want to live",
    "do not want to live",
    "don't want to live anymore",
    "don't want to be here anymore",
    "want to end it",
    "want it to end",
    "just want it to end",
    "i just want it to end",
    "want everything to end",
    "want to disappear forever",
    "better off dead",
    "better off without me",
    "world better off without me",
    "everyone better off without me",
 
    # inability / exhaustion framing
    "can't take this anymore",
    "cant take this anymore",
    "can't take it anymore",
    "cant take it anymore",
    "can't go on",
    "cant go on",
    "can't go on like this",
    "can't cope",
    "cant cope",
    "can't cope with this",
    "cant cope with this",
    "can't cope anymore",
    "can't handle this anymore",
    "cant handle this anymore",
    "can't handle it anymore",
    "too much to handle",
    "too much to bear",
    "can't bear this anymore",
    "can't do this anymore",
    "cant do this anymore",
    "don't want to fight anymore",
    "tired of living",
    "tired of life",
    "tired of everything",
    "tired of trying",
    "tired of fighting",
    "so tired of all this",
    "exhausted with life",
    "done with life",
    "done with everything",
    "i'm done",
    "i am done",
 
    # hopelessness framing
    "no point in continuing",
    "no point in living",
    "no point living",
    "no point in anything",
    "no point in trying anymore",
    "no reason to live",
    "no reason to go on",
    "nothing matters anymore",
    "nothing i do matters",
    "nothing will ever get better",
    "nothing left for me",
    "no way out",
    "feel hopeless",
    "completely hopeless",
    "i feel hopeless",
    "everything feels hopeless",
    "feel so empty inside",
    "feel like giving up",
    "i give up",
    "giving up on everything",
    "given up on me",
    "give up on me",
    "no one would miss me",
    "nobody would miss me",
    "nobody is helping me",
    "no one is listening to me",
    "no one cares if i'm gone",
    "no one would notice if i disappeared",
 
    # method/plan indicators (kept generic — flag toward High without naming methods)
    "have a plan to hurt myself",
    "thinking about hurting myself",
    "thought about ending my life",
    "self harm",
    "self-harm",
    "hurting myself",
    "hurt myself",
    "cutting myself",
    "harm myself",
]
 
THREAT_EXPLICIT = [
    "they said they'll hurt",
    "they said theyll hurt",
    "they threatened to kill",
    "they threatened my life",
    "will hurt my children",
    "hurt my children",
    "hurt my kids",
    "kill my children",
    "kill my family",
    "kill me",
    "going to kill me",
    "gonna kill me",
    "won't let me live",
    "wont let me live",
    "kill him",
    "kill her",
    "kill them",
    "hurt them",
    "hurt him",
    "hurt her",
    "said they would kill me",
    "said he would kill me",
    "said she would kill me",
    "threatened to hurt my family",
    "threatened to hurt my kids",
    "threatened to burn my house",
    "threatened with a weapon",
    "threatened me with a knife",
    "threatened me with a gun",
]
 
THREAT_VAGUE = [
    "threatening my family",
    "threatening me",
    "keep threatening",
    "keeps threatening",
    "being threatened",
    "feel threatened",
    "afraid they'll hurt",
    "afraid theyll hurt",
    "scared they'll hurt",
    "scared theyll hurt",
    "worried they'll hurt",
    "intimidating my family",
    "harassing my family",
    "following me around",
    "watching my house",
    "showed up at my house again",
]
 
VIOLENCE = [
    "beaten",
    "beaten up",
    "attacked",
    "attacked me",
    "assaulted",
    "assault",
    "raped",
    "sexually assaulted",
    "sexually abused",
    "hit me",
    "hit by",
    "hit repeatedly",
    "physically abused",
    "physically hurt me",
    "going to hurt",
    "i am going to hurt",
    "i'm going to hurt",
    "will hurt that person",
    "burned my house",
    "set fire to my house",
    "broke into my house",
    "dragged me",
    "choked me",
    "strangled me",
    "stabbed",
    "shot at",
    "threw acid",
    "acid attack",
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
