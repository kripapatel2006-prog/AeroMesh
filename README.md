# AeroMesh - Single-Pass Drone to 3D Model System

AeroMesh is a prototype designed for the Smart India Hackathon (SIH 2026), addressing PS ID: 26158. It demonstrates a single-pass drone video to accurate 3D model generation system, complete with a professional aerospace-grade dashboard, simulated processing pipeline, and an interactive 3D viewer.

## Features

- **Dashboard:** Mission management and overview of completed mapping tasks.
- **New Mission Workflow:** Multi-step mission creation with support for video and telemetry upload.
- **Simulated Processing Pipeline:** Demonstrates the conceptual architecture of Video Ingestion -> SfM -> MVS -> Mesh Completion.
- **Interactive 3D Viewer:** Built with Three.js/React Three Fiber to view the reconstructed environment and take measurements.
- **Architecture Overview:** Outlines how the real AI/CV pipeline integrates with the backend.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide React, Three.js, React Three Fiber.
- **Backend:** FastAPI (Python), SQLite, SQLAlchemy.

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (3.9+)

### Frontend Setup

```bash
cd aeromesh/frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd aeromesh/backend
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
# source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## How to Use (Evaluator Flow)

1. Start both the frontend and backend servers.
2. Open the frontend URL in your browser (usually `http://localhost:5173`).
3. On the Dashboard, click **"Launch Demo Mission"**.
4. You will be taken to the Processing Pipeline which simulates the GPU-heavy reconstruction process.
5. Once complete, click **"View 3D Model"**.
6. Interact with the 3D procedural model (orbit, pan, zoom) and try the **Measure** mode.

## Real AI Integration

This prototype runs in **Demo Mode**, meaning the 3D reconstruction is simulated for immediate evaluation. 
To integrate a real COLMAP/Open3D/PyTorch pipeline:
1. Navigate to `backend/app/services/processing.py`.
2. Replace the `simulate_processing` async function with a subprocess call that triggers your actual Python CV pipeline.
3. Replace the generated `ProceduralCity` component in `Viewer3D.jsx` with a GLTFLoader to load the actual `.glb` output.

