function CaseDetail({ caseData, onMarkReviewed }) {
  const sevLower = caseData.severity.toLowerCase();
  return (
    <div>
      <span className={`cd-badge ${sevLower}`}>{caseData.severity} severity</span>
      <h2 style={{ margin: "0 0 4px" }}>Case transcript</h2>
      <p>{caseData.input_text}</p>

      <div className="cd-section-title">Why it was flagged</div>
      <p>{caseData.reasoning}</p>

      <div className="cd-section-title">Detected emotion</div>
      <p>{caseData.top_emotion} (confidence {caseData.confidence})</p>

      <div className="cd-section-title">Supportive reply sent to caller</div>
      <p>{caseData.counselor_reply}</p>

      {caseData.status !== "reviewed" && (
        <button className="cd-detail-btn" onClick={onMarkReviewed}>
          Mark reviewed
        </button>
      )}
    </div>
  );
}

export default CaseDetail;
