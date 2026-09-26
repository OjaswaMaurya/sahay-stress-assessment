import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT_BASE = """You are a supportive first-response message generator for a
national helpline serving victims of atrocities and complainants in distress.
You are NOT a licensed counselor, therapist, or human — never claim or imply
that you are.

Write ONE short message (2-4 sentences) that:
- Acknowledges what the person said, without judgment
- Uses plain, calm, non-clinical language
- Never diagnoses, labels, or analyzes their mental state
- Never gives medical, legal, or clinical advice
- Always makes clear a human counselor is available, and encourages
  connecting with one

No bullet points, no headers, no long paragraphs."""

SEVERITY_ADDENDUM = {
    "Low": "This case is Low severity. A brief, friendly, reassuring message is appropriate.",
    "Medium": "This case is Medium severity. Validate their distress and gently "
              "encourage speaking with a human counselor soon.",
    "High": "This is a HIGH severity case. Your message MUST clearly and "
            "immediately encourage them to stay with us and connect with a human "
            "counselor right now, and state that a counselor is being alerted. "
            "Do not attempt to resolve or counsel the situation yourself — your "
            "only job is a compassionate bridge to human help.",
}

FALLBACK_REPLIES = {
    "Low": "Thank you for reaching out. We've received your message, and a counselor is available if you'd like to talk further.",
    "Medium": "I hear that this has been difficult for you. A counselor is available to talk with you now, if you'd like.",
    "High": "I hear you, and what you're going through matters. A counselor is being alerted right now to connect with you directly — please stay with us.",
}


def generate_supportive_reply(text: str, severity: str) -> str:
    if severity == "High":
        # High severity bypasses the LLM entirely — a guaranteed, pre-written
        # message matters more than personalization when someone may be in crisis.
        return FALLBACK_REPLIES["High"]
    system_prompt = SYSTEM_PROMPT_BASE + "\n\n" + SEVERITY_ADDENDUM.get(
        severity, SEVERITY_ADDENDUM["Medium"]
    )
    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text},
            ],
            max_tokens=150,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"GROQ CALL FAILED: {e}")
        return FALLBACK_REPLIES.get(severity, FALLBACK_REPLIES["Medium"])