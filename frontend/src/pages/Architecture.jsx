import React from 'react';
import {
  Network, Database, Cpu, Image as Img, Box,
  CloudLightning, ArrowDown, Plane, Map, Video,
  Layers, MonitorPlay, Activity
} from 'lucide-react';

const Architecture = () => (
  <div className="animate-in">

    {/* Header */}
    <div style={{textAlign:'center', maxWidth:'680px', margin:'0 auto 40px'}}>
      <h2 style={{fontSize:'26px', fontWeight:900, color:'var(--text-primary)', letterSpacing:'-0.02em', marginBottom:'10px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
        <Network size={22} style={{color:'var(--accent)'}} /> System Architecture
      </h2>
      <p style={{color:'var(--text-muted)', fontSize:'14px', lineHeight:1.7}}>
        End-to-end edge-optimised pipeline for single-pass UAV reconstruction.
        Designed for rapid deployment and high-accuracy geospatial intelligence.
      </p>
    </div>

    <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'24px'}}>

      {/* Main Pipeline */}
      <div className="card">
        <div className="card-header">
          <span className="card-title"><Network size={15} /> Data Flow & Processing Pipeline</span>
        </div>
        <div className="card-body">
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:0, maxWidth:'560px', margin:'0 auto'}}>

            {/* Drone */}
            <div className="arch-pipeline-node" style={{justifyContent:'center', background:'var(--bg-base)'}}>
              <div className="arch-node-icon"><Plane size={18} style={{color:'var(--text-muted)'}} /></div>
              <div>
                <div className="arch-node-title">Drone / UAV</div>
                <div className="arch-node-sub">Multirotor platform with onboard sensors</div>
              </div>
            </div>

            <div className="arch-arrow"><ArrowDown size={16} /></div>

            {/* Data inputs */}
            <div className="arch-data-row" style={{width:'100%'}}>
              <div className="arch-data-chip"><Video size={16} style={{color:'var(--accent)'}} /> Video</div>
              <div className="arch-data-chip"><Map size={16} style={{color:'var(--accent)'}} /> GPS</div>
              <div className="arch-data-chip"><Activity size={16} style={{color:'var(--accent)'}} /> IMU</div>
              <div className="arch-data-chip"><CloudLightning size={16} style={{color:'var(--accent)'}} /> Baro</div>
            </div>

            <div className="arch-arrow"><ArrowDown size={16} /></div>

            <PNode icon={<Img size={18} />} title="Frame Extraction" sub="Keyframe detection + EXIF parsing" />
            <div className="arch-arrow"><ArrowDown size={16} /></div>
            <PNode icon={<Network size={18} />} title="SfM Pose Estimation" sub="Sparse structure from motion (COLMAP)" />
            <div className="arch-arrow"><ArrowDown size={16} /></div>
            <PNode icon={<Layers size={18} />} title="MVS Reconstruction" sub="Multi-view stereo depth fusion" />
            <div className="arch-arrow"><ArrowDown size={16} /></div>
            <PNode icon={<Database size={18} />} title="Dense Point Cloud" sub="Open3D volumetric reconstruction" />
            <div className="arch-arrow"><ArrowDown size={16} /></div>

            {/* AI Node — highlighted */}
            <div className="arch-pipeline-node highlighted" style={{width:'100%'}}>
              <div className="arch-node-icon"><Cpu size={18} /></div>
              <div>
                <div className="arch-node-title">AI Mesh Completion</div>
                <div className="arch-node-sub">PyTorch neural rendering + CUDA TensorRT edge inference</div>
              </div>
            </div>

            <div className="arch-arrow"><ArrowDown size={16} /></div>
            <PNode icon={<Img size={18} />} title="Texture Mapping" sub="High-resolution UV projection" />
            <div className="arch-arrow"><ArrowDown size={16} /></div>
            <PNode icon={<Map size={18} />} title="Georeferencing" sub="WGS-84 coordinate assignment" />
            <div className="arch-arrow"><ArrowDown size={16} /></div>

            {/* Output nodes */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', width:'100%'}}>
              <div className="arch-pipeline-node" style={{justifyContent:'center'}}>
                <div className="arch-node-icon"><MonitorPlay size={18} /></div>
                <div><div className="arch-node-title" style={{fontSize:'12px'}}>3D Viewer</div></div>
              </div>
              <div className="arch-pipeline-node" style={{justifyContent:'center'}}>
                <div className="arch-node-icon"><Box size={18} /></div>
                <div><div className="arch-node-title" style={{fontSize:'12px'}}>Export (OBJ/GLTF)</div></div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>

        {/* Tech Stack */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><Cpu size={15} /> Technology Stack</span>
          </div>
          <div className="card-body" style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            {[
              ['OpenCV',   'Computer Vision'],
              ['COLMAP',   'SfM Engine'],
              ['Open3D',   'Point Cloud'],
              ['PyTorch',  'Neural Completion'],
              ['CUDA',     'GPU Acceleration'],
              ['FastAPI',  'Backend API'],
              ['Three.js', 'WebGL Rendering'],
            ].map(([n, c]) => (
              <div key={n} className="tech-card">
                <span className="name">{n}</span>
                <span className="cat">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hardware */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Hardware Requirements</span>
          </div>
          <div className="card-body">
            {[
              ['GPU',     'NVIDIA RTX 3060+'],
              ['RAM',     '32 GB DDR4'],
              ['Storage', '1 TB NVMe SSD'],
              ['OS',      'Ubuntu 22.04 / Win 11'],
            ].map(([k, v]) => (
              <div key={k} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(32,42,53,0.6)'}}>
                <span style={{fontSize:'12.5px', color:'var(--text-muted)'}}>{k}</span>
                <span style={{fontSize:'12.5px', fontWeight:600, color:'var(--text-primary)'}}>{v}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  </div>
);

const PNode = ({ icon, title, sub }) => (
  <div className="arch-pipeline-node" style={{width:'100%'}}>
    <div className="arch-node-icon">{icon}</div>
    <div>
      <div className="arch-node-title">{title}</div>
      {sub && <div className="arch-node-sub">{sub}</div>}
    </div>
  </div>
);

export default Architecture;
