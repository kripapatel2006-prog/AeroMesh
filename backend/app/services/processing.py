import time
import json
import logging
import traceback
from datetime import datetime, timezone
from app.database.db import SessionLocal
from app.models.models import Mission
from app.services.cv_engine import CVProcessingEngine
from app.services.demo_generator import ensure_demo_video

logger = logging.getLogger("aeromesh.pipeline")

PIPELINE_STAGES = [
    {"index": 0, "name": "Video Ingestion & Stream Analysis", "desc": "Validating container format, framerate, and codec"},
    {"index": 1, "name": "Keyframe Extraction & Normalization", "desc": "Decimating temporal redundancy and stabilizing exposure"},
    {"index": 2, "name": "ORB Feature Detection", "desc": "Extracting oriented FAST keypoints with multi-scale pyramid"},
    {"index": 3, "name": "Feature Tracking & Optical Flow", "desc": "Matching descriptor pairs and rejecting outlier vectors"},
    {"index": 4, "name": "Sparse Spatial Triangulation", "desc": "Estimating 3D point cloud via multi-view epipolar geometry"},
    {"index": 5, "name": "Sensor & Telemetry Fusion", "desc": "Synchronizing GPS, IMU, and barometric altitude profile"},
    {"index": 6, "name": "Georeferenced Model Generation", "desc": "Applying WGS-84 datum coordinate transformation"},
]

def append_log(mission: Mission, message: str, level: str = "INFO"):
    now_str = datetime.now().strftime("%H:%M:%S")
    logs = json.loads(mission.logs_json) if mission.logs_json else []
    logs.append({"ts": now_str, "msg": message, "level": level})
    mission.logs_json = json.dumps(logs)

def run_mission_pipeline(mission_id: int):
    """
    Synchronous worker executed in a background task thread with dedicated DB session.
    Controls the mission state machine and coordinates real CV processing.
    """
    db = SessionLocal()
    try:
        mission = db.query(Mission).filter(Mission.id == mission_id).first()
        if not mission:
            logger.error(f"Mission {mission_id} not found.")
            return

        mission.status = "PROCESSING"
        mission.progress = 5.0
        mission.stage_index = 0
        mission.current_stage = PIPELINE_STAGES[0]["name"]
        append_log(mission, f"AeroMesh Engine initialized for Mission AM-{mission.id:04d}.")
        append_log(mission, f"Target Location: {mission.location} | Coordinate System: {mission.coordinate_system}")
        db.commit()

        # Check video file
        video_path = mission.video_path
        if not video_path or not cv2_file_accessible(video_path):
            append_log(mission, "No user video provided — initializing calibrated demo flight footage.", "WARN")
            video_path = ensure_demo_video()
            mission.video_path = video_path
            mission.video_filename = "sample_aerial_survey.mp4"
            mission.is_demo = True
            db.commit()

        append_log(mission, f"Ingesting video stream: {mission.video_filename}...")
        
        engine = CVProcessingEngine(mission_id=mission.id)
        
        # Callback to update database during stages
        def on_cv_stage(stage_idx: int, stage_name: str, pct: float):
            try:
                m = db.query(Mission).filter(Mission.id == mission_id).first()
                if m:
                    m.stage_index = min(stage_idx, len(PIPELINE_STAGES) - 1)
                    m.current_stage = stage_name
                    m.progress = pct
                    append_log(m, f"Stage {stage_idx+1}/{len(PIPELINE_STAGES)}: {stage_name}")
                    db.commit()
            except Exception as e:
                logger.error(f"Stage update error: {e}")

        # Execute genuine computer vision pipeline
        results = engine.process_pipeline(
            video_path=video_path,
            location_str=mission.location or "17.3850° N, 78.4867° E",
            progress_callback=on_cv_stage
        )

        # Update final mission fields
        mission = db.query(Mission).filter(Mission.id == mission_id).first()
        mission.frames_total = results["frames_total"]
        mission.frames_processed = results["frames_processed"]
        mission.features_detected = results["features_detected"]
        mission.features_tracked = results["features_tracked"]
        mission.processing_time_sec = results["processing_time_sec"]
        mission.model_size_mb = results["model_size_mb"]
        mission.estimated_accuracy_m = results["estimated_accuracy_m"]
        mission.coverage_percent = results["coverage_percent"]
        mission.ground_sampling_distance_cm = results["ground_sampling_distance_cm"]
        mission.preview_image_url = results["preview_image_url"]
        mission.telemetry_json = results["telemetry_json"]
        mission.reconstruction_json = results["reconstruction_json"]

        meta = engine.analyze_video_metadata(video_path)
        mission.video_duration_sec = meta["duration_sec"]
        mission.video_fps = meta["fps"]
        mission.video_resolution = meta["resolution"]
        mission.video_size_mb = meta["file_size_mb"]

        mission.status = "COMPLETED"
        mission.progress = 100.0
        mission.stage_index = len(PIPELINE_STAGES)
        mission.current_stage = "Reconstruction Complete"
        
        append_log(mission, f"Extracted {mission.frames_processed} keyframes from {mission.frames_total} stream frames.")
        append_log(mission, f"Detected {mission.features_detected:,} ORB features; successfully tracked {mission.features_tracked:,} spatial inliers.")
        append_log(mission, f"Georeferenced 3D point cloud generated ({mission.model_size_mb:.2f} MB). Estimated GSD: {mission.ground_sampling_distance_cm:.1f} cm/px.")
        append_log(mission, "Pipeline complete. Mission assets ready for 3D inspection.", "SUCCESS")
        db.commit()

    except Exception as e:
        logger.error(f"Pipeline error for mission {mission_id}: {traceback.format_exc()}")
        try:
            m = db.query(Mission).filter(Mission.id == mission_id).first()
            if m:
                m.status = "FAILED"
                m.error_message = str(e)
                append_log(m, f"Pipeline Error: {str(e)}", "ERROR")
                db.commit()
        except Exception:
            pass
    finally:
        db.close()

def cv2_file_accessible(path_str: str) -> bool:
    import os
    return bool(path_str and os.path.exists(path_str) and os.path.getsize(path_str) > 0)
