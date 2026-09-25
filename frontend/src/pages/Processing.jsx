import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, CheckCircle2, Circle, Activity, Video,
  Image as Img, Crosshair, Share2, Maximize, Layers,
  Cpu, Compass, MapPin, Terminal, Box, ShieldCheck
} from 'lucide-react';

const PIPELINE = [
  { name: 'Video Ingestion',       desc: 'Loading drone MP4/MOV',                 icon: <Video size={16} /> },
  { name: 'Frame Extraction',      desc: 'Extracting keyframes & EXIF metadata',   icon: <Img size={16} /> },
  { name: 'Stabilisation',         desc: 'Removing sensor jitter & drift',         icon: <Activity size={16} /> },
  { name: 'Feature Matching',      desc: 'SIFT/ORB keypoint detection',            icon: <Crosshair size={16} /> },
  { name: 'SfM Pose Estimation',   desc: 'Sparse structure from motion',           icon: <Share2 size={16} /> },
  { name: 'MVS Reconstruction',    desc: 'Multi-view stereo depth fusion',         icon: <Layers size={16} /> },
  { name: 'Dense Point Cloud',     desc: 'Volumetric point generation',            icon: <Maximize size={16} /> },
  { name: 'Neural Mesh Completion',desc: 'AI hole-filling via Edge TensorRT',      icon: <Cpu size={16} /> },
  { name: 'Texture Mapping',       desc: 'High-resolution UV projection',          icon: <Img size={16} /> },
  { name: 'Georeferencing',        desc: 'GPS + IMU + Barometer fusion',           icon: <Compass size={16} /> },
  { name: 'Model Optimisation',    desc: 'Decimation & export formatting',         icon: <Box size={16} /> },
];

const LOG_LINES = [
  'Loading drone video...',
  'Extracting keyframes at 1/30s intervals...',
  'Detecting ORB features across frames...',
  'Running COLMAP incremental mapping...',
  'Estimating camera poses (sparse SfM)...',
  'Generating dense depth maps...',
  'Fusing depth maps into point cloud...',
  'Running TensorRT neural mesh completion...',
  'Projecting texture maps onto mesh...',
  'Fusing GPS + IMU + Barometer telemetry...',
  'Applying WGS-84 georeferencing transform...',
  'Optimising mesh for export (GLTF/OBJ)...',
  'Pipeline complete. Model ready for viewing.',
];

const Processing = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [logs, setLogs] = useState([]);
  const logRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    const pipe  = setInterval(() => {
      setCurrent(p => {
        if (p >= PIPELINE.length) return p;
        const now = new Date();
        const ts = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
        const msg = LOG_LINES[Math.min(p, LOG_LINES.length - 1)];
        setLogs(l => [...l, { ts, msg }]);
        return p + 1;
      });
    }, 2500);
    return () => { clearInterval(timer); clearInterval(pipe); };
  }, []);

  useEffect(() => {
    logRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const pct    = Math.round((Math.min(current, PIPELINE.length) / PIPELINE.length) * 100);
  const done   = current >= PIPELINE.length;
  const mm     = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss     = String(elapsed % 60).padStart(2, '0');
  const R      = 52;
  const CIRC   = 2 * Math.PI * R;
  const offset = CIRC - (CIRC * pct) / 100;

  return (
    <div className="animate-in">

      {/* Processing header */}
      <div className="processing-header-card">
        <div>
          <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'6px'}}>
            <h2 style={{fontSize:'20px', fontWeight:800, color:'var(--text-primary)', letterSpacing:'-0.02em'}}>
              Mission Processing
            </h2>
            <span className="badge badge-demo">Demo Mode</span>
          </div>
          <div className="processing-meta-tags">
            <span className="processing-meta-tag"><ShieldCheck size={13} /> ID: AM-2026-904X</span>
            <span className="processing-meta-tag"><MapPin size={13} /> Hyderabad, IN</span>
            <span className="processing-meta-tag"><Cpu size={13} /> Mode: Fast Edge</span>
          </div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
          <div style={{textAlign:'right'}}>
            <div className="elapsed-label">Elapsed Time</div>
            <div className="elapsed-timer">{mm}:{ss}</div>
          </div>
          {done && (
            <button className="btn btn-primary" onClick={() => navigate('/viewer')}>
              View 3D Model <Play size={15} style={{marginLeft:'4px'}} />
            </button>
          )}
        </div>
      </div>

      {/* Pipeline + sidebar */}
      <div className="processing-grid">

        {/* Pipeline */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><Activity size={15} /> Reconstruction Pipeline</span>
          </div>
          <div className="card-body">
            {PIPELINE.map((s, i) => {
              const status = i < current ? 'completed' : i === current ? 'processing' : 'queued';
              return (
                <div key={i} className={`pipeline-stage stage-${status}`}>
                  <div className="pipeline-icon">
                    {status === 'completed'
                      ? <CheckCircle2 size={16} />
                      : status === 'processing'
                        ? <Activity size={16} style={{animation:'spin 1.2s linear infinite'}} />
                        : <Circle size={16} />
                    }
                  </div>
                  <div className="pipeline-body">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <span style={{fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-dim)'}}>
                          {String(i+1).padStart(2,'0')}
                        </span>
                        <span className="pipeline-title">{s.name}</span>
                      </div>
                      <span className={`pipeline-status-badge status-${status}`}>
                        {status}
                      </span>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'7px'}}>
                      <span style={{color:'var(--text-dim)', display:'flex', alignItems:'center'}}>{s.icon}</span>
                      <span className="pipeline-desc" style={{margin:0}}>{s.desc}</span>
                    </div>
                    <div className="pipeline-bar-track">
                      <div className="pipeline-bar-fill"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>

          {/* Progress ring */}
          <div className="card">
            <div className="progress-circle-wrapper">
              <div className="progress-circle-container">
                <svg width="128" height="128" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r={R} stroke="var(--border)" strokeWidth="8" fill="none" />
                  <circle
                    cx="64" cy="64" r={R}
                    stroke="var(--accent)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={CIRC}
                    strokeDashoffset={offset}
                    style={{transition:'stroke-dashoffset 1s ease'}}
                  />
                </svg>
                <span className="pct-label">{pct}%</span>
              </div>
              <span className="progress-circle-label">Overall Progress</span>
            </div>
          </div>

          {/* Console */}
          <div className="console-panel" style={{flex:1, minHeight:'340px'}}>
            <div className="console-titlebar">
              <div className="title">
                <Terminal size={13} /> Processing Console
              </div>
              <div className="console-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
            <div className="console-body">
              <div className="log-system">AeroMesh Engine v2.4.1 initialising...</div>
              <div className="log-system" style={{marginBottom:'10px'}}>NVIDIA GPU acceleration detected.</div>
              {logs.map((l, i) => (
                <div key={i} className="log-line">
                  <span className="log-time">{l.ts}</span>{l.msg}
                </div>
              ))}
              {!done && (
                <div className="log-active" style={{marginTop:'6px'}}>_ </div>
              )}
              {done && (
                <div className="log-success" style={{marginTop:'8px'}}>
                  Pipeline complete. 3D model ready.
                </div>
              )}
              <div ref={logRef}></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Processing;
