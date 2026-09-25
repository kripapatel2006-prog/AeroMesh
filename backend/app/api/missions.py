from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.database.db import get_db
from app.models.models import Mission
from app.services.processing import simulate_processing

router = APIRouter()

class MissionCreate(BaseModel):
    name: str
    location: str
    description: Optional[str] = None
    coordinate_system: Optional[str] = "WGS84"
    expected_flight_duration: Optional[str] = "00:00"

class MissionResponse(BaseModel):
    id: int
    name: str
    location: str
    description: Optional[str]
    status: str
    
    # Stats
    flight_duration: str
    frames_captured: int
    frames_used: int
    processing_time: str
    model_size_mb: float
    estimated_accuracy_m: float
    coverage_percent: float

    class Config:
        from_attributes = True

@router.post("/", response_model=MissionResponse)
def create_mission(mission: MissionCreate, db: Session = Depends(get_db)):
    db_mission = Mission(**mission.dict())
    db.add(db_mission)
    db.commit()
    db.refresh(db_mission)
    return db_mission

@router.get("/", response_model=List[MissionResponse])
def get_missions(db: Session = Depends(get_db)):
    return db.query(Mission).order_by(Mission.id.desc()).all()

@router.get("/{mission_id}", response_model=MissionResponse)
def get_mission(mission_id: int, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    return mission

@router.post("/{mission_id}/process")
def process_mission(mission_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    # Run processing simulation in background
    background_tasks.add_task(simulate_processing, mission_id, db)
    return {"message": "Processing started (Demo Mode)"}

