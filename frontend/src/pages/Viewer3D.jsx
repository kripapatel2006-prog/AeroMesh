import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Grid, Edges } from '@react-three/drei';
import {
  MousePointer2, Move, ZoomIn, RefreshCw, Ruler, MessageSquare,
  Layers, Eye, Navigation, ShieldAlert, Download
} from 'lucide-react';

/* ---- Procedural city scene ---- */
const ProceduralCity = ({ wireframe }) => {
  const BUILDINGS = [
    { pos:[-4,0,-4], h:4 }, { pos:[0,0,-5], h:7 }, { pos:[5,0,-4], h:3 },
    { pos:[-5,0,0],  h:5 }, { pos:[0,0,0],  h:8 }, { pos:[4,0,1],  h:4 },
    { pos:[-4,0,5],  h:3 }, { pos:[1,0,4],  h:6 }, { pos:[5,0,5],  h:4 },
    { pos:[-2,0,-2], h:9 }, { pos:[2,0,-2], h:5 }, { pos:[-2,0,2], h:4 },
    { pos:[2,0,2],   h:7 },
  ];
  const COLORS = ['#263444', '#1e2d3e', '#182334'];
  return (
    <group>
      {BUILDINGS.map((b, i) => (
        <Box key={i} args={[1.8, b.h, 1.8]} position={[b.pos[0], b.h / 2, b.pos[2]]}>
          <meshStandardMaterial color={COLORS[i % COLORS.length]} roughness={0.7} metalness={0.2} wireframe={wireframe} />
          {!wireframe && <Edges scale={1.001} threshold={15} color="#22D3EE" opacity={0.15} transparent />}
        </Box>
      ))}
    </group>
  );
};

