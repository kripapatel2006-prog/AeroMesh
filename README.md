# AeroMesh — Single-Pass Drone to 3D Model System

> **Smart India Hackathon (SIH 2026)**  
> **Problem Statement ID:** 26158  
> **Theme:** Robotics & Drones / Geospatial Intelligence  
> **Repository:** [AeroMesh GitHub](https://github.com/kripapatel2006-prog/AeroMesh.git)

AeroMesh is a full-stack drone photogrammetry and computer vision platform that converts a **single continuous UAV flight pass** into an accurate, georeferenced 3D spatial model. 

Traditional aerial survey workflows require multi-grid overlapping cross-hatch passes taking 4+ hours of flight and cloud processing. AeroMesh runs an edge-optimized computer vision pipeline that fuses aerial video with GPS, IMU, and barometric telemetry to produce actionable 3D situational intelligence in minutes.

---

## Key Features

1. **Mission Intelligence Dashboard:**
   - Real-time aggregate telemetry (active missions, processed models, mean processing time, ground sampling accuracy).
   - Live SQLite registry tracking keyframes, feature counts, and geodetic coordinates.

2. **Functional Multi-Step Mission Creation:**
   - Mission metadata configuration with coordinate reference system selection (WGS 84, UTM 44N/43N).
   - Real file upload handling (MP4, MOV, AVI, WebM) with drag-and-drop and progress tracking.
   - Deterministic instant demo mode with pre-calibrated aerial corridor survey footage.

3. **Genuine OpenCV Computer Vision Pipeline:**
   - **Adaptive Keyframe Sampling:** Extracts optimal temporal frames while reducing redundancy.
   - **ORB Feature Detection:** Oriented FAST corners and multi-scale rotated BRIEF descriptors.
   - **Lucas-Kanade Feature Tracking:** Inter-frame optical flow matching with spatial inlier validation.
   - **Feature Keypoint Visualization:** Live preview showing keypoint centroids and motion vectors.
   - **Asynchronous State Machine:** Real-time polling tracking processing stages and execution logs.

4. **Calibrated Telemetry & Sensor Fusion:**
   - Merges GPS ground track with barometric altitude profile using a complementary filter.
   - Visualizes altitude over time with an embedded SVG elevation profile.
   - Calculates Ground Sampling Distance (GSD) and surface coverage area.

5. **Data-Driven 3D Geospatial Viewer:**
   - Built on Three.js & React Three Fiber (WebGL).
   - Renders genuine 3D sparse point clouds with height-based colormap gradients.
   - Displays 3D UAV camera flight trajectory with waypoint markers.
   - **Interactive 3D Measurement Tool:** Uses Three.js raycasting to measure real-world distances between any two points in calibrated meters.
   - Export 3D point cloud dataset as standard JSON.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 5, Three.js, React Three Fiber, React Drei, Zustand, Axios, Lucide React |
| **Backend** | Python 3.13, FastAPI, Uvicorn, SQLAlchemy 2.0, SQLite, Pydantic v2 |
| **Computer Vision** | OpenCV 5.0 (Headless), NumPy (Spatial Vector Geometry, Triangulation) |
| **Geodesy & Telemetry** | WGS 84 (EPSG:4326), Epipolar Epistemic Geometry, Sensor Fusion |

---

## Installation & Setup

### Prerequisites
- **Node.js:** v18+ (tested on Node v22)
- **Python:** 3.10+ (tested on Python 3.13)

---

### Step 1: Backend Setup

```bash
cd AeroMesh/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
venv\Scripts\activate.bat
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run integration tests
python tests/test_pipeline.py

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will be active at: `http://127.0.0.1:8000`  
API Swagger Docs: `http://127.0.0.1:8000/docs`

---

### Step 2: Frontend Setup

Open a second terminal:

```bash
cd AeroMesh/frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Frontend will be active at: `http://localhost:5173`

---

## Evaluator / SIH Judge Demo Script (3–5 Minutes)

1. **Step 1: Dashboard (`/`)**
   - Open `http://localhost:5173`.
   - Observe the live system status indicator (**"FastAPI + OpenCV Active"**).
   - Point out real historical missions recorded in the database.
   - Click **"Launch Demo Mission"**.

2. **Step 2: Processing Pipeline (`/processing`)**
   - Watch the backend state machine progress through 7 stages:
     `Video Ingestion` ➔ `Keyframe Sampling` ➔ `ORB Extraction` ➔ `Optical Tracking` ➔ `3D Triangulation` ➔ `Sensor Fusion` ➔ `Reconstruction Complete`.
   - Show the **real-time CV telemetry log** displaying actual timestamps and frame counts.
   - Point out the **Live Ingestion Frame preview** showing actual extracted ORB keypoints.
   - Once complete, click **"Inspect 3D Model"**.

3. **Step 3: 3D Viewer Workspace (`/viewer`)**
   - Orbit, pan, and zoom around the **data-driven 3D point cloud**.
   - Show the yellow **UAV Flight Path** trajectory showing camera positions during survey.
   - Toggle scene layers: *Point Cloud*, *Height Map*, *Wireframe*, *Flight Path*.
   - Point to the **Altitude Profile Chart** in the right sidebar showing fused barometric vs GPS altitude.

4. **Step 4: Interactive Measurement Tool**
   - Click the **Ruler icon** in the left toolbar to activate measurement mode.
   - Click on any point on the terrain (**Point A**).
   - Click on a second point across a structure (**Point B**).
   - Watch the 3D dashed line and calibrated distance tag appear (e.g. `14.85 m`).
   - Explain how the distance is calibrated against the Ground Sampling Distance (GSD).

5. **Step 5: Create a Custom Mission (`/new`)**
   - Navigate to **"New Mission"**.
   - Walk through the 4-step wizard: enter custom survey coordinates, drag and drop an aerial video (or choose pre-calibrated sample footage), configure telemetry, and launch.

---

## Technical Defensibility & Judge Q&A

### Q1: What makes AeroMesh "Single-Pass"?
> **Answer:** Traditional photogrammetry requires cross-grid laps with 80% forward and 70% lateral overlap to establish bundle adjustment baselines. AeroMesh utilizes forward-motion epipolar geometry coupled with continuous multi-scale ORB feature tracking along a single linear corridor flight, significantly reducing drone battery consumption and survey time.

### Q2: What is real and what is prototype-scoped?
> **Answer:**
> - **Real:** Video ingestion, frame extraction, ORB keypoint detection, inter-frame optical flow matching, 3D spatial triangulation, live state machine, telemetry synchronization, WebGL point cloud rendering, and raycast measurement.
> - **Prototype Scope:** The 3D point cloud is a sparse spatial representation generated from tracked features. Full industrial photogrammetry (like OpenMVS / COLMAP) performs dense Poisson surface reconstruction requiring multi-gigabyte GPU clusters; AeroMesh is engineered as an edge-ready, rapid-situational-awareness system.

### Q3: How does sensor fusion work?
> **Answer:** Consumer drone GPS has vertical inaccuracies of $\pm 3\text{--}5\text{ m}$. AeroMesh fuses barometric altitude changes ($\Delta P \propto \Delta h$) with GPS ground positions using a complementary filter, stabilizing elevation estimates before projecting 2D keypoints into georeferenced 3D space.

---

## Project Structure

```
AeroMesh/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── missions.py          # FastAPI mission endpoints & upload handlers
│   │   ├── database/
│   │   │   └── db.py                # SQLAlchemy DeclarativeBase database config
│   │   ├── models/
│   │   │   └── models.py            # Mission ORM model & telemetry schemas
│   │   ├── services/
│   │   │   ├── cv_engine.py         # OpenCV ORB extraction, tracking & 3D triangulation
│   │   │   ├── demo_generator.py    # Deterministic aerial survey video generator
│   │   │   └── processing.py        # Background state machine orchestrator
│   │   └── main.py                  # FastAPI app entry & static outputs mount
│   ├── demo_data/                   # Calibrated demo UAV footage
│   ├── outputs/                     # Generated keypoint previews & point cloud JSON
│   ├── tests/
│   │   └── test_pipeline.py         # Automated pipeline integration test
│   └── requirements.txt             # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Mission registry & live analytics
│   │   │   ├── NewMission.jsx       # 4-step mission & video upload wizard
│   │   │   ├── Processing.jsx       # Live CV pipeline tracker & keypoint preview
│   │   │   ├── Viewer3D.jsx         # WebGL point cloud, trajectory & 3D ruler
│   │   │   └── Architecture.jsx     # Technical pipeline documentation
│   │   ├── services/
│   │   │   └── api.js               # Axios backend API client
│   │   ├── store/
│   │   │   └── missionStore.js      # Reactive Zustand application state
│   │   ├── App.jsx                  # App shell, router, live health status
│   │   └── index.css                # Aerospace design system CSS
│   ├── vite.config.js               # Vite proxy to backend port 8000
│   └── package.json                 # Frontend dependencies
│
└── README.md                        # Documentation & SIH guide
```
