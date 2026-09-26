export default function Dashboard({ onStartCheck }) {
  return (
    <div className="content-scroll">

      {/* Hero check-in */}
      <div className="hero-card">
        <div className="hero-left">
          <div className="hero-eyebrow">Daily check-in</div>
          <div className="hero-title">
            How are you feeling today?<br />
            A two-minute check-in helps me understand you better.
          </div>
          <button className="cta-btn" onClick={onStartCheck}>
            Start Stress Check
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
        <div className="hero-avatar">
          <svg viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="26" r="9" fill="#2C5952" />
            <circle cx="26" cy="26" r="15.5" stroke="#2C5952" strokeWidth="1.4" opacity="0.45" />
            <circle cx="22.5" cy="24" r="1.4" fill="#fff" />
            <circle cx="29.5" cy="24" r="1.4" fill="#fff" />
            <path d="M22 29.5c1.4 1.4 6.6 1.4 8 0" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Gauge + trend */}
      <div className="row-two">
        <div className="card gauge-card">
          <div style={{ width: '100%' }}>
            <div className="card-title">Stress severity</div>
            <div className="card-caption">Based on today's signals</div>
          </div>
          <div className="gauge-wrap">
            <svg viewBox="0 0 220 130" width="100%">
              <defs>
                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4C8C82" />
                  <stop offset="100%" stopColor="#E7B84F" />
                </linearGradient>
              </defs>
              <path d="M20,120 A90,90 0 0 1 200,120" fill="none" stroke="#EDE9E0" strokeWidth="16" strokeLinecap="round" />
              <path d="M20,120 A90,90 0 0 1 200,120" fill="none" stroke="url(#gaugeGrad)" strokeWidth="16" strokeLinecap="round" strokeDasharray="118 283" />
            </svg>
          </div>
          <div className="gauge-score">
            <div className="num">42<span>/100</span></div>
            <div className="gauge-tag">Moderate stress</div>
          </div>
        </div>

        <div className="card trend-card">
          <div className="trend-head">
            <div>
              <div className="card-title">7-day stress trend</div>
              <div className="card-caption">How your levels moved this week</div>
            </div>
            <div className="trend-legend">
              <span><span className="dot" style={{ background: 'var(--teal)' }} />Stress level</span>
            </div>
          </div>
          <div className="trend-chart">
            <svg viewBox="0 0 620 160" width="100%" height="150">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4C8C82" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#4C8C82" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,107 C34,103 69,97 103,97 C137,97 172,101 206,101 C240,101 275,90 309,90 C343,90 378,94 412,94 C446,94 481,79 515,79 C549,79 584,86 618,86 L618,160 L0,160 Z" fill="url(#areaGrad)" />
              <path d="M0,107 C34,103 69,97 103,97 C137,97 172,101 206,101 C240,101 275,90 309,90 C343,90 378,94 412,94 C446,94 481,79 515,79 C549,79 584,86 618,86" fill="none" stroke="#4C8C82" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="515" cy="79" r="4.5" fill="#fff" stroke="#4C8C82" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="trend-days">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
      </div>

      {/* Insight tiles */}
      <div className="tiles-row">
        <div className="tile">
          <div className="tile-icon" style={{ background: 'var(--blue-soft)', color: '#3E6B82' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 13.5A8.5 8.5 0 1 1 10.5 4a6.8 6.8 0 0 0 9.5 9.5z" />
            </svg>
          </div>
          <div className="tile-label">Sleep quality</div>
          <div className="tile-value">7.2 hrs</div>
        </div>
        <div className="tile">
          <div className="tile-icon" style={{ background: 'var(--lavender)', color: 'var(--lavender-deep)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M9 10h.01M15 10h.01" />
              <path d="M8.5 14.5c1 1 5 1 7 0" />
            </svg>
          </div>
          <div className="tile-label">Mood</div>
          <div className="tile-value">Calm</div>
        </div>
        <div className="tile">
          <div className="tile-icon" style={{ background: 'var(--yellow-soft)', color: '#A97417' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 3 5 13.5h5.5L11 21l8-11h-5.5z" />
            </svg>
          </div>
          <div className="tile-label">Energy</div>
          <div className="tile-value">Moderate</div>
        </div>
        <div className="tile">
          <div className="tile-icon" style={{ background: 'var(--teal-soft)', color: 'var(--teal-deep)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 13h3.5l2-6 3.5 12 2.5-9 1.5 4H20" />
            </svg>
          </div>
          <div className="tile-label">Top trigger</div>
          <div className="tile-value">Work deadlines</div>
        </div>
      </div>

      {/* AI insight banner */}
      <div className="insight-banner">
        <div className="insight-avatar">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" fill="#9C8FD1" />
            <circle cx="12" cy="12" r="7.5" stroke="#9C8FD1" strokeWidth="1.2" opacity="0.5" />
          </svg>
        </div>
        <div className="insight-text">
          <b>Sahayak noticed something.</b> Your stress has increased slightly over the last 3 days. A short breathing exercise could help bring it back down.
        </div>
        <div className="insight-link">Try a breathing exercise</div>
      </div>

      {/* Recommended */}
      <div>
        <div className="card-title" style={{ marginBottom: '12px' }}>Recommended for you</div>
        <div className="rec-row">
          <div className="rec-card">
            <div className="rec-icon" style={{ background: 'var(--teal-soft)', color: 'var(--teal-deep)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="12" r="7" opacity="0.7" />
                <circle cx="12" cy="12" r="10.5" opacity="0.4" />
              </svg>
            </div>
            <div className="rec-title">5-minute breathing exercise</div>
            <div className="rec-sub">Guided · calms nervous system</div>
          </div>
          <div className="rec-card">
            <div className="rec-icon" style={{ background: 'var(--lavender)', color: 'var(--lavender-deep)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9l-4 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-7z" />
              </svg>
            </div>
            <div className="rec-title">Talk to Sahayak</div>
            <div className="rec-sub">Open chat · always here to listen</div>
          </div>
          <div className="rec-card">
            <div className="rec-icon" style={{ background: 'var(--yellow-soft)', color: '#A97417' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
            <div className="rec-title">Take a mindful break</div>
            <div className="rec-sub">3 minutes · step away and reset</div>
          </div>
        </div>
      </div>

    </div>
  );
}