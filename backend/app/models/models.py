from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database.db import Base
from datetime import datetime

class Mission(Base):
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    description = Column(String)
    status = Column(String, default="Queued") # Queued, Processing, Completed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Stats
    flight_duration = Column(String, default="00:00")
    frames_captured = Column(Integer, default=0)
    frames_used = Column(Integer, default=0)
    processing_time = Column(String, default="00:00")
    model_size_mb = Column(Float, default=0.0)
    estimated_accuracy_m = Column(Float, default=0.0)
    coverage_percent = Column(Float, default=0.0)

