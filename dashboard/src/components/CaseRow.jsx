function timeAgo(timestamp) {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function CaseRow({ caseData, selected, onClick }) {
  const sevLower = caseData.severity.toLowerCase();
  return (
    <div
      className={`cd-row${selected ? " selected" : ""}${caseData.status === "reviewed" ? " reviewed" : ""}`}
      onClick={onClick}
    >
      <div className={`cd-stripe ${sevLower}`} />
      <div>
        <div className="cd-row-text">{caseData.input_text}</div>
        <div className="cd-row-meta">
          {caseData.severity} · {timeAgo(caseData.timestamp)}
        </div>
      </div>
    </div>
  );
}

export default CaseRow;