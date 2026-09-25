import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Map, Video, Activity, Compass, FileText, Crosshair,
  Upload, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, RefreshCw, Sparkles
} from 'lucide-react';
import { useMissionStore } from '../store/missionStore';

const NewMission = () => {
  const navigate = useNavigate();
  const { createMission, uploadVideo, startProcessing, uploadProgress, launchDemoMission } = useMissionStore();

  const [step, setStep] = useState(1);
  const [missionName, setMissionName] = useState('Hyderabad Infrastructure Survey');
  const [location, setLocation] = useState('17.3850° N, 78.4867° E');
  const [desc, setDesc] = useState('Single-pass UAV corridor survey for structural inspection and 3D terrain modeling.');
  const [coordSystem, setCoordSystem] = useState('WGS 84 (EPSG:4326)');
  
  // File state
  const [selectedFile, setSelectedFile] = useState(null);
  const [useSampleVideo, setUseSampleVideo] = useState(false);
  const [telemetryMode, setTelemetryMode] = useState('synthesize');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|avi|webm)$/i)) {
        setFormError('Please select a valid video file (.mp4, .mov, .avi, .webm)');
        return;
      }
      setSelectedFile(file);
      setUseSampleVideo(false);
      setFormError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setUseSampleVideo(false);
      setFormError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (useSampleVideo && !selectedFile) {
        // Fast-path demo mission
        const demo = await launchDemoMission();
        navigate(`/processing?id=${demo.id}`);
        return;
      }

      // Step 1: Create Mission record
      const mission = await createMission({
        name: missionName.trim() || 'Untitled Survey Mission',
        location: location.trim() || '17.3850° N, 78.4867° E',
        description: desc.trim(),
        coordinate_system: coordSystem
      });

      // Step 2: Upload file if provided
      if (selectedFile) {
        await uploadVideo(mission.id, selectedFile);
      }

      // Step 3: Trigger real pipeline
      await startProcessing(mission.id);

      // Navigate to processing view
      navigate(`/processing?id=${mission.id}`);
    } catch (err) {
      console.error('Mission launch failed:', err);
      setFormError(err.message || 'Failed to initialize survey mission');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in">

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h2>Create Survey Mission</h2>
          <p>Configure parameters, ingest aerial video, and launch single-pass CV reconstruction.</p>
        </div>
        <button
          className="btn btn-accent-ghost"
          onClick={async () => {
            const demo = await launchDemoMission();
            navigate(`/processing?id=${demo.id}`);
          }}
        >
          <Sparkles size={15} /> Launch Instant Demo Mission
        </button>
      </div>

      {/* Step Indicator */}
      <div className="step-row">
        {[
          { num: '01', label: 'Parameters' },
          { num: '02', label: 'Aerial Video' },
          { num: '03', label: 'Telemetry' },
          { num: '04', label: 'Review & Run' }
        ].map((s, idx) => {
          const stepNum = idx + 1;
          const isActive = step >= stepNum;
          return (
            <React.Fragment key={s.num}>
              <div
                className={`step-item ${isActive ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setStep(stepNum)}
              >
                <div className="step-dot">{s.num}</div>
                <div className="step-label">{s.label}</div>
              </div>
              {idx < 3 && <div className="step-divider"></div>}
            </React.Fragment>
          );
        })}
      </div>

      {formError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid var(--danger)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          marginBottom: '20px',
          color: '#fca5a5',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={16} color="var(--danger)" />
          <span>{formError}</span>
        </div>
      )}

      {/* Wizard Steps */}
      <div className="two-col-grid">

        {/* Left Column: Current Step Content */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              {step === 1 && <><FileText size={15} /> Mission Metadata</>}
              {step === 2 && <><Video size={15} /> Aerial Video Ingestion</>}
              {step === 3 && <><Compass size={15} /> Telemetry & Sensors</>}
              {step === 4 && <><CheckCircle2 size={15} /> Review & Execute Pipeline</>}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Step {step} of 4</span>
          </div>

          <div className="card-body">

            {/* STEP 1: Metadata */}
            {step === 1 && (
              <>
                <div className="form-group">
                  <label className="form-label">Mission Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={missionName}
                    onChange={(e) => setMissionName(e.target.value)}
                    placeholder="e.g. Hyderabad Outer Ring Road Corridor"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Target Location (Lat / Lon)</label>
                  <div className="input-icon-wrapper">
                    <Map size={16} className="icon" />
                    <input
                      type="text"
                      className="form-input"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="17.3850° N, 78.4867° E"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mission Scope & Objective</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Describe survey goals, flight parameters, infrastructure targets..."
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Geospatial Datum & CRS</label>
                  <div className="input-icon-wrapper">
                    <Crosshair size={16} className="icon" />
                    <select
                      className="form-select"
                      style={{ paddingLeft: '38px' }}
                      value={coordSystem}
                      onChange={(e) => setCoordSystem(e.target.value)}
                    >
                      <option value="WGS 84 (EPSG:4326)">WGS 84 (EPSG:4326) — Standard Global</option>
                      <option value="UTM Zone 44N">UTM Zone 44N (EPSG:32644) — India Central</option>
                      <option value="UTM Zone 43N">UTM Zone 43N (EPSG:32643) — India West</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* STEP 2: Video Ingestion */}
            {step === 2 && (
              <>
                <div
                  className="upload-zone"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById('drone-video-input').click()}
                  style={{
                    borderColor: selectedFile ? 'var(--success)' : undefined,
                    background: selectedFile ? 'rgba(34, 197, 94, 0.05)' : undefined
                  }}
                >
                  <input
                    id="drone-video-input"
                    type="file"
                    accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />

                  {selectedFile ? (
                    <>
                      <CheckCircle2 size={32} style={{ color: 'var(--success)' }} />
                      <div className="upload-title" style={{ color: 'var(--success)' }}>
                        {selectedFile.name}
                      </div>
                      <div className="upload-hint">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for ingestion
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--accent)', textDecoration: 'underline', marginTop: '6px' }}>
                        Click to choose a different video
                      </span>
                    </>
                  ) : useSampleVideo ? (
                    <>
                      <Sparkles size={32} style={{ color: 'var(--accent)' }} />
                      <div className="upload-title" style={{ color: 'var(--accent)' }}>
                        Sample UAV Survey Video Selected
                      </div>
                      <div className="upload-hint">
                        1280x720 • 30 FPS • Pre-calibrated urban corridor dataset
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload size={32} />
                      <div className="upload-title">Drop Drone Video Here</div>
                      <div className="upload-hint">
                        Supports MP4, MOV, AVI (H.264 / HEVC) up to 250 MB
                      </div>
                      <span className="btn btn-secondary" style={{ marginTop: '8px', fontSize: '12px' }}>
                        Browse Local Files
                      </span>
                    </>
                  )}
                </div>

                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Don't have drone video handy?</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Use our pre-calibrated sample aerial flight footage.</div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-accent-ghost"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={() => {
                      setUseSampleVideo(true);
                      setSelectedFile(null);
                    }}
                  >
                    Use Sample Footage
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: Telemetry */}
            {step === 3 && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '14px',
                      background: telemetryMode === 'synthesize' ? 'var(--accent-dim)' : 'var(--bg-base)',
                      border: `1px solid ${telemetryMode === 'synthesize' ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="telemetry"
                      checked={telemetryMode === 'synthesize'}
                      onChange={() => setTelemetryMode('synthesize')}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Automated Sensor Fusion & Epipolar Georeferencing
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                        Synthesize calibrated GPS, IMU, and barometric altitude telemetry tied to target location ({location}). Accurately labeled in inspection view.
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '14px',
                      background: telemetryMode === 'manual' ? 'var(--accent-dim)' : 'var(--bg-base)',
                      border: `1px solid ${telemetryMode === 'manual' ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="telemetry"
                      checked={telemetryMode === 'manual'}
                      onChange={() => setTelemetryMode('manual')}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Upload External RTK/PPK Telemetry CSV
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                        Parse synchronized drone flight log with timestamp, lat, lon, AGL altitude, and gimbal orientation.
                      </div>
                    </div>
                  </label>
                </div>
              </>
            )}

            {/* STEP 4: Review & Run */}
            {step === 4 && (
              <div>
                <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>Mission Name</span>
                    <span style={{ fontWeight: 600 }}>{missionName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>Location Coordinates</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{location}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>Aerial Source</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                      {selectedFile ? selectedFile.name : 'Calibrated UAV Sample Video'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>Feature Detector</span>
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>ORB-1000 Multi-Scale</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>Coordinate Reference</span>
                    <span style={{ fontSize: '12px' }}>{coordSystem}</span>
                  </div>
                </div>

                {isSubmitting && (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--accent)' }}>Ingesting Video Stream & Launching Pipeline...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="pipeline-bar-track" style={{ height: '6px' }}>
                      <div className="pipeline-bar-fill" style={{ width: `${Math.max(10, uploadProgress)}%`, background: 'var(--accent)' }}></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '18px', borderTop: '1px solid var(--border)' }}>
              {step > 1 ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(s => s - 1)}
                  disabled={isSubmitting}
                >
                  <ArrowLeft size={14} /> Back
                </button>
              ) : <div></div>}

              {step < 4 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setStep(s => s + 1)}
                >
                  Next Step <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Launching Engine... <RefreshCw size={14} className="animate-spin" /></>
                  ) : (
                    <>Launch Reconstruction <Play size={14} /></>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Architectural Guidance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title"><Activity size={15} /> Pipeline Specifications</span>
            </div>
            <div className="card-body" style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.7' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Single-Pass Workflow:</strong>
                <p>AeroMesh executes continuous forward motion SfM without requiring cross-grid drone laps, cutting flight energy by up to 60%.</p>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Feature Matching:</strong>
                <p>ORB (Oriented FAST and Rotated BRIEF) extraction coupled with bidirectional descriptor matching for scale-invariant tracking.</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Telemetry Synchronization:</strong>
                <p>Fuses high-frequency IMU angular rates with GPS ground track to calibrate camera baseline vectors.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default NewMission;
