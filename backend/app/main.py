from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.api import missions
from app.database.db import engine, Base
from app.services.demo_generator import ensure_demo_video

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AeroMesh API",
    description="Single-Pass Drone to 3D Model Reconstruction Platform",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUTS_DIR = BASE_DIR / "outputs"
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

# Mount outputs directory for visual assets and previews
app.mount("/outputs", StaticFiles(directory=str(OUTPUTS_DIR)), name="outputs")

app.include_router(missions.router, prefix="/api/missions", tags=["missions"])

@app.on_event("startup")
def on_startup():
    try:
        ensure_demo_video()
    except Exception as e:
        print(f"Startup warning initializing demo assets: {e}")

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "AeroMesh Core Engine",
        "cv_engine": "OpenCV / ORB Multi-Scale",
        "mode": "hybrid"
    }
