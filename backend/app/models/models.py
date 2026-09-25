from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from app.database.db import Base
from datetime import datetime, timezone
import json

def utcnow():
    return datetime.now(timezone.utc)

class Mission(Base):
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), index=True, nullable=False)
    location = Column(String(256), default="Hyderabad Infrastructure, IN")
    description = Column(Text, nullable=True)
    coordinate_system = Column(String(64), default="WGS 84 (EPSG:4326)")
    
    # State Machine: CREATED, UPLOADING, UPLOADED, PROCESSING, CV_ANALYSIS, RECONSTRUCTION, COMPLETED, FAILED
    status = Column(String(32), default="CREATED", index=True)
    current_stage = Column(String(64), default="Mission Initialized")
    progress = Column(Float, default=0.0)
    stage_index = Column(Integer, default=0)
    logs_json = Column(Text, default="[]")
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    
    # Video Metadata
    video_filename = Column(String(256), nullable=True)
    video_path = Column(String(512), nullable=True)
    video_duration_sec = Column(Float, default=0.0)
    video_fps = Column(Float, default=0.0)
    video_resolution = Column(String(32), default="0x0")
    video_size_mb = Column(Float, default=0.0)
    
    # Computer Vision & Reconstruction Metrics (Real)
    frames_total = Column(Integer, default=0)
    frames_processed = Column(Integer, default=0)
    features_detected = Column(Integer, default=0)
    features_tracked = Column(Integer, default=0)
    processing_time_sec = Column(Float, default=0.0)
    model_size_mb = Column(Float, default=0.0)
    estimated_accuracy_m = Column(Float, default=0.0)
    coverage_percent = Column(Float, default=0.0)
    ground_sampling_distance_cm = Column(Float, default=0.0)
    
    # Telemetry and 3D Asset references
    is_demo = Column(Boolean, default=False)
    preview_image_url = Column(String(512), nullable=True)
    telemetry_json = Column(Text, default="{}")
    reconstruction_json = Column(Text, default="{}")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "description": self.description,
            "coordinate_system": self.coordinate_system,
            "status": self.status,
            "current_stage": self.current_stage,
            "progress": round(self.progress, 1),
            "stage_index": self.stage_index,
            "logs": json.loads(self.logs_json) if self.logs_json else [],
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "video_filename": self.video_filename,
            "video_duration_sec": round(self.video_duration_sec, 1),
            "video_fps": round(self.video_fps, 1),
            "video_resolution": self.video_resolution,
            "video_size_mb": round(self.video_size_mb, 2),
            "frames_total": self.frames_total,
            "frames_processed": self.frames_processed,
            "features_detected": self.features_detected,
            "features_tracked": self.features_tracked,
            "processing_time_sec": round(self.processing_time_sec, 2),
            "model_size_mb": round(self.model_size_mb, 2),
            "estimated_accuracy_m": round(self.estimated_accuracy_m, 2),
            "coverage_percent": round(self.coverage_percent, 1),
            "ground_sampling_distance_cm": round(self.ground_sampling_distance_cm, 1),
            "is_demo": self.is_demo,
            "preview_image_url": self.preview_image_url,
        }
