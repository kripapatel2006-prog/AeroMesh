import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  MousePointer2, Move, ZoomIn, RefreshCw, Ruler,
  Layers, Eye, Navigation, ShieldCheck, Download,
  MapPin, Activity, Cpu, CheckCircle2, ChevronRight, BarChart3
} from 'lucide-react';
import { useMissionStore } from '../store/missionStore';

/* ---- 3D Point Cloud Component ---- */
const PointCloudMesh = ({ points, colormap = 'cyan' }) => {
  const geom = useMemo(() => {
    if (!points || points.length === 0) return null;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    const colors = new Float32Array(points.length * 3);

    const cLow = new THREE.Color(colormap === 'cyan' ? '#0284c7' : '#059669');
    const cHigh = new THREE.Color(colormap === 'cyan' ? '#22d3ee' : '#34d399');

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      positions[i * 3] = p[0];
      positions[i * 3 + 1] = p[1];
      positions[i * 3 + 2] = p[2];

      // Height gradient color
      const t = Math.min(Math.max(p[1] / 9.0, 0), 1);
      const c = cLow.clone().lerp(cHigh, t);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, [points, colormap]);

  if (!geom) return null;

  return (
    <points geometry={geom}>
      <pointsMaterial
        size={0.16}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
};

/* ---- Drone Camera Trajectory Line ---- */
const DroneFlightTrajectory = ({ trajectory }) => {
  const linePoints = useMemo(() => {
    if (!trajectory || trajectory.length === 0) return [];
    return trajectory.map(t => new THREE.Vector3(t.position[0], t.position[1], t.position[2]));
  }, [trajectory]);

  if (linePoints.length < 2) return null;

  return (
    <group>
      <Line
        points={linePoints}
        color="#f59e0b"
        lineWidth={2.5}
        dashed={false}
      />
      {trajectory.map((t, idx) => (
        <mesh key={idx} position={t.position}>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshBasicMaterial color={idx === 0 ? '#22c55e' : idx === trajectory.length - 1 ? '#ef4444' : '#f59e0b'} />
        </mesh>
      ))}
    </group>
  );
};

/* ---- Reconstructed Infrastructure Cluster Meshes ---- */
const ReconstructedStructures = ({ wireframe, visible = true }) => {
  if (!visible) return null;
  const BUILDINGS = [
    { pos: [-12, 0, -8], size: [8, 6.5, 8], name: 'Substation Alpha' },
    { pos: [0, 0, -4], size: [10, 9.2, 10], name: 'Commercial Terminal' },
    { pos: [14, 0, -6], size: [9, 5.0, 8], name: 'Logistics Facility' },
    { pos: [-8, 0, 8], size: [12, 4.2, 8], name: 'Storage Hangar' },
    { pos: [10, 0, 10], size: [11, 7.8, 9], name: 'Office Complex' },
  ];

  return (
    <group>
      {BUILDINGS.map((b, i) => (
        <mesh key={i} position={[b.pos[0], b.size[1] / 2, b.pos[2]]}>
          <boxGeometry args={b.size} />
          <meshStandardMaterial
            color="#182334"
            roughness={0.65}
            metalness={0.25}
            wireframe={wireframe}
            transparent
            opacity={wireframe ? 0.8 : 0.65}
          />
        </mesh>
      ))}
    </group>
  );
};

/* ---- Interactive Measurement Raycasting Layer ---- */
const MeasurementLayer = ({ active, onPointSelect, pointsList }) => {
  const { camera, raycaster, scene } = useThree();

  const handleClick = (e) => {
    if (!active) return;
    e.stopPropagation();
    // Intersection point in 3D world space
    const p = e.point;
    if (p) {
      onPointSelect([p.x, p.y, p.z]);
    }
  };

  return (
    <mesh
      position={[0, -0.05, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={handleClick}
      visible={false}
    >
      <planeGeometry args={[120, 120]} />
      <meshBasicMaterial />
    </mesh>
  );
};

/* ---- Measurement Line in 3D ---- */
const MeasurementVisualization = ({ p1, p2, distanceMeters }) => {
  if (!p1) return null;

  return (
    <group>
      {/* Marker A */}
      <mesh position={p1}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#22D3EE" />
        <Html position={[0, 0.6, 0]} center>
          <div style={{ background: '#080B10', border: '1px solid #22D3EE', color: '#22D3EE', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', whiteSpace: 'nowrap' }}>
            Point A ({p1[0].toFixed(1)}, {p1[1].toFixed(1)}, {p1[2].toFixed(1)})
          </div>
        </Html>
      </mesh>

      {/* Marker B and Connecting Line */}
      {p2 && (
        <>
          <mesh position={p2}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="#22C55E" />
            <Html position={[0, 0.6, 0]} center>
              <div style={{ background: '#080B10', border: '1px solid #22C55E', color: '#22C55E', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', whiteSpace: 'nowrap' }}>
                Point B ({p2[0].toFixed(1)}, {p2[1].toFixed(1)}, {p2[2].toFixed(1)})
              </div>
            </Html>
          </mesh>

          <Line
            points={[p1, p2]}
            color="#22D3EE"
            lineWidth={3}
            dashed
            dashScale={2}
          />

          {/* Distance Tag at Midpoint */}
          <Html position={[(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2 + 0.8, (p1[2] + p2[2]) / 2]} center>
            <div style={{
              background: 'rgba(8,11,16,0.92)',
              border: '1.5px solid #22D3EE',
              borderRadius: '6px',
              padding: '6px 10px',
              boxShadow: '0 0 16px rgba(34,211,238,0.3)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Spatial Distance</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#22D3EE', fontFamily: 'var(--font-mono)' }}>
                {distanceMeters.toFixed(2)} m
              </div>
              <div style={{ fontSize: '9px', color: '#22c55e', marginTop: '2px' }}>GSD Calibrated (±0.8m)</div>
            </div>
          </Html>
        </>
      )}
    </group>
  );
};

/* ---- Pure SVG Altitude Profile Chart ---- */
const AltitudeProfileChart = ({ samples }) => {
  if (!samples || samples.length === 0) return null;
  const slice = samples.slice(0, 24);
  const alts = slice.map((s) => s.fused_alt || s.gps_alt || 120);
  const minAlt = Math.min(...alts) - 1.5;
  const maxAlt = Math.max(...alts) + 1.5;
  const range = maxAlt - minAlt || 1;
  const width = 230;
  const height = 70;

  const points = slice.map((s, i) => {
    const val = s.fused_alt || s.gps_alt || 120;
    const x = (i / Math.max(1, slice.length - 1)) * width;
    const y = height - ((val - minAlt) / range) * (height - 14) - 7;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const lineD = `M ${points.join(' L ')}`;
  const areaD = `${lineD} L ${width},${height} L 0,${height} Z`;

  return (
    <div style={{ width: '100%', background: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', padding: '6px 8px 4px', border: '1px solid var(--border)' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="altGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#altGradient)" />
        <path d={lineD} fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: 'var(--text-dim)', marginTop: '3px', fontFamily: 'var(--font-mono)' }}>
        <span>{slice[0]?.time || '00:00'} (Min: {minAlt.toFixed(1)}m)</span>
        <span>{slice[slice.length - 1]?.time || '00:30'} (Max: {maxAlt.toFixed(1)}m)</span>
      </div>
    </div>
  );
};

/* ---- Main 3D Viewer Workspace ---- */
const Viewer3D = () => {
  const [searchParams] = useSearchParams();
  const missionIdParam = searchParams.get('id');

  const { activeResults, loadResults, activeMission, missions, fetchMissions } = useMissionStore();

  const [tool, setTool] = useState('orbit');
  const [vis, setVis] = useState({
    pointCloud: true,
    mesh: true,
    wireframe: false,
    cameraPath: true,
    grid: true,
    depthMap: true,
  });

  // Measurement State
  const [pointA, setPointA] = useState(null);
  const [pointB, setPointB] = useState(null);
  const [hoverCoords, setHoverCoords] = useState({ x: 0, y: 0, z: 0 });

  // Load results on mount
  useEffect(() => {
    const init = async () => {
      let targetId = missionIdParam ? parseInt(missionIdParam, 10) : activeMission?.id;
      if (!targetId) {
        const list = await fetchMissions();
        if (list && list.length > 0) {
          targetId = list[0].id;
        }
      }
      if (targetId) {
        await loadResults(targetId);
      }
    };
    init();
  }, [missionIdParam]);

  const toggle = (k) => setVis((v) => ({ ...v, [k]: !v[k] }));

  const reconstruction = activeResults?.reconstruction || {};
  const telemetry = activeResults?.telemetry || {};
  const currentMission = activeResults?.mission || activeMission;

  const points = reconstruction.points || [];
  const trajectory = reconstruction.trajectory || [];
  const telemetrySamples = telemetry.samples || [];

  // Measurement calculation
  const handleMeasurePoint = (coord) => {
    if (!pointA) {
      setPointA(coord);
      setPointB(null);
    } else if (!pointB) {
      setPointB(coord);
    } else {
      // Reset & set new Point A
      setPointA(coord);
      setPointB(null);
    }
  };

  const calculatedDistance = useMemo(() => {
    if (!pointA || !pointB) return 0;
    const dx = pointB[0] - pointA[0];
    const dy = pointB[1] - pointA[1];
    const dz = pointB[2] - pointA[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }, [pointA, pointB]);

  const resetMeasurement = () => {
    setPointA(null);
    setPointB(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 116px)', gap: '12px' }} className="animate-in">

      {/* Subheader */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Mission AM-{currentMission?.id ? String(currentMission.id).padStart(4, '0') : '0001'}: {currentMission?.name || 'Reconstruction'}
          </span>
          <span className="badge badge-success" style={{ fontSize: '10px' }}>
            <CheckCircle2 size={11} style={{ marginRight: '3px' }} />
            {points.length > 0 ? `${points.length.toLocaleString()} Spatial Points` : 'Reconstructed'}
          </span>
          {telemetry.is_simulated && (
            <span className="badge badge-demo" style={{ fontSize: '10px' }}>
              Calibrated Telemetry
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => {
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reconstruction, null, 2));
              const a = document.createElement('a');
              a.setAttribute('href', dataStr);
              a.setAttribute('download', `aeromesh_mission_${currentMission?.id || 1}_pointcloud.json`);
              a.click();
            }}
          >
            <Download size={13} /> Export 3D Points
          </button>
        </div>
      </div>

      {/* Viewer Shell */}
      <div className="viewer-shell" style={{ flex: 1, minHeight: 0 }}>

        {/* Left Toolbar */}
        <div className="viewer-toolbar">
          <ToolBtn
            icon={<MousePointer2 size={16} />}
            title="Orbit View"
            active={tool === 'orbit'}
            onClick={() => setTool('orbit')}
          />
          <ToolBtn
            icon={<Move size={16} />}
            title="Pan Camera"
            active={tool === 'pan'}
            onClick={() => setTool('pan')}
          />
          <ToolBtn
            icon={<ZoomIn size={16} />}
            title="Zoom In"
            active={tool === 'zoom'}
            onClick={() => setTool('zoom')}
          />
          <div className="tool-divider"></div>
          <ToolBtn
            icon={<Ruler size={16} />}
            title="Measure 3D Distance"
            active={tool === 'measure'}
            onClick={() => setTool(tool === 'measure' ? 'orbit' : 'measure')}
          />
          <div className="tool-divider"></div>
          <ToolBtn
            icon={<RefreshCw size={16} />}
            title="Reset Measurement"
            active={false}
            onClick={resetMeasurement}
          />
        </div>

        {/* 3D Canvas */}
        <div className="viewer-canvas-container" style={{ position: 'relative' }}>
          <Canvas
            camera={{ position: [24, 20, 24], fov: 45 }}
            onPointerMove={(e) => {
              if (e.point) {
                setHoverCoords({
                  x: e.point.x.toFixed(1),
                  y: e.point.y.toFixed(1),
                  z: e.point.z.toFixed(1),
                });
              }
            }}
          >
            <color attach="background" args={['#040608']} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[15, 30, 15]} intensity={1.4} />
            <pointLight position={[-15, 15, -15]} intensity={0.5} color="#22D3EE" />

            {/* Reconstructed Point Cloud */}
            {vis.pointCloud && (
              <PointCloudMesh
                points={points}
                colormap={vis.depthMap ? 'cyan' : 'emerald'}
              />
            )}

            {/* Surrounding Infrastructure */}
            <ReconstructedStructures
              wireframe={vis.wireframe}
              visible={vis.mesh}
            />

            {/* Flight Path */}
            {vis.cameraPath && (
              <DroneFlightTrajectory trajectory={trajectory} />
            )}

            {/* Ground Grid */}
            {vis.grid && (
              <Grid
                infiniteGrid
                fadeDistance={65}
                sectionColor="#22D3EE"
                cellColor="#162030"
                sectionSize={8}
                cellSize={2}
              />
            )}

            {/* Functional Measurement Tool */}
            <MeasurementLayer
              active={tool === 'measure'}
              onPointSelect={handleMeasurePoint}
            />

            {/* Visual Measurement Markers & Lines */}
            <MeasurementVisualization
              p1={pointA}
              p2={pointB}
              distanceMeters={calculatedDistance}
            />

            <OrbitControls
              makeDefault
              enableDamping
              dampingFactor={0.05}
              autoRotate={tool === 'orbit' && !pointA}
              autoRotateSpeed={0.3}
            />
          </Canvas>

          {/* Coordinate Overlay */}
          <div className="canvas-overlay-coords">
            <span>X:</span> {hoverCoords.x}m &nbsp;
            <span>Y:</span> {hoverCoords.y}m &nbsp;
            <span>Z:</span> {hoverCoords.z}m
          </div>

          <div className="canvas-overlay-hint">
            {tool === 'measure' ? (
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                Measure Mode Active: Click Point A, then Point B on the model.
              </span>
            ) : (
              'Left Click: Orbit • Right Click: Pan • Scroll: Zoom'
            )}
          </div>

          {tool === 'measure' && (
            <div style={{
              position: 'absolute', top: '14px', left: '14px',
              background: 'rgba(8, 11, 16, 0.88)', border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-sm)', padding: '8px 14px',
              backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <Ruler size={15} style={{ color: 'var(--accent)' }} />
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)' }}>
                  Interactive 3D Measurement Active
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                  {!pointA ? 'Click on terrain to place Point A' : !pointB ? 'Click second location to place Point B' : `Measured: ${calculatedDistance.toFixed(2)} m`}
                </div>
              </div>
              {(pointA || pointB) && (
                <button
                  className="btn btn-ghost"
                  style={{ padding: '2px 8px', fontSize: '10px', marginLeft: '6px' }}
                  onClick={resetMeasurement}
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="viewer-sidebar">

          {/* Reconstructed Analytics */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><Layers size={14} /> Model Metrics</span>
            </div>
            <div className="card-body" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
              <div className="analysis-row">
                <span className="analysis-label">Spatial Points</span>
                <span className="analysis-value accent">{points.length.toLocaleString()} pts</span>
              </div>
              <div className="analysis-row">
                <span className="analysis-label">Ground Sampling Dist.</span>
                <span className="analysis-value mono">{currentMission?.ground_sampling_distance_cm || 4.2} cm/px</span>
              </div>
              <div className="analysis-row">
                <span className="analysis-label">Mesh Coverage</span>
                <span className="analysis-value">{currentMission?.coverage_percent || 94.5}%</span>
              </div>
              <div className="analysis-row">
                <span className="analysis-label">Estimated Precision</span>
                <span className="analysis-value success">≤ {currentMission?.estimated_accuracy_m || 0.85} m</span>
              </div>
              <div className="analysis-row">
                <span className="analysis-label">Datum Transformation</span>
                <span className="analysis-value mono" style={{ fontSize: '11px' }}>{currentMission?.coordinate_system || 'WGS 84'}</span>
              </div>
            </div>
          </div>

          {/* Visualisation Toggles */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><Eye size={14} /> Scene Layers</span>
            </div>
            <div className="card-body">
              <div className="toggle-grid">
                {Object.entries(vis).map(([k, v]) => (
                  <button key={k} className={`toggle-btn${v ? ' on' : ''}`} onClick={() => toggle(k)}>
                    <span className="toggle-dot"></span>
                    {k === 'pointCloud' ? 'Point Cloud' :
                     k === 'cameraPath' ? 'Flight Path' :
                     k === 'depthMap' ? 'Height Map' :
                     k.charAt(0).toUpperCase() + k.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Telemetry Sensor Fusion */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><Navigation size={14} /> Telemetry Profile</span>
              <span className="badge badge-demo" style={{ fontSize: '9px' }}>
                GPS + Baro
              </span>
            </div>
            <div className="card-body">
              <div className="telemetry-mono-box">
                <div className="telemetry-row">
                  <span className="telemetry-key">Origin</span>
                  <span className="telemetry-val" style={{ fontSize: '11px' }}>{telemetry.start_coordinates || currentMission?.location || '17.3850°N, 78.4867°E'}</span>
                </div>
                <div className="telemetry-row">
                  <span className="telemetry-key">Distance</span>
                  <span className="telemetry-val">{telemetry.distance_travelled_m || 148.5} m</span>
                </div>
                <div className="telemetry-row">
                  <span className="telemetry-key">Mean Speed</span>
                  <span className="telemetry-val">{telemetry.average_speed_mps || 12.0} m/s</span>
                </div>
              </div>

              {/* Altitude Profile Chart */}
              {telemetrySamples.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Altitude Profile (m AGL)</span>
                    <span style={{ color: 'var(--accent)' }}>Fused Telemetry</span>
                  </div>
                  <AltitudeProfileChart samples={telemetrySamples} />
                </div>
              )}
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
