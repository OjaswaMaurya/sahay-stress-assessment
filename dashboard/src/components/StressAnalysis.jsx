const CHECKINS = [
  { day: 'Today', time: '9:42 AM', snippet: '"Deadlines have been piling up, feeling a bit on edge."', severity: 'moderate' },
  { day: 'Yesterday', time: '7:15 PM', snippet: '"Had a decent day, went for a walk in the evening."', severity: 'low' },
  { day: '2 days ago', time: '11:03 PM', snippet: '"Couldn\'t sleep, kept thinking about the exam results."', severity: 'high' },
  { day: '4 days ago', time: '8:20 AM', snippet: '"Feeling steady, just a normal amount of work pressure."', severity: 'low' },
  { day: '6 days ago', time: '6:48 PM', snippet: '"Anxious about the upcoming presentation, hard to focus."', severity: 'moderate' },
];

function SeverityBadge({ level }) {
  const label = level.charAt(0).toUpperCase() + level.slice(1);
  return (
    <div className={`chat-severity-badge ${level}`}>
      <span className="dot-sm" />
      {label}
    </div>
  );
}

export default function StressAnalysis() {
  return (
    <div className="stress-scroll">

      <div className="card trend-card-lg">
        <div className="trend-head">
          <div>
            <div className="card-title">Stress trend</div>
            <div className="card-caption">Your stress levels over the last 7 days</div>
          </div>
          <div className="trend-legend">
            <span><span className="dot" style={{ background: 'var(--teal)' }} />Stress level</span>
          </div>
        </div>
        <div className="trend-chart-lg">
          <svg viewBox="0 0 1180 220" width="100%" height="200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGradLg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4C8C82" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#4C8C82" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,150 C65,142 130,130 196,130 C262,130 328,140 393,140 C459,140 524,120 590,120 C655,120 721,128 786,128 C852,128 917,98 983,98 C1049,98 1114,112 1180,112 L1180,220 L0,220 Z" fill="url(#areaGradLg)" />
            <path d="M0,150 C65,142 130,130 196,130 C262,130 328,140 393,140 C459,140 524,120 590,120 C655,120 721,128 786,128 C852,128 917,98 983,98 C1049,98 1114,112 1180,112" fill="none" stroke="#4C8C82" strokeWidth="3" strokeLinecap="round" />
            <circle cx="983" cy="98" r="5.5" fill="#fff" stroke="#4C8C82" strokeWidth="3" />
          </svg>
        </div>
        <div className="trend-days">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </div>

      <div className="signal-row">
        <div className="signal-card">
          <div className="signal-icon" style={{ background: 'var(--blue-soft)', color: '#3E6B82' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9l-4 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-7z" />
            </svg>
          </div>
          <div className="signal-label">Text sentiment</div>
          <div className="signal-value">Moderate</div>
          <div className="signal-bar"><div className="signal-bar-fill" style={{ width: '52%', background: 'var(--yellow)' }} /></div>
          <div className="signal-caption">Based on recent chat messages</div>
        </div>
        <div className="signal-card">
          <div className="signal-icon" style={{ background: 'var(--lavender)', color: 'var(--lavender-deep)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M5 12H1M23 12h-4M5.6 5.6l2.8 2.8M18.4 5.6l-2.8 2.8M5.6 18.4l2.8-2.8M18.4 18.4l-2.8-2.8" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <div className="signal-label">Vocal stress</div>
          <div className="signal-value">Low</div>
          <div className="signal-bar"><div className="signal-bar-fill" style={{ width: '24%', background: 'var(--teal)' }} /></div>
          <div className="signal-caption">Based on recent call audio</div>
        </div>
        <div className="signal-card">
          <div className="signal-icon" style={{ background: '#F7E3DE', color: '#B9583D' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </svg>
          </div>
          <div className="signal-label">Keyword flags</div>
          <div className="signal-value">2 flagged</div>
          <div className="signal-bar"><div className="signal-bar-fill" style={{ width: '38%', background: '#D9714F' }} /></div>
          <div className="signal-caption">Safety-net keyword matches this week</div>
        </div>
      </div>

      <div className="card checkins-card">
        <div className="card-title">Past check-ins</div>
        <div className="card-caption">Your recent stress assessment history</div>

        <div className="checkins-list">
          {CHECKINS.map((c, i) => (
            <div className="checkin-row" key={i}>
              <div className="checkin-date">
                <div className="checkin-day">{c.day}</div>
                <div className="checkin-time">{c.time}</div>
              </div>
              <div className="checkin-snippet">{c.snippet}</div>
              <SeverityBadge level={c.severity} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}