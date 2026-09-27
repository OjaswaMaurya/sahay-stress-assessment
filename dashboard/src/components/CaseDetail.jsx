import { useState } from "react";
 
const API_BASE = "http://127.0.0.1:8000";
 
function CaseDetail({ caseData, myEmail, onRefresh }) {
  const [messageText, setMessageText] = useState("");
  const [transferTo, setTransferTo] = useState("");
 
  const isMine = caseData.assigned_to === myEmail;
  const isUnclaimed = !caseData.assigned_to;
 
  async function claim() {
    await fetch(`${API_BASE}/cases/${caseData.person_id}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ counselor_email: myEmail }),
    });
    onRefresh();
  }
 
  async function sendMessage() {
    if (!messageText.trim()) return;
    await fetch(`${API_BASE}/cases/${caseData.person_id}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ counselor_email: myEmail, text: messageText.trim() }),
    });
    setMessageText("");
    onRefresh();
  }
 
  async function toggleAI() {
    await fetch(`${API_BASE}/cases/${caseData.person_id}/ai-toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ counselor_email: myEmail, enabled: !caseData.ai_enabled }),
    });
    onRefresh();
  }
 
  async function transfer() {
    if (!transferTo.trim()) return;
    await fetch(`${API_BASE}/cases/${caseData.person_id}/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ by_counselor_email: myEmail, to_counselor_email: transferTo.trim() }),
    });
    setTransferTo("");
    onRefresh();
  }
 
  return (
    <div>
      <span className={`cd-badge ${caseData.severity.toLowerCase()}`}>{caseData.severity} severity</span>
      <div className="cd-section-title">Person</div>
      <p>{caseData.person_name} <span style={{ color: "var(--cd-muted)" }}>({caseData.person_id})</span></p>
 
      {isUnclaimed && (
        <button className="cd-detail-btn" onClick={claim}>Claim this case</button>
      )}
      {!isUnclaimed && !isMine && (
        <p style={{ color: "var(--cd-muted)" }}>Claimed by {caseData.assigned_to} — you can't act on this case.</p>
      )}
 
      <div className="cd-section-title">Conversation</div>
      <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 12 }}>
        {caseData.messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <strong>{m.sender_name}:</strong> {m.text}
          </div>
        ))}
      </div>
 
      {isMine && (
        <>
          <div className="cd-section-title">Why it was flagged</div>
          <p>{caseData.reasoning}</p>
 
          <label style={{ display: "block", margin: "12px 0" }}>
            <input type="checkbox" checked={caseData.ai_enabled} onChange={toggleAI} /> AI auto-reply enabled
          </label>
 
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="Type a message to send…"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="cd-detail-btn" onClick={sendMessage}>Send</button>
          </div>
 
          <div className="cd-section-title">Transfer this case</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="Other counselor's email"
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="cd-detail-btn" onClick={transfer}>Transfer</button>
          </div>
        </>
      )}
    </div>
  );
}
 
export default CaseDetail;
 