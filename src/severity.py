"""
severity.py
Multi-signal severity fusion engine for SAHAY.

Combines:
  1. Emotion model output (from sentiment.py) - top emotion + confidence
  2. Keyword safety-net (from keywords.py) - self_harm / threat / violence

Rule: keyword match ALWAYS overrides the ML score. We never fully trust
the model alone for a decision this sensitive (per anticipated judge Q2).
"""

# Emotions that indicate distress when the keyword layer finds nothing.
# fear/sadness are the most reliable single-emotion distress signals from
# the j-hartmann emotion model; anger is treated more cautiously since it
# can also fire on frustration about case delays etc. (see LOW example:
# "wanted to ask about status" should NOT be High).
HIGH_RISK_EMOTIONS = {"fear", "sadness"}
MEDIUM_RISK_EMOTIONS = {"fear", "sadness", "anger"}

HIGH_CONFIDENCE_THRESHOLD = 0.80
MEDIUM_CONFIDENCE_THRESHOLD = 0.50


def compute_severity(emotion_result: dict, keyword_result: dict) -> dict:
    """
    Args:
        emotion_result: {"label": str, "score": float}  (top emotion from sentiment.py)
        keyword_result: output of contains_flagged_keywords()

    Returns:
        {
            "severity": "Low" | "Medium" | "High",
            "reasoning": str,   # human-readable, shown to counselor for transparency
            "source": "keyword_override" | "emotion_model",
        }
    """
    # --- 1. Keyword safety-net always wins ---
    if keyword_result.get("matched"):
        category = keyword_result["category"]
        phrase = keyword_result["matched_phrase"]
        reasoning = (
            f"Auto-escalated to High: matched {category.replace('_', ' ')} "
            f"keyword pattern (\"{phrase}\"), overriding model score."
        )
        return {"severity": "High", "reasoning": reasoning, "source": "keyword_override"}

    # --- 2. Fall back to emotion-model-based scoring ---
    label = emotion_result.get("label", "").lower()
    score = float(emotion_result.get("score", 0.0))

    if label in HIGH_RISK_EMOTIONS and score >= HIGH_CONFIDENCE_THRESHOLD:
        severity = "High"
    elif label in MEDIUM_RISK_EMOTIONS and score >= MEDIUM_CONFIDENCE_THRESHOLD:
        severity = "Medium"
    else:
        severity = "Low"

    reasoning = (
        f"Based on emotion model: top emotion '{label}' with confidence "
        f"{round(score, 3)}, no safety-net keywords matched."
    )
    return {"severity": severity, "reasoning": reasoning, "source": "emotion_model"}
