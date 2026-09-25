import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Plus, Activity, Database, Clock, Crosshair,
  MapPin, Cpu, CheckCircle2, AlertTriangle, MonitorPlay
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);

  useEffect(() => {
    setMissions([
      { id: 1, name: 'Hyderabad Infrastructure', location: '17.38°N, 78.48°E', duration: '14m 22s', frames: 4250,  status: 'Completed',  accuracy: '0.82 m', date: '2026-09-20' },
      { id: 2, name: 'Disaster Recon — Zone B',  location: '23.02°N, 72.57°E', duration: '28m 15s', frames: 8100,  status: 'Processing', accuracy: '—',      date: '2026-09-21' },
      { id: 3, name: 'Agricultural Survey',       location: '18.52°N, 73.85°E', duration: '45m 00s', frames: 12050, status: 'Ready',      accuracy: '1.20 m', date: '2026-09-18' },
    ]);
  }, []);

  return (
    <div className="animate-in">

      {/* Hero */}
      <div className="hero-card">
        <div className="hero-badge-wrapper">
          <span className="badge badge-demo">Demo Mode</span>
        </div>
        <div className="hero-title"><span>Aero</span>Mesh</div>
        <div className="hero-subtitle">Single-Pass Drone Reconstruction</div>
        <div className="hero-desc">
          Transform a single UAV flight into a georeferenced 3D model.
          Edge-optimised pipeline for rapid situational awareness and geospatial intelligence.
        </div>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => navigate('/processing')}>
            <Play size={15} /> Launch Demo Mission
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/new')}>
            <Plus size={15} /> New Mission
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatCard label="Active Missions"          value="2"      icon={<Activity size={16} style={{color:'#38BDF8'}} />} trend="+1 since yesterday" />
        <StatCard label="Processed Models"         value="142"    icon={<Database size={16} style={{color:'#22C55E'}} />} trend="+12 this week" />
        <StatCard label="Avg Processing Time"      value="04:32"  icon={<Clock size={16}    style={{color:'#F59E0B'}} />} trend="−2 min from baseline" />
        <StatCard label="Georeferencing Accuracy"  value="≤ 1 m"  icon={<Crosshair size={16} style={{color:'#22D3EE'}} />} trend="Consistent" />
      </div>

      {/* Main grid */}
      <div className="two-col-grid">

        {/* Missions table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Database size={15} /> Recent Missions
            </span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mission</th>
                  <th>Location</th>
                  <th>Duration</th>
                  <th>Frames</th>
                  <th>Status</th>
                  <th>Accuracy</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {missions.map(m => (
                  <tr key={m.id}>
                    <td style={{fontWeight:600}}>{m.name}</td>
                    <td className="muted">
                      <span style={{display:'flex', alignItems:'center', gap:'5px'}}>
                        <MapPin size={12} style={{color:'var(--text-dim)', flexShrink:0}} />
                        {m.location}
                      </span>
                    </td>
                    <td className="muted">{m.duration}</td>
                    <td className="mono">{m.frames.toLocaleString()}</td>
                    <td><StatusBadge status={m.status} /></td>
                    <td className="mono">{m.accuracy}</td>
                    <td className="muted">{m.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Cpu size={15} /> System Status
            </span>
          </div>
          <div className="card-body">
            <SysRow label="Video Processing" />
            <SysRow label="SfM Engine" />
            <SysRow label="MVS Engine" />
            <SysRow label="Georeferencing" />
            <SysRow label="3D Renderer" />

            <div style={{marginTop:'20px', padding:'14px', background:'var(--bg-base)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', display:'flex', alignItems:'flex-start', gap:'12px'}}>
              <MonitorPlay size={18} style={{color:'var(--accent)', marginTop:'1px', flexShrink:0}} />
              <div>
                <div style={{fontSize:'12.5px', fontWeight:700, color:'var(--text-primary)', marginBottom:'4px'}}>Edge Compute Ready</div>
                <div style={{fontSize:'11.5px', color:'var(--text-dim)', lineHeight:'1.6'}}>
                  GPU hardware acceleration enabled. Neural mesh completion active.
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

/* ---- Sub-components ---- */
const StatCard = ({ label, value, icon, trend }) => (
  <div className="stat-card">
    <div className="stat-card-header">
      <span className="stat-card-label">{label}</span>
      <div className="stat-card-icon">{icon}</div>
    </div>
    <div className="stat-card-value">{value}</div>
    <div className="stat-card-trend">{trend}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  let cls = 'badge ';
  let ico = null;
  if (status === 'Completed' || status === 'Ready') {
    cls += 'badge-success';
    ico = <CheckCircle2 size={11} />;
  } else if (status === 'Processing') {
    cls += 'badge-processing';
    ico = <Activity size={11} />;
  } else {
    cls += 'badge-warning';
    ico = <AlertTriangle size={11} />;
  }
  return (
    <span className={cls} style={{display:'inline-flex', alignItems:'center', gap:'5px', borderRadius:'999px', fontSize:'11px'}}>
      {ico} {status}
    </span>
  );
};

const SysRow = ({ label }) => (
  <div className="system-status-row">
    <span className="system-status-label">{label}</span>
    <div className="system-status-online">
      Online
      <span className="pulse-dot"></span>
    </div>
  </div>
);

export default Dashboard;
