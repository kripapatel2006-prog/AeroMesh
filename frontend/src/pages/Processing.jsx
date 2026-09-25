import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Play, CheckCircle2, Circle, Activity, Video,
  Image as Img, Crosshair, Share2, Maximize, Layers,
  Cpu, Compass, MapPin, Terminal, Box, ShieldCheck, AlertTriangle, Eye, RotateCw
} from 'lucide-react';
import { useMissionStore } from '../store/missionStore';

const PIPELINE_DISPLAY_STAGES = [
  { name: 'Video Ingestion & Stream Analysis', desc: 'Validating container format, framerate, and codec', icon: <Video size={16} /> },
  { name: 'Keyframe Extraction & Normalization', desc: 'Decimating temporal redundancy and stabilizing exposure', icon: <Img size={16} /> },
  { name: 'ORB Feature Detection', desc: 'Extracting oriented FAST keypoints with multi-scale pyramid', icon: <Crosshair size={16} /> },
  { name: 'Feature Tracking & Optical Flow', desc: 'Matching descriptor pairs and rejecting outlier vectors', icon: <Share2 size={16} /> },
  { name: 'Sparse Spatial Triangulation', desc: 'Estimating 3D point cloud via multi-view epipolar geometry', icon: <Layers size={16} /> },
  { name: 'Sensor & Telemetry Fusion', desc: 'Synchronizing GPS, IMU, and barometric altitude profile', icon: <Compass size={16} /> },
  { name: 'Georeferenced Model Generation', desc: 'Applying WGS-84 datum coordinate transformation', icon: <Box size={16} /> },
];

