from src.transcribe import transcribe_audio


def test_transcribe_audio():
    audio_path = "data/audio/test.mp3"

    result = transcribe_audio(audio_path)

    assert isinstance(result, str)
    assert result.strip() != ""