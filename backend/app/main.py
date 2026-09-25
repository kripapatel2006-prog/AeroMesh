from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import missions
from app.database.db import engine, Base

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AeroMesh API", description="Single-Pass Drone Reconstruction Platform (Demo)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(missions.router, prefix="/api/missions", tags=["missions"])

@app.get("/api/health")
def health_check():
    return {"status": "ok", "mode": "demo"}

