import whisper

_model = None

def get_model(size: str = "base"):
    global _model
    if _model is None:
        _model = whisper.load_model(size)
    return _model

def transcribe_audio(audio_path: str) -> str:
    model = get_model()
    result = model.transcribe(audio_path)
    return result["text"].strip()