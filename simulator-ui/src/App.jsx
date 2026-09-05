import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { ToastProvider } from './components/Toast';
import { usePolling } from './hooks/usePolling';
import { api } from './services/api';
import Dashboard from './pages/Dashboard';
import Experiments from './pages/Experiments';
import Failures from './pages/Failures';
import Traffic from './pages/Traffic';
import Incidents from './pages/Incidents';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  )},
  { path: '/experiments', label: 'Experiments', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3v12l-3 3h12l-3-3V3"/>
      <path d="M8 3h8"/>
      <path d="M12 15v4"/>
      <circle cx="12" cy="9" r="2"/>
    </svg>
  )},
  { path: '/failures', label: 'Failures', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v4"/>
      <path d="M12 17h.01"/>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    </svg>
  )},
  { path: '/traffic', label: 'Traffic', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
    </svg>
  )},
  { path: '/incidents', label: 'Incidents', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )},
];

function Sidebar() {
  const fetchStatus = useCallback(() => api.getActiveFailures(), []);
  const { data: failures } = usePolling(fetchStatus, 5000);
  const failureCount = failures ? Object.keys(failures).length : 0;

  return (
    <aside className="fixed left-6 top-6 bottom-6 w-[200px] flex flex-col py-6 z-50">
      <NavLink to="/" className="mb-8 px-4 btn-press group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-shadow duration-300 flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#030303" stroke="#030303" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-white tracking-tight">ChaosCraft</span>
        </div>
      </NavLink>

      <nav className="flex-1 flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ease-premium group relative ${
                isActive
                  ? 'bg-white text-[#030303]'
                  : 'text-[rgba(255,255,255,0.35)] hover:text-[rgba(255,255,255,0.8)] hover:bg-[rgba(255,255,255,0.06)]'
              }`
            }
          >
            {item.icon}
            <span className="text-[13px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-4 mt-auto">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse-subtle ${
              failureCount > 0 ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]' : 'bg-emerald-400'
            }`} />
            <span className="text-[11px] text-white/30 font-medium">
              {failureCount > 0 ? `${failureCount} active issue${failureCount > 1 ? 's' : ''}` : 'All systems operational'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-fade-in">
      <Routes location={location}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/experiments" element={<Experiments />} />
        <Route path="/failures" element={<Failures />} />
        <Route path="/traffic" element={<Traffic />} />
        <Route path="/incidents" element={<Incidents />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <ScrollToTop />
        <div className="min-h-screen bg-[#030303] noise-overlay">
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(255,255,255,0.015)_0%,transparent_70%)]" />
          </div>

          <div className="relative z-10 flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-[230px] mr-8 py-8">
              <AnimatedRoutes />
            </main>
          </div>
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
