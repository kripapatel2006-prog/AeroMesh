import asyncio
from sqlalchemy.orm import Session
from app.models.models import Mission

async def simulate_processing(mission_id: int, db: Session):
    # Retrieve mission
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        return
    
    mission.status = "Processing"
    db.commit()

    stages = [
        "Video Ingestion",
        "Frame Extraction",
        "Frame Stabilization",
        "Feature Matching",
        "SfM Pose Estimation",
        "MVS Reconstruction",
        "Point Cloud Generation",
        "Neural Mesh Completion",
        "Texture Mapping",
        "GPS/IMU Georeferencing",
        "Model Optimization",
        "Export"
    ]

    # We won't track per-stage in DB for this prototype, just the overall status, 
    # but the frontend will simulate the progress locally.
    
    # Wait to simulate processing time
    await asyncio.sleep(5)
    
    # Refresh mission
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    mission.status = "Completed"
    
    # Populate some demo stats
    mission.flight_duration = "08:42"
    mission.frames_captured = 1560
    mission.frames_used = 412
    mission.processing_time = "11:24"
    mission.model_size_mb = 84.5
    mission.estimated_accuracy_m = 0.8
    mission.coverage_percent = 96.0

    db.commit()

