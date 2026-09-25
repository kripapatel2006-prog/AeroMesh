import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Plus, Activity, Box, Layers, Cpu, Settings, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import NewMission from './pages/NewMission';
import Processing from './pages/Processing';
import Viewer3D from './pages/Viewer3D';
import Architecture from './pages/Architecture';
import { useMissionStore } from './store/missionStore';

const PAGE_TITLES = {
  '/': 'Mission Intelligence Dashboard',
  '/new': 'New Survey Mission',
  '/processing': 'Reconstruction Pipeline',
  '/viewer': '3D Geospatial Workspace',
  '/architecture': 'System Architecture',
};

const Sidebar = () => {
  const location = useLocation();
  const { isBackendOnline } = useMissionStore();

  const navItems = [
    { name: 'Dashboard',    path: '/',             icon: <LayoutDashboard size={16} /> },
    { name: 'New Mission',  path: '/new',          icon: <Plus size={16} /> },
    { name: 'Processing',   path: '/processing',   icon: <Activity size={16} /> },
    { name: '3D Viewer',    path: '/viewer',       icon: <Box size={16} /> },
    { name: 'Architecture', path: '/architecture', icon: <Layers size={16} /> },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-wordmark">
          <span className="accent">Aero</span>Mesh
        </div>
        <div className="logo-tag">Single-Pass Reconstruction</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`nav-link${location.pathname === item.path ? ' active' : ''}`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}

        <div className="nav-section-label" style={{ marginTop: '16px' }}>System</div>
        <Link to="/architecture" className="nav-link">
          <Cpu size={16} />
          Edge CV Engine
        </Link>
        <div className="nav-link" style={{ opacity: 0.6, cursor: 'default' }}>
          <Settings size={16} />
          Telemetry Config
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="status-indicator-card">
          <div className="title">Engine Core</div>
          <div className="status-row-small">
            <span
              className="pulse-dot"
              style={{
                backgroundColor: isBackendOnline ? 'var(--success)' : 'var(--danger)',
              }}
            ></span>
            {isBackendOnline ? 'FastAPI + OpenCV Active' : 'Backend Disconnected'}
          </div>
        </div>
      </div>
    </div>
  );
};

const Topbar = () => {
  const location = useLocation();
  const { isBackendOnline, activeMission } = useMissionStore();
  const title = PAGE_TITLES[location.pathname] || 'AeroMesh';

  return (
    <div className="topbar">
      <span className="topbar-title">
        {title}
        {activeMission && (
          <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '12px' }}>
            // AM-{activeMission.id}: {activeMission.name}
          </span>
        )}
      </span>

      {activeMission?.is_demo && (
        <span className="badge badge-demo">Demo Mode</span>
      )}

      {isBackendOnline ? (
        <span className="badge badge-success">
          <Wifi size={12} style={{ marginRight: '4px' }} />
          Core Online
        </span>
      ) : (
        <span className="badge badge-warning" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
          <WifiOff size={12} style={{ marginRight: '4px' }} />
          Core Offline
        </span>
      )}
    </div>
  );
};

function App() {
  const { checkHealth, fetchMissions, error, clearError } = useMissionStore();

  useEffect(() => {
    checkHealth();
    fetchMissions();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                borderBottom: '1px solid var(--danger)',
                padding: '8px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#fca5a5',
                fontSize: '12.5px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={15} color="var(--danger)" />
                <span>{error}</span>
              </div>
              <button
                onClick={clearError}
                style={{ color: '#fff', fontSize: '11px', textDecoration: 'underline' }}
              >
                Dismiss
              </button>
            </div>
          )}
          <div className="page-content">
            <Routes>
              <Route path="/"             element={<Dashboard />} />
              <Route path="/new"          element={<NewMission />} />
              <Route path="/processing"   element={<Processing />} />
              <Route path="/viewer"       element={<Viewer3D />} />
              <Route path="/architecture" element={<Architecture />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
