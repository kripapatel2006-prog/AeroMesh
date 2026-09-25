import cv2
import numpy as np
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEMO_DIR = BASE_DIR / "demo_data"
DEMO_DIR.mkdir(parents=True, exist_ok=True)

DEMO_VIDEO_PATH = DEMO_DIR / "sample_aerial_survey.mp4"

def ensure_demo_video() -> str:
    """
    Generates a deterministic synthetic aerial survey video (MP4)
    simulating UAV perspective over ground structures with realistic high-frequency
    visual features for ORB extraction and tracking.
    """
    if DEMO_VIDEO_PATH.exists() and os.path.getsize(DEMO_VIDEO_PATH) > 50000:
        return str(DEMO_VIDEO_PATH)
        
    width = 1280
    height = 720
    fps = 30
    duration_sec = 4.0
    total_frames = int(fps * duration_sec)
    
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(str(DEMO_VIDEO_PATH), fourcc, fps, (width, height))
    
    if not out.isOpened():
        # Fallback to AVI if mp4v codec is unavailable on host
        fallback_path = DEMO_DIR / "sample_aerial_survey.avi"
        fourcc = cv2.VideoWriter_fourcc(*"XVID")
        out = cv2.VideoWriter(str(fallback_path), fourcc, fps, (width, height))
        if not out.isOpened():
            raise RuntimeError("Could not initialize VideoWriter for demo video.")
        target_path = fallback_path
    else:
        target_path = DEMO_VIDEO_PATH
        
    np.random.seed(1337)
    
    # Synthesize structured terrain texture (roads, building roofs, field grid)
    terrain_canvas = np.zeros((height * 2, width * 2, 3), dtype=np.uint8)
    # Fill terrain base color (dark slate/earth tones)
    terrain_canvas[:] = (35, 45, 40)
    
    # Draw road grid
    for rx in range(100, terrain_canvas.shape[1], 250):
        cv2.line(terrain_canvas, (rx, 0), (rx, terrain_canvas.shape[0]), (75, 80, 85), 24)
        cv2.line(terrain_canvas, (rx, 0), (rx, terrain_canvas.shape[0]), (200, 200, 200), 2, cv2.LINE_AA)
        
    for ry in range(100, terrain_canvas.shape[0], 250):
        cv2.line(terrain_canvas, (0, ry), (terrain_canvas.shape[1], ry), (75, 80, 85), 24)
        cv2.line(terrain_canvas, (0, ry), (terrain_canvas.shape[1], ry), (200, 200, 200), 2, cv2.LINE_AA)

    # Draw building footprints with high-contrast corner features (great for ORB)
    for bx in range(160, terrain_canvas.shape[1] - 150, 180):
        for by in range(160, terrain_canvas.shape[0] - 150, 180):
            bw = np.random.randint(60, 110)
            bh = np.random.randint(60, 110)
            color = (
                int(np.random.randint(60, 130)),
                int(np.random.randint(80, 150)),
                int(np.random.randint(100, 180))
            )
            cv2.rectangle(terrain_canvas, (bx, by), (bx + bw, by + bh), color, -1)
            # Roof detail & HVAC boxes
            cv2.rectangle(terrain_canvas, (bx, by), (bx + bw, by + bh), (220, 230, 240), 2)
            cv2.rectangle(terrain_canvas, (bx + 15, by + 15), (bx + 35, by + 35), (40, 50, 60), -1)
            
    # Add agricultural/ground texture noise
    noise = np.random.randint(-15, 15, terrain_canvas.shape, dtype=np.int16)
    terrain_canvas = np.clip(terrain_canvas.astype(np.int16) + noise, 0, 255).astype(np.uint8)

    # Render flight camera trajectory moving across terrain with altitude scaling
    for f in range(total_frames):
        t = f / float(total_frames)
        # Pan coordinates
        offset_x = int(100 + t * 400)
        offset_y = int(80 + t * 300)
        
        # Crop window
        crop = terrain_canvas[offset_y:offset_y + height, offset_x:offset_x + width].copy()
        
        # Add subtle drone gimbal shake & slight exposure variation
        dx = int(np.sin(f * 0.4) * 2)
        dy = int(np.cos(f * 0.3) * 2)
        M = np.float32([[1, 0, dx], [0, 1, dy]])
        frame = cv2.warpAffine(crop, M, (width, height), borderMode=cv2.BORDER_REFLECT)
        
        # Add telemetry HUD watermarking simulating real camera feed
        cv2.putText(frame, f"REC [UAV-ALPHA] ALT: {124.5 + np.sin(f*0.1)*1.2:.1f}m GIMBAL: -75.0 DEG", 
                    (30, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 200), 2, cv2.LINE_AA)
                    
        out.write(frame)
        
    out.release()
    return str(target_path)
