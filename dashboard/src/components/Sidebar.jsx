const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'aichat', label: 'AI Chat' },
  { key: 'profile', label: 'Profile' },
  { key: 'stress-analysis', label: 'Stress Analysis' },
  { key: 'anonymous-calls', label: 'Anonymous Calls' },
  { key: 'breathing', label: 'Breathing & Relaxation' },
  { key: 'history', label: 'History' },
  { key: 'settings', label: 'Settings' },
];

export default function Sidebar({ activeView, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" />
        <div>
          <div className="brand-name">SAHAYAK</div>
          <div className="brand-sub">your quiet companion</div>
        </div>
      </div>

      <nav>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.key}
            className={`nav-item${activeView === item.key ? ' active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            {item.label}
          </div>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      <div className="sidebar-profile">
        <div className="avatar-sm" />
        <div>
          <div className="name">Aditi Rao</div>
          <div className="role">Free plan</div>
        </div>
      </div>
    </aside>
  );
}