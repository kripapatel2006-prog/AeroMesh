import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Plus, Activity, Box, Layers, Cpu, Settings } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import NewMission from './pages/NewMission';
import Processing from './pages/Processing';
import Viewer3D from './pages/Viewer3D';
import Architecture from './pages/Architecture';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/new': 'New Mission',
  '/processing': 'Mission Processing',
  '/viewer': '3D Viewer Workspace',
  '/architecture': 'System Architecture',
};

const Sidebar = () => {
  const location = useLocation();
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
        <div className="nav-link" style={{ cursor: 'default' }}>
          <Cpu size={16} />
          Edge Processing
        </div>
        <div className="nav-link" style={{ cursor: 'default' }}>
          <Settings size={16} />
          Settings
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="status-indicator-card">
          <div className="title">System Status</div>
          <div className="status-row-small">
            <span className="pulse-dot"></span>
            Edge Compute Online
          </div>
        </div>
      </div>
    </div>
  );
};

const Topbar = () => {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'AeroMesh';
  return (
    <div className="topbar">
      <span className="topbar-title">{title}</span>
      <span className="badge badge-demo">Demo Mode</span>
      <span className="badge badge-success">
        <span className="pulse-dot" style={{ width: '6px', height: '6px', marginRight: '2px' }}></span>
        Edge Online
      </span>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          <Topbar />
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