/* ---- Main Component ---- */
const Viewer3D = () => {
  const [tool, setTool] = useState('orbit');
  const [vis, setVis] = useState({
    mesh: true, pointCloud: false, wireframe: false,
    texture: true, cameraPath: false, grid: true,
  });
  const toggle = k => setVis(v => ({ ...v, [k]: !v[k] }));

  return (
    <div style={{display:'flex', flexDirection:'column', height:'calc(100vh - 112px)', gap:'12px'}} className="animate-in">

      {/* Page sub-header */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0}}>
        <div style={{fontSize:'13.5px', color:'var(--text-muted)'}}>
          Interactive exploration of the reconstructed geospatial model.
        </div>
        <button className="btn btn-secondary" style={{fontSize:'12.5px'}}>
          <Download size={14} /> Export Model
        </button>
      </div>

      {/* Viewer shell */}
      <div className="viewer-shell" style={{flex:1, minHeight:0}}>

        {/* Left toolbar */}
        <div className="viewer-toolbar">
          <ToolBtn icon={<MousePointer2 size={16} />} title="Orbit"    active={tool==='orbit'}    onClick={() => setTool('orbit')} />
          <ToolBtn icon={<Move size={16} />}          title="Pan"      active={tool==='pan'}      onClick={() => setTool('pan')} />
          <ToolBtn icon={<ZoomIn size={16} />}        title="Zoom"     active={tool==='zoom'}     onClick={() => setTool('zoom')} />
          <div className="tool-divider"></div>
          <ToolBtn icon={<Ruler size={16} />}         title="Measure"  active={tool==='measure'}  onClick={() => setTool('measure')} />
          <ToolBtn icon={<MessageSquare size={16} />} title="Annotate" active={tool==='annotate'} onClick={() => setTool('annotate')} />
          <div className="tool-divider"></div>
          <ToolBtn icon={<RefreshCw size={16} />}     title="Reset"    active={false}             onClick={() => {}} />
        </div>

        {/* Canvas */}
        <div className="viewer-canvas-container">
          <Canvas camera={{ position: [12, 10, 12], fov: 45 }}>
            <color attach="background" args={['#040608']} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
            <pointLight position={[-10, 10, -10]} intensity={0.4} color="#22D3EE" />
            {vis.mesh && <ProceduralCity wireframe={vis.wireframe} />}
            {vis.grid && (
              <Grid
                infiniteGrid
                fadeDistance={50}
                sectionColor="#22D3EE"
                cellColor="#1e2d3e"
                sectionSize={10}
                cellSize={2}
              />
            )}
            <OrbitControls
              makeDefault
              enableDamping
              dampingFactor={0.05}
              autoRotate={tool === 'orbit'}
              autoRotateSpeed={0.4}
            />
          </Canvas>

          {/* Overlay coords */}
          <div className="canvas-overlay-coords">
            <span>X:</span> 14.2m &nbsp;
            <span>Y:</span> 8.5m &nbsp;
            <span>Z:</span> −4.1m
          </div>
          <div className="canvas-overlay-hint">
            Left: Rotate · Right: Pan · Scroll: Zoom
          </div>

          {tool === 'measure' && (
            <div style={{
              position:'absolute', top:'14px', left:'14px',
              background:'rgba(34,211,238,0.12)', border:'1px solid var(--accent)',
              borderRadius:'var(--radius-sm)', padding:'7px 14px',
              fontSize:'12px', fontWeight:600, color:'var(--accent)',
              backdropFilter:'blur(6px)',
            }}>
              Measurement Tool Active — Demo Mode
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="viewer-sidebar">

          {/* Model Analysis */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><Layers size={15} /> Model Analysis</span>
            </div>
            <div className="card-body" style={{paddingTop:'8px', paddingBottom:'8px'}}>
              <div className="analysis-row">
                <span className="analysis-label">Model</span>
                <span className="analysis-value accent">AeroMesh Demo</span>
              </div>
              <div className="analysis-row">
                <span className="analysis-label">Coverage</span>
                <span className="analysis-value">96%</span>
              </div>
              <div className="analysis-row">
                <span className="analysis-label">Point Density</span>
                <span className="analysis-value">1.8 M pts/m³</span>
              </div>
              <div className="analysis-row">
                <span className="analysis-label">Mesh Completeness</span>
                <span className="analysis-value">93%</span>
              </div>
              <div className="analysis-row">
                <span className="analysis-label">GPS Confidence</span>
                <span className="analysis-value success">96%</span>
              </div>
              <div className="analysis-row">
                <span className="analysis-label">Estimated Accuracy</span>
                <span className="analysis-value accent">≤ 1 m</span>
              </div>
            </div>
          </div>

          {/* Visualisation toggles */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><Eye size={15} /> Visualisation</span>
            </div>
            <div className="card-body">
              <div className="toggle-grid">
                {Object.entries(vis).map(([k, v]) => (
                  <button key={k} className={`toggle-btn${v ? ' on' : ''}`} onClick={() => toggle(k)}>
                    <span className="toggle-dot"></span>
                    {k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Georeferencing / Telemetry */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><Navigation size={15} /> Telemetry</span>
              <span className="badge badge-warning" style={{fontSize:'10px', padding:'2px 8px'}}>
                <ShieldAlert size={11} /> Demo
              </span>
            </div>
            <div className="card-body">
              <div className="telemetry-mono-box">
                <div className="telemetry-row">
                  <span className="telemetry-key">GPS</span>
                  <span className="telemetry-val">17.3850°N, 78.4867°E</span>
                </div>
                <div className="telemetry-row">
                  <span className="telemetry-key">Altitude</span>
                  <span className="telemetry-val">142.6 m</span>
                </div>
              </div>
              <div className="analysis-row">
                <span className="analysis-label">Coordinate System</span>
                <span className="analysis-value" style={{fontSize:'12px'}}>WGS 84</span>
              </div>
              <div className="analysis-row">
                <span className="analysis-label">GPS Confidence</span>
                <span className="analysis-value success">96%</span>
              </div>
              <div className="analysis-row">
                <span className="analysis-label">IMU Sync</span>
                <span className="analysis-value success">98%</span>
              </div>
              <div className="analysis-row">
                <span className="analysis-label">Barometric Confidence</span>
                <span className="analysis-value success">94%</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const ToolBtn = ({ icon, title, active, onClick }) => (
  <button
    className={`tool-btn${active ? ' active' : ''}`}
    title={title}
    onClick={onClick}
  >
    {icon}
  </button>
);

export default Viewer3D;
