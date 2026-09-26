import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import StressAnalysis from './components/StressAnalysis';
import AiChat from './components/AiChat';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const knownViews = ['dashboard', 'profile', 'stress-analysis', 'aichat'];

  return (
    <div className="app">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="main">
        <div className="topbar">
          <div>
            <div className="greeting">Good Morning Dear</div>
            <div className="greeting-sub">Let's check in with yourself today.</div>
          </div>
          <div className="topbar-right">
            <div className="topbar-date">Thursday, 4 September</div>
          </div>
        </div>

        {activeView === 'dashboard' && <Dashboard onStartCheck={() => setActiveView('aichat')} />}
        {activeView === 'profile' && <Profile />}
        {activeView === 'stress-analysis' && <StressAnalysis />}
        {activeView === 'aichat' && <AiChat />}
        {!knownViews.includes(activeView) && (
          <div className="view-placeholder">{activeView} view — coming next</div>
        )}
      </main>
    </div>
  );
}

export default App;