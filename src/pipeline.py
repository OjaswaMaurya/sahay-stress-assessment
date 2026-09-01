from src.transcribe import transcribe_audio
from src.sentiment import analyze_sentiment
from src.keywords import contains_flagged_keywords
from src.severity import compute_severity

def run_pipeline(text: str = None, audio_path: str = None):
    if audio_path:
        text = transcribe_audio(audio_path)
    if not text:
        raise ValueError("Provide either text or audio_path")

    emotions = analyze_sentiment(text)
    top = emotions[0]

    keyword_result = contains_flagged_keywords(text)
    severity_result = compute_severity(top, keyword_result)

    return {
        "input_text": text,
        "top_emotion": top["label"],
        "confidence": round(top["score"], 3),
        "all_emotions": emotions,
        "severity": severity_result["severity"],
        "reasoning": severity_result["reasoning"],
    }

if __name__ == "__main__":
    with open("data/sample_transcripts.txt") as f:
        lines = [l.strip().split(": ", 1)[1] for l in f if l.strip()]

    for line in lines:
        result = run_pipeline(text=line)
        print(f"\nInput: {result['input_text']}")
        print(f"Top emotion: {result['top_emotion']}  (confidence {result['confidence']})")
        print(f"Severity: {result['severity'].upper()}")
        print(f"Reasoning: {result['reasoning']}")
