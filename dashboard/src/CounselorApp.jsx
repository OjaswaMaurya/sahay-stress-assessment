import { useState, useEffect, useCallback, useRef } from "react";
import CaseRow from "./components/CaseRow";
import CaseDetail from "./components/CaseDetail";
import AlertBanner from "./components/AlertBanner";
import "./CounselorApp.css";

const API_BASE = "http://127.0.0.1:8000";
const WS_URL = "ws://127.0.0.1:8000/ws/counselors";

function playAlertBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // audio not available in this browser/context — fail silently
  }
}

function sortCases(cases) {
  const order = { High: 3, Medium: 2, Low: 1 };
  return [...cases].sort((a, b) => {
    const diff = (order[b.severity] || 0) - (order[a.severity] || 0);
    if (diff !== 0) return diff;
    return b.updated_at - a.updated_at;
  });
}

// Add-or-replace by person_id — used for both "new_case" and "case_updated"
// so a case is never duplicated in state no matter which event names it.
function upsertCase(cases, updated) {
  const idx = cases.findIndex((c) => c.person_id === updated.person_id);
  if (idx === -1) return [...cases, updated];
  const next = [...cases];
  next[idx] = updated;
  return next;
}

function CounselorApp({ email, onLogout }) {
  const [cases, setCases] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [alert, setAlert] = useState(null);
  const wsRef = useRef(null);

  const refreshCases = useCallback(() => {
    return fetch(`${API_BASE}/cases`)
      .then((res) => res.json())
      .then((data) => setCases(sortCases(data)))
      .catch((err) => console.error("Failed to load cases", err));
  }, []);

  useEffect(() => {
    refreshCases();
  }, [refreshCases]);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "new_case") {
        setCases((prev) => sortCases(upsertCase(prev, msg.case)));
        if (msg.case.severity === "High") {
          setAlert(msg.case);
          playAlertBeep();
        }
      } else if (msg.type === "case_updated") {
        setCases((prev) => sortCases(upsertCase(prev, msg.case)));
      }
    };
    return () => ws.close();
  }, []);

  const selectedCase = cases.find((c) => c.person_id === selectedId) || null;

  return (
    <div className="cd-app">
      {alert && (
        <AlertBanner
          caseData={alert}
          onDismiss={() => setAlert(null)}
          onView={() => {
            setSelectedId(alert.person_id);
            setAlert(null);
          }}
        />
      )}
      <div className="cd-topbar">
        <span className="cd-brand">SAHAY — Counselor Queue</span>
        <div className="cd-topbar-right">
          <span>{email}</span>
          <span className={`cd-status${connected ? "" : " offline"}`}>
            <span className="cd-status-dot" />
            {connected ? "Live" : "Reconnecting…"}
          </span>
          <button className="cd-logout" onClick={onLogout}>Log out</button>
        </div>
      </div>
      <div className="cd-layout">
        <aside className="cd-queue">
          <div className="cd-queue-header">
            <span>Queue</span>
            <span>{cases.length}</span>
          </div>
          {cases.map((c) => (
            <CaseRow
              key={c.person_id}
              caseData={c}
              selected={c.person_id === selectedId}
              onClick={() => setSelectedId(c.person_id)}
            />
          ))}
        </aside>
        <main className="cd-detail">
          {selectedCase ? (
            <CaseDetail caseData={selectedCase} myEmail={email} onRefresh={refreshCases} />
          ) : (
            <div className="cd-detail-empty">Select a case from the queue to see details.</div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CounselorApp;