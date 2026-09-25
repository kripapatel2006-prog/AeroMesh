import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import time
from app.database.db import engine, Base, SessionLocal
from app.models.models import Mission
from app.services.processing import run_mission_pipeline
from app.services.demo_generator import ensure_demo_video

print("=== 1. Checking Database Tables ===")
Base.metadata.create_all(bind=engine)
db = SessionLocal()
print("Database connected.")

print("\n=== 2. Creating Test Mission ===")
demo_video = ensure_demo_video()
print(f"Demo video ready at: {demo_video}")

test_mission = Mission(
    name="Test Flight Validation AM-999",
    location="17.3850° N, 78.4867° E",
    description="Verification of real OpenCV feature extraction and 3D triangulation",
    coordinate_system="WGS 84 (EPSG:4326)",
    video_filename="sample_aerial_survey.mp4",
    video_path=demo_video,
    is_demo=True,
    status="CREATED"
)
db.add(test_mission)
db.commit()
db.refresh(test_mission)
mission_id = test_mission.id
print(f"Created Mission ID: {mission_id}")
db.close()

print("\n=== 3. Executing Real CV Pipeline ===")
start_time = time.time()
run_mission_pipeline(mission_id)
duration = time.time() - start_time
print(f"Pipeline executed in {duration:.2f} seconds.")

print("\n=== 4. Verifying Mission Outputs in DB ===")
db = SessionLocal()
completed = db.query(Mission).filter(Mission.id == mission_id).first()
print(f"Status: {completed.status}")
print(f"Current Stage: {completed.current_stage}")
print(f"Progress: {completed.progress}%")
print(f"Frames Processed: {completed.frames_processed} / {completed.frames_total}")
print(f"Features Detected: {completed.features_detected}")
print(f"Features Tracked: {completed.features_tracked}")
print(f"GSD: {completed.ground_sampling_distance_cm} cm/px")
print(f"Coverage: {completed.coverage_percent}%")
print(f"Preview Image URL: {completed.preview_image_url}")

import json
reconstruction = json.loads(completed.reconstruction_json)
print(f"Reconstructed 3D Points: {reconstruction.get('point_count', 0)}")
print(f"Trajectory Waypoints: {len(reconstruction.get('trajectory', []))}")

telemetry = json.loads(completed.telemetry_json)
print(f"Telemetry Samples: {len(telemetry.get('samples', []))}")
print(f"Distance Travelled: {telemetry.get('distance_travelled_m')} m")

assert completed.status == "COMPLETED", "Pipeline did not reach COMPLETED status!"
assert completed.frames_processed > 0, "No frames were processed!"
assert completed.features_detected > 0, "No features were detected!"
assert reconstruction.get('point_count', 0) > 0, "No 3D points in reconstruction!"

print("\n>>> ALL PIPELINE TESTS PASSED WITH 100% SUCCESS! <<<")
db.close()
