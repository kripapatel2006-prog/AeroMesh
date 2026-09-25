import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Map, Video, Activity, Compass, FileText, Crosshair, Upload } from 'lucide-react';

const NewMission = () => {
  const navigate = useNavigate();
  const [missionName, setMissionName] = useState('Hyderabad Infrastructure');
  const [location, setLocation]       = useState('17.3850° N, 78.4867° E');
  const [desc, setDesc]               = useState('');

  return (
    <div className="animate-in">

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h2>Create New Mission</h2>
          <p>Configure parameters for single-pass UAV reconstruction.</p>
        </div>
        <button className="btn btn-accent-ghost" onClick={() => navigate('/processing')}>
          <Play size={15} /> Use Demo Mission
        </button>
      </div>

      {/* Step Indicator */}
      <div className="step-row">
        <div className="step-item active">
          <div className="step-dot">01</div>
          <div className="step-label">Mission</div>
        </div>
        <div className="step-divider"></div>
        <div className="step-item">
          <div className="step-dot">02</div>
          <div className="step-label">Drone Data</div>
        </div>
        <div className="step-divider"></div>
        <div className="step-item">
          <div className="step-dot">03</div>
          <div className="step-label">Telemetry</div>
        </div>
        <div className="step-divider"></div>
        <div className="step-item">
          <div className="step-dot">04</div>
          <div className="step-label">Review</div>
        </div>
      </div>

      {/* Content */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>

        {/* Left — Mission Metadata */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <FileText size={15} /> Mission Metadata
            </span>
          </div>
          <div className="card-body">

            <div className="form-group">
              <label className="form-label">Mission Name</label>
              <input
                type="text"
                className="form-input"
                value={missionName}
                onChange={e => setMissionName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location (Lat / Lon)</label>
              <div className="input-icon-wrapper">
                <Map size={16} className="icon" />
                <input
                  type="text"
                  className="form-input"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Enter mission objectives..."
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
            </div>

            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Coordinate System</label>
              <div className="input-icon-wrapper">
                <Crosshair size={16} className="icon" />
                <select className="form-select" style={{paddingLeft:'38px'}}>
                  <option>WGS 84 (EPSG:4326)</option>
                  <option>UTM Zone 44N</option>
                  <option>UTM Zone 43N</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Right — Data Uploads */}
        <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>

          <div className="card">
            <div className="card-header">
              <span className="card-title"><Video size={15} /> Drone Video</span>
            </div>
            <div className="card-body">
              <div className="upload-zone">
                <Upload size={28} />
                <div className="upload-title">Drag & drop MP4 / MOV</div>
                <div className="upload-hint">Or browse — supports image sequences too</div>
              </div>
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px'}}>
            <div className="card">
              <div className="card-header">
                <span className="card-title" style={{fontSize:'11px'}}><Map size={13} /> GPS Telemetry</span>
              </div>
              <div style={{padding:'14px'}}>
                <div className="upload-zone upload-zone-small">
                  <Upload size={18} />
                  <div className="upload-title" style={{fontSize:'12px'}}>RTK/PPK logs</div>
                  <div className="upload-hint">.csv, .log</div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <span className="card-title" style={{fontSize:'11px'}}><Compass size={13} /> IMU Telemetry</span>
              </div>
              <div style={{padding:'14px'}}>
                <div className="upload-zone upload-zone-small">
                  <Upload size={18} />
                  <div className="upload-title" style={{fontSize:'12px'}}>Orientation data</div>
                  <div className="upload-hint">.csv, .log</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title"><Activity size={15} /> Barometric Data</span>
            </div>
            <div style={{padding:'14px'}}>
              <div className="upload-zone upload-zone-small">
                <Upload size={18} />
                <div className="upload-title" style={{fontSize:'13px'}}>Altitude correlation</div>
                <div className="upload-hint">.csv, .txt — optional</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Action row */}
      <div style={{display:'flex', justifyContent:'flex-end', marginTop:'24px', paddingTop:'20px', borderTop:'1px solid var(--border)'}}>
        <button className="btn btn-primary" onClick={() => navigate('/processing')}>
          Continue to Processing <Play size={15} style={{marginLeft:'4px'}} />
        </button>
      </div>

    </div>
  );
};

export default NewMission;
