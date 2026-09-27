import { useState, useRef, useEffect } from 'react';
 
const API_BASE = 'http://127.0.0.1:8000';
const WS_BASE = 'ws://127.0.0.1:8000';
 
function normalizeSeverity(raw) {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (s.includes('high')) return 'high';
  if (s.includes('med') || s.includes('moderate')) return 'moderate';
  if (s.includes('low')) return 'low';
  return null;
}
 
function SeverityBadge({ level }) {
  if (!level) return null;
  const label = level.charAt(0).toUpperCase() + level.slice(1);
  return (
    <div className={`chat-severity-badge ${level}`}>
      <span className="dot-sm" />
      {label} severity
    </div>
  );
}
 
// Backend sends { sender: "victim"|"assistant"|"counselor", sender_name, text, timestamp }.
// Map that onto the local render shape this component already uses.
function mapServerMessage(m, idx) {
  let sender = 'ai';
  if (m.sender === 'victim') sender = 'user';
  else if (m.sender === 'assistant') sender = 'ai';
  else if (m.sender === 'counselor') sender = 'counselor';
  return { id: idx, sender, text: m.text, senderName: m.sender_name, severity: null };
}
 
let nextId = 1;
 
export default function AiChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messagesToday, setMessagesToday] = useState(0);
  const [currentTrend, setCurrentTrend] = useState(null);
  const listRef = useRef(null);
 
  const personId = localStorage.getItem('sahayPersonId');
  const personName = localStorage.getItem('sahayPersonName');
 
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isSending]);
 
  // Live channel for messages a counselor sends outside the normal
  // request/response cycle (i.e. not right after you send something).
  useEffect(() => {
    if (!personId) return;
    const ws = new WebSocket(`${WS_BASE}/ws/victim/${personId}`);
    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === 'new_message') {
        setMessages((prev) => [...prev, mapServerMessage(payload.message, prev.length)]);
      }
    };
    return () => ws.close();
  }, [personId]);
 
  async function sendMessage() {
    const text = input.trim();
    if (!text || isSending) return;
    if (!personId || !personName) {
      setMessages((prev) => [
        ...prev,
        { id: nextId++, sender: 'ai', text: 'Please log in again — your session info is missing.', severity: null },
      ]);
      return;
    }
 
    setInput('');
    setIsSending(true);
    setMessagesToday((prev) => prev + 1);
 
    try {
      const res = await fetch(`${API_BASE}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person_id: personId, person_name: personName, text }),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const caseData = await res.json();
 
      const severity = normalizeSeverity(caseData.severity);
      const mapped = caseData.messages.map((m, i) => mapServerMessage(m, i));
 
      // Attach the severity badge to the most recent user message, matching
      // the original design (severity is case-level now, not per-message).
      for (let i = mapped.length - 1; i >= 0; i--) {
        if (mapped[i].sender === 'user') {
          mapped[i].severity = severity;
          break;
        }
      }
 
      setMessages(mapped);
      setCurrentTrend(severity);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId++,
          sender: 'ai',
          text: "I'm having trouble reaching the server right now. Please try again in a moment.",
          severity: null,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }
 
  function handleKeyDown(e) {
    if (e.key === 'Enter') sendMessage();
  }
 
  return (
    <div className="chat-view-layout">
      <div className="chat-main">
        <div className="chat-main-header">
          <div className="avatar-md">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" fill="#4C8C82" />
              <circle cx="12" cy="12" r="7.5" stroke="#4C8C82" strokeWidth="1.2" opacity="0.5" />
            </svg>
          </div>
          <div>
            <div className="title">Sahayak</div>
            <div className="subtitle">Always here to listen</div>
          </div>
        </div>
 
        <div className="chat-message-list" ref={listRef}>
          {messages.length === 0 ? (
            <div className="chat-empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9l-4 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-7z" />
              </svg>
              <div className="line-1">Start a conversation</div>
              <div className="line-2">Type a message below to begin</div>
            </div>
          ) : (
            messages.map((m) => (
              <div className={`chat-bubble-row ${m.sender}`} key={m.id}>
                {m.sender === 'counselor' && <div className="chat-sender-name">{m.senderName}</div>}
                <div className="chat-bubble">{m.text}</div>
                {m.sender === 'user' && <SeverityBadge level={m.severity} />}
              </div>
            ))
          )}
          {isSending && (
            <div className="chat-typing-row">
              <div className="chat-typing-bubble"><span /><span /><span /></div>
            </div>
          )}
        </div>
 
        <div className="chat-input-bar">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            disabled={isSending}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="chat-send-btn" onClick={sendMessage} disabled={isSending}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
 
      <div className="chat-panel">
        <div className="chat-panel-card">
          <div className="chat-panel-title">Session summary</div>
          <div className="chat-panel-caption">Current trend &amp; message count update live</div>
 
          <div className="chat-panel-stat-row">
            <div className="chat-panel-stat-label">Current trend</div>
            <div className="chat-panel-stat-value with-dot">
              <span className={`chat-panel-trend-dot ${currentTrend || ''}`} />
              <span>{currentTrend ? currentTrend.charAt(0).toUpperCase() + currentTrend.slice(1) : 'No data yet'}</span>
            </div>
          </div>
          <div className="chat-panel-stat-row">
            <div className="chat-panel-stat-label">7-day avg stress</div>
            <div className="chat-panel-stat-value">42/100</div>
          </div>
          <div className="chat-panel-stat-row">
            <div className="chat-panel-stat-label">Messages today</div>
            <div className="chat-panel-stat-value">{messagesToday}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
 