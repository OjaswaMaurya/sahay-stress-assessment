from transformers import pipeline

_sentiment_pipeline = None

def get_sentiment_pipeline():
    global _sentiment_pipeline
    if _sentiment_pipeline is None:
        _sentiment_pipeline = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            top_k=None,
        )
    return _sentiment_pipeline

def analyze_sentiment(text: str):
    clf = get_sentiment_pipeline()
    results = clf(text)[0]
    return sorted(results, key=lambda r: r["score"], reverse=True)