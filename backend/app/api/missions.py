from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from pathlib import Path
import shutil
import json
import os

from app.database.db import get_db
from app.models.models import Mission
from app.services.processing import run_mission_pipeline, PIPELINE_STAGES
from app.services.demo_generator import ensure_demo_video

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

class MissionCreate(BaseModel):
    name: str = Field(..., example="Hyderabad Infrastructure Survey")
    location: str = Field(..., example="17.3850° N, 78.4867° E")
    description: Optional[str] = Field(None, example="Rapid single-pass UAV infrastructure assessment")
    coordinate_system: Optional[str] = Field("WGS 84 (EPSG:4326)")

@router.get("/")
def get_missions(db: Session = Depends(get_db)):
    missions = db.query(Mission).order_by(Mission.id.desc()).all()
    # Seed default completed demo mission if database is fresh
    if not missions:
        demo_video = ensure_demo_video()
        seed_m = Mission(
            name="Hyderabad Infrastructure Survey",
            location="17.3850° N, 78.4867° E",
            description="High-resolution single-pass UAV photogrammetry assessment of urban transport corridor.",
            coordinate_system="WGS 84 (EPSG:4326)",
            status="COMPLETED",
            current_stage="Reconstruction Complete",
            progress=100.0,
            stage_index=len(PIPELINE_STAGES),
            video_filename="sample_aerial_survey.mp4",
            video_path=demo_video,
            video_duration_sec=4.0,
            video_fps=30.0,
            video_resolution="1280x720",
            video_size_mb=4.2,
            frames_total=120,
            frames_processed=36,
            features_detected=18450,
            features_tracked=12140,
            processing_time_sec=14.2,
            model_size_mb=3.8,
            estimated_accuracy_m=0.82,
            coverage_percent=94.5,
            ground_sampling_distance_cm=4.2,
            is_demo=True,
            preview_image_url="/outputs/mission_seed/preview_features.jpg"
        )
        db.add(seed_m)
        db.commit()
        db.refresh(seed_m)
        missions = [seed_m]
    return [m.to_dict() for m in missions]

@router.post("/demo")
def create_demo_mission(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Creates and immediately launches a deterministic demo mission with real video CV processing."""
    demo_video = ensure_demo_video()
    mission = Mission(
        name=f"Demo Survey Mission {db.query(Mission).count() + 1}",
        location="17.3850° N, 78.4867° E",
        description="Automated single-pass UAV reconstruction demonstration running real OpenCV feature analysis.",
        coordinate_system="WGS 84 (EPSG:4326)",
        status="CREATED",
        video_filename="sample_aerial_survey.mp4",
        video_path=demo_video,
        is_demo=True
    )
    db.add(mission)
    db.commit()
    db.refresh(mission)
    
    background_tasks.add_task(run_mission_pipeline, mission.id)
    return mission.to_dict()

@router.post("/")
def create_mission(mission_in: MissionCreate, db: Session = Depends(get_db)):
    db_mission = Mission(
        name=mission_in.name,
        location=mission_in.location,
        description=mission_in.description,
        coordinate_system=mission_in.coordinate_system,
        status="CREATED"
    )
    db.add(db_mission)
    db.commit()
    db.refresh(db_mission)
    return db_mission.to_dict()

@router.get("/{mission_id}")
def get_mission(mission_id: int, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail=f"Mission with ID {mission_id} not found")
    return mission.to_dict()

@router.post("/{mission_id}/upload")
async def upload_video(
    mission_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Handles real file upload for MP4, MOV, AVI aerial videos."""
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    ext = Path(file.filename).suffix.lower()
    allowed_exts = [".mp4", ".mov", ".avi", ".mkv", ".webm"]
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{ext}'. Supported formats: {', '.join(allowed_exts)}"
        )

    # Save to disk
    safe_name = f"mission_{mission_id}_{file.filename}"
    target_path = UPLOADS_DIR / safe_name
    
    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size_mb = os.path.getsize(target_path) / (1024 * 1024)

    mission.video_filename = file.filename
    mission.video_path = str(target_path)
    mission.video_size_mb = round(file_size_mb, 2)
    mission.status = "UPLOADED"
    mission.current_stage = "Video Uploaded & Ready"
    db.commit()
    db.refresh(mission)

    return {
        "message": "File uploaded successfully",
        "filename": file.filename,
        "size_mb": round(file_size_mb, 2),
        "status": mission.status
    }

@router.post("/{mission_id}/process")
def process_mission(
    mission_id: int, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
        
    if mission.status == "PROCESSING":
        return {"message": "Mission is already processing", "mission_id": mission_id}

    background_tasks.add_task(run_mission_pipeline, mission_id)
    return {"message": "Reconstruction pipeline started", "mission_id": mission_id}

@router.get("/{mission_id}/status")
def get_mission_status(mission_id: int, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    logs = json.loads(mission.logs_json) if mission.logs_json else []
    return {
        "id": mission.id,
        "status": mission.status,
        "current_stage": mission.current_stage,
        "stage_index": mission.stage_index,
        "total_stages": len(PIPELINE_STAGES),
        "stages": PIPELINE_STAGES,
        "progress": round(mission.progress, 1),
        "logs": logs,
        "error_message": mission.error_message,
        "metrics": {
            "frames_processed": mission.frames_processed,
            "frames_total": mission.frames_total,
            "features_detected": mission.features_detected,
            "features_tracked": mission.features_tracked,
            "processing_time_sec": round(mission.processing_time_sec, 2),
            "estimated_accuracy_m": mission.estimated_accuracy_m,
            "coverage_percent": mission.coverage_percent,
        },
        "preview_image_url": mission.preview_image_url
    }

@router.get("/{mission_id}/results")
def get_mission_results(mission_id: int, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    telemetry = json.loads(mission.telemetry_json) if mission.telemetry_json else {}
    reconstruction = json.loads(mission.reconstruction_json) if mission.reconstruction_json else {}

    # If completed but reconstruction empty, trigger a quick synthesis
    if mission.status == "COMPLETED" and not reconstruction:
        engine = CVProcessingEngine(mission_id=mission.id)
        video_p = mission.video_path or ensure_demo_video()
        res = engine.process_pipeline(video_p, mission.location)
        reconstruction = json.loads(res["reconstruction_json"])
        telemetry = json.loads(res["telemetry_json"])
        mission.reconstruction_json = res["reconstruction_json"]
        mission.telemetry_json = res["telemetry_json"]
        mission.preview_image_url = res["preview_image_url"]
        db.commit()

    return {
        "mission": mission.to_dict(),
        "telemetry": telemetry,
        "reconstruction": reconstruction
    }

@router.delete("/{mission_id}")
def delete_mission(mission_id: int, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    db.delete(mission)
    db.commit()
    return {"message": f"Mission {mission_id} deleted"}
