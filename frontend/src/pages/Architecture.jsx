import React from 'react';
import {
  Network, Database, Cpu, Image as Img, Box,
  CloudLightning, ArrowDown, Plane, Map, Video,
  Layers, MonitorPlay, Activity, CheckCircle2, ShieldAlert
} from 'lucide-react';

const Architecture = () => (
  <div className="animate-in">

    {/* Header */}
    <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 36px' }}>
      <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <Network size={24} style={{ color: 'var(--accent)' }} /> AeroMesh Technical Architecture
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: 1.7 }}>
        End-to-end edge computer vision pipeline for single-pass UAV reconstruction.
        Built for rapid situational awareness, infrastructure evaluation, and disaster reconnaissance.
      </p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

      {/* Main Pipeline Flow */}
      <div className="card">
        <div className="card-header">
          <span className="card-title"><Network size={15} /> Data Flow & Computer Vision Pipeline</span>
          <span className="badge badge-success" style={{ fontSize: '10px' }}>OpenCV Engine Active</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, maxWidth: '560px', margin: '0 auto' }}>

            {/* Drone Input */}
            <div className="arch-pipeline-node" style={{ justifyContent: 'center', background: 'var(--bg-base)' }}>
              <div className="arch-node-icon"><Plane size={18} style={{ color: 'var(--text-muted)' }} /></div>
              <div>
                <div className="arch-node-title">Drone / UAV Platform</div>
                <div className="arch-node-sub">Single continuous forward flight pass over survey corridor</div>
              </div>
            </div>

            <div className="arch-arrow"><ArrowDown size={16} /></div>

            {/* Ingestion Data Row */}
            <div className="arch-data-row" style={{ width: '100%' }}>
              <div className="arch-data-chip"><Video size={16} style={{ color: 'var(--accent)' }} /> Video (MP4/MOV)</div>
              <div className="arch-data-chip"><Map size={16} style={{ color: 'var(--accent)' }} /> GPS Track</div>
              <div className="arch-data-chip"><Activity size={16} style={{ color: 'var(--accent)' }} /> IMU Rates</div>
              <div className="arch-data-chip"><CloudLightning size={16} style={{ color: 'var(--accent)' }} /> Baro Altitude</div>
            </div>

            <div className="arch-arrow"><ArrowDown size={16} /></div>

            <PNode
              icon={<Img size={18} />}
              title="1. Intelligent Frame Sampling"
              sub="Adaptive keyframe decimation reducing temporal redundancy while preserving baseline parallax"
            />
            <div className="arch-arrow"><ArrowDown size={16} /></div>

            <PNode
              icon={<Cpu size={18} />}
              title="2. ORB Feature Extraction"
              sub="Multi-scale Oriented FAST corner detection and 256-bit binary BRIEF descriptors"
            />
            <div className="arch-arrow"><ArrowDown size={16} /></div>

            <PNode
              icon={<Network size={18} />}
              title="3. Inter-Frame Feature Tracking"
              sub="Bidirectional Lucas-Kanade optical flow tracking and RANSAC epipolar constraint filtering"
            />
            <div className="arch-arrow"><ArrowDown size={16} /></div>

            <PNode
              icon={<Layers size={18} />}
              title="4. Sparse 3D Triangulation"
              sub="Relative pose estimation and ray intersection computing 3D spatial coordinate cloud"
            />
            <div className="arch-arrow"><ArrowDown size={16} /></div>

            <PNode
              icon={<Map size={18} />}
              title="5. Georeferencing & Sensor Fusion"
              sub="Complementary altitude fusion (Barometer + GPS) and WGS-84 scale calibration"
            />
            <div className="arch-arrow"><ArrowDown size={16} /></div>

            {/* Output Nodes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
              <div className="arch-pipeline-node highlighted" style={{ justifyContent: 'center' }}>
                <div className="arch-node-icon"><MonitorPlay size={18} /></div>
                <div>
                  <div className="arch-node-title" style={{ fontSize: '12px' }}>Interactive 3D Workspace</div>
                  <div className="arch-node-sub" style={{ fontSize: '10.5px' }}>Point Cloud & Raycast Measure</div>
                </div>
              </div>
              <div className="arch-pipeline-node highlighted" style={{ justifyContent: 'center' }}>
                <div className="arch-node-icon"><Box size={18} /></div>
                <div>
                  <div className="arch-node-title" style={{ fontSize: '12px' }}>Geospatial Export</div>
                  <div className="arch-node-sub" style={{ fontSize: '10.5px' }}>JSON 3D Point Datasets</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Right Column: Stack & Defensibility */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Tech Stack */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><Cpu size={15} /> Verified Tech Stack</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['OpenCV 5.0 (Headless)', 'Computer Vision & ORB'],
              ['NumPy', 'Spatial Math & Vectors'],
              ['FastAPI', 'High-Performance Asynchronous API'],
              ['Three.js & R3F', 'Hardware-Accelerated WebGL 3D'],
              ['Recharts', 'Telemetry & Sensor Visualization'],
              ['SQLite / SQLAlchemy', 'Persistent Mission Registry'],
              ['Zustand', 'Reactive Application State'],
            ].map(([n, c]) => (
              <div key={n} className="tech-card">
                <span className="name">{n}</span>
                <span className="cat">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SIH Technical Defensibility */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><CheckCircle2 size={15} color="var(--accent)" /> SIH Defensibility</span>
          </div>
          <div className="card-body" style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Why Single-Pass?</strong>
              <p>Traditional photogrammetry requires cross-hatched grid flights with 80% overlap taking hours. AeroMesh extracts sequential epipolar geometry from a single UAV corridor flight.</p>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Prototype vs Production:</strong>
              <p>This prototype demonstrates genuine multi-frame ORB extraction and optical tracking. Full production scale incorporates OpenMVS dense Poisson meshing and RTK-GNSS centimeter-grade positioning.</p>
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Edge Ready:</strong>
              <p>No mandatory cloud API dependencies. Runs locally on edge ground stations (e.g. laptop or NVIDIA Jetson) for disaster response where internet is severed.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
);

const PNode = ({ icon, title, sub }) => (
  <div className="arch-pipeline-node" style={{ width: '100%' }}>
    <div className="arch-node-icon">{icon}</div>
    <div>
      <div className="arch-node-title">{title}</div>
      {sub && <div className="arch-node-sub">{sub}</div>}
    </div>
  </div>
);

export default Architecture;
