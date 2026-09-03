import os
import json
from src.pipeline import run_pipeline

audio_dir = "data/audio"
for filename in sorted(os.listdir(audio_dir)):
    if not filename.lower().endswith((".mp3", ".wav", ".m4a")):
        continue
    path = os.path.join(audio_dir, filename)
    print(f"\n{'='*60}")
    print(f"File: {filename}")
    print('='*60)
    try:
        result = run_pipeline(audio_path=path)
        print(f"Transcript: {result['input_text']}")
        print(f"Top emotion: {result['top_emotion']} ({result['confidence']})")
        print(f"Severity: {result['severity']}")
        print(f"Reasoning: {result['reasoning']}")
    except Exception as e:
        print(f"FAILED: {e}")