const Processing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const missionIdParam = searchParams.get('id');

  const {
    activeMission,
    activeStatus,
    fetchStatus,
    selectMission,
    missions,
    fetchMissions,
    startProcessing,
  } = useMissionStore();

  const [currentMissionId, setCurrentMissionId] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const logRef = useRef(null);

  // Initialize target mission
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
        setCurrentMissionId(targetId);
        await selectMission(targetId);
        await fetchStatus(targetId);
      }
    };
    init();
  }, [missionIdParam]);

  // Elapsed time counter
  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Polling loop for mission status
  useEffect(() => {
    if (!currentMissionId) return;

    let isPolling = true;
    const poll = async () => {
      if (!isPolling) return;
      const status = await fetchStatus(currentMissionId);
      if (status && (status.status === 'COMPLETED' || status.status === 'FAILED')) {
        // Finished
        return;
      }
    };

    const interval = setInterval(poll, 1200);
    return () => {
      isPolling = false;
      clearInterval(interval);
    };
  }, [currentMissionId, fetchStatus]);

  // Auto-scroll logs
  useEffect(() => {
    logRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeStatus?.logs]);

  const status = activeStatus?.status || activeMission?.status || 'PROCESSING';
  const progressPct = Math.round(activeStatus?.progress || activeMission?.progress || 0);
  const currentStageIndex = activeStatus?.stage_index !== undefined ? activeStatus.stage_index : 0;
  const isDone = status === 'COMPLETED';
  const isFailed = status === 'FAILED';

  const metrics = activeStatus?.metrics || {
    frames_processed: activeMission?.frames_processed || 0,
    frames_total: activeMission?.frames_total || 0,
    features_detected: activeMission?.features_detected || 0,
    features_tracked: activeMission?.features_tracked || 0,
    processing_time_sec: activeMission?.processing_time_sec || 0,
    estimated_accuracy_m: activeMission?.estimated_accuracy_m || 0.85,
    coverage_percent: activeMission?.coverage_percent || 0,
  };

  const previewImageUrl = activeStatus?.preview_image_url || activeMission?.preview_image_url;

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  const R = 52;
  const CIRC = 2 * Math.PI * R;
  const offset = CIRC - (CIRC * progressPct) / 100;

  const handleRetry = async () => {
    if (!currentMissionId) return;
    setIsRetrying(true);
    try {
      await startProcessing(currentMissionId);
      await fetchStatus(currentMissionId);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="animate-in">

      {/* Processing Header */}
      <div className="processing-header-card">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Mission Reconstruction Pipeline
            </h2>
            <span className={`badge ${isDone ? 'badge-success' : isFailed ? 'badge-warning' : 'badge-processing'}`}>
              {status}
            </span>
            {activeMission?.is_demo && (
              <span className="badge badge-demo">Demo Mode</span>
            )}
          </div>
          <div className="processing-meta-tags">
            <span className="processing-meta-tag">
              <ShieldCheck size={13} /> Mission ID: AM-{currentMissionId ? String(currentMissionId).padStart(4, '0') : '----'}
            </span>
            <span className="processing-meta-tag">
              <MapPin size={13} /> {activeMission?.location || 'Hyderabad, IN'}
            </span>
            <span className="processing-meta-tag">
              <Cpu size={13} /> Engine: OpenCV ORB + Lucas-Kanade
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div className="elapsed-label">Elapsed Time</div>
            <div className="elapsed-timer">{mm}:{ss}</div>
          </div>
          {isDone && (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/viewer?id=${currentMissionId}`)}
            >
              Inspect 3D Model <Eye size={15} style={{ marginLeft: '4px' }} />
            </button>
          )}
          {isFailed && (
            <button
              className="btn btn-secondary"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              <RotateCw size={14} className={isRetrying ? 'animate-spin' : ''} /> Retry Pipeline
            </button>
          )}
        </div>
      </div>

      {isFailed && activeStatus?.error_message && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid var(--danger)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#fca5a5'
        }}>
          <AlertTriangle size={18} color="var(--danger)" />
          <div>
            <strong>Processing Execution Failed:</strong> {activeStatus.error_message}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="processing-grid">

        {/* Left: Pipeline Stages */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Activity size={15} /> Real-Time CV Pipeline Stages
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Stage {Math.min(currentStageIndex + 1, PIPELINE_DISPLAY_STAGES.length)} of {PIPELINE_DISPLAY_STAGES.length}
            </span>
          </div>
          <div className="card-body">
            {PIPELINE_DISPLAY_STAGES.map((s, i) => {
              let stageStatus = 'queued';
              if (isDone || i < currentStageIndex) {
                stageStatus = 'completed';
              } else if (i === currentStageIndex && !isFailed) {
                stageStatus = 'processing';
              } else if (i === currentStageIndex && isFailed) {
                stageStatus = 'failed';
              }

              return (
                <div key={i} className={`pipeline-stage stage-${stageStatus}`}>
                  <div className="pipeline-icon">
                    {stageStatus === 'completed' ? (
                      <CheckCircle2 size={16} />
                    ) : stageStatus === 'processing' ? (
                      <Activity size={16} className="animate-spin" />
                    ) : stageStatus === 'failed' ? (
                      <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
                    ) : (
                      <Circle size={16} />
                    )}
                  </div>
                  <div className="pipeline-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="pipeline-title">{s.name}</span>
                      </div>
                      <span className={`pipeline-status-badge status-${stageStatus}`}>
                        {stageStatus}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px' }}>
                      <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }}>{s.icon}</span>
                      <span className="pipeline-desc" style={{ margin: 0 }}>{s.desc}</span>
                    </div>
                    <div className="pipeline-bar-track">
                      <div
                        className="pipeline-bar-fill"
                        style={{
                          width: stageStatus === 'completed' ? '100%' : stageStatus === 'processing' ? '65%' : '0%',
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Progress Ring & Live Metrics */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><Cpu size={14} /> Pipeline Progress & Live Metrics</span>
            </div>
            <div className="card-body" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginBottom: '16px' }}>
                <div className="progress-circle-container">
                  <svg width="110" height="110" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r={R} stroke="var(--border)" strokeWidth="8" fill="none" />
                    <circle
                      cx="64"
                      cy="64"
                      r={R}
                      stroke="var(--accent)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={CIRC}
                      strokeDashoffset={offset}
                      style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                    />
                  </svg>
                  <span className="pct-label" style={{ fontSize: '24px' }}>{progressPct}%</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Keyframes Processed</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {metrics.frames_processed} <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>/ {metrics.frames_total || '—'}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Features Tracked</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent)' }}>
                      {metrics.features_tracked ? metrics.features_tracked.toLocaleString() : '—'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <div className="analysis-row" style={{ padding: '4px 0' }}>
                  <span className="analysis-label">Features Detected</span>
                  <span className="analysis-value mono">{metrics.features_detected ? metrics.features_detected.toLocaleString() : '—'}</span>
                </div>
                <div className="analysis-row" style={{ padding: '4px 0' }}>
                  <span className="analysis-label">Est. Accuracy</span>
                  <span className="analysis-value accent">≤ {metrics.estimated_accuracy_m} m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Computer Vision Keypoint Overlay Preview */}
          {previewImageUrl && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">
                  <Crosshair size={14} /> Computer Vision Feature Keypoints
                </span>
                <span className="badge badge-demo" style={{ fontSize: '10px' }}>OpenCV Output</span>
              </div>
              <div style={{ padding: '12px', background: '#000' }}>
                <img
                  src={previewImageUrl}
                  alt="Extracted Keypoints Preview"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    display: 'block'
                  }}
                />
                <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Oriented FAST keypoints with scale octaves</span>
                  <span style={{ color: 'var(--accent)' }}>Live Ingestion Frame</span>
                </div>
              </div>
            </div>
          )}

          {/* Processing Console */}
          <div className="console-panel" style={{ flex: 1, minHeight: '260px' }}>
            <div className="console-titlebar">
              <div className="title">
                <Terminal size={13} /> Processing Telemetry Console
              </div>
              <div className="console-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
            <div className="console-body">
              <div className="log-system">AeroMesh Photogrammetry Subsystem initialized.</div>
              <div className="log-system" style={{ marginBottom: '8px' }}>Connected to FastAPI OpenCV Service.</div>

              {activeStatus?.logs && activeStatus.logs.length > 0 ? (
                activeStatus.logs.map((l, i) => (
                  <div key={i} className="log-line">
                    <span className="log-time">{l.ts}</span>
                    <span className={l.level === 'SUCCESS' ? 'log-success' : l.level === 'WARN' ? 'text-warning' : l.level === 'ERROR' ? 'text-danger' : ''}>
                      {l.msg}
                    </span>
                  </div>
                ))
              ) : (
                <div className="log-line">
                  <span className="log-time">--:--:--</span> Waiting for worker thread initialization...
                </div>
              )}

              {!isDone && !isFailed && (
                <div className="log-active" style={{ marginTop: '6px' }}>_ </div>
              )}
              {isDone && (
                <div className="log-success" style={{ marginTop: '8px', fontWeight: 600 }}>
                  ✓ Pipeline completed successfully. 3D spatial model rendered and calibrated.
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
