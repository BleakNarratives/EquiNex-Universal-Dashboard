# EquiNex Universal Dashboard

Welcome, operative. This is the central command interface for the EquiNex platform, a high-performance, AI-driven dashboard designed for real-time system monitoring, security analysis, and autonomous operations.

This document serves as a comprehensive guide for developers integrating and deploying this frontend.

## Running End to End

The dashboard now ships with a live FastAPI backend. Every service layer calls
real endpoints through a Vite dev proxy (`/api` and `/ws` → port 8000), with
graceful fallback to local mock data when the backend is down.

```bash
# 1. Frontend deps
cd ~/EquiNex-Universal-Dashboard && npm install

# 2. Backend (FastAPI)
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt

# 3. Terminal A: backend on :8000
.venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000

# 4. Terminal B: frontend on :3000
npm run dev
# open http://localhost:3000
```

Optional: set `GEMINI_API_KEY` (or a `.env` with `GEMINI_API_KEY=...`) to power
the live AI assistant; without it the app still runs fully on the backend.

See `backend/README.md` for the full API surface and the Windows 10 EOL
isolation directive.

## Section 1: Features

-   **Dynamic Theming**: UI aesthetic shifts based on the selected AI Persona (`Aura`, `Cygnus`, `Orion`, `Vela`, `Scorpius`).
-   **Real-time Metrics**: At-a-glance dashboard with key performance indicators.
-   **Autonomous AI Operative (A.D.E.P.T.)**: A simulated AI agent that performs preemptive defensive actions based on system telemetry.
-   **Live Voice Interface**: Real-time, low-latency voice command and conversation with an AI core.
-   **Interactive Terminal**: A `Termux`-style command-line interface with NLP capabilities for advanced operations.
-   **Advanced Security Modules**:
    -   **Traffic Analysis**: Simulates real-time network monitoring and DDoS mitigation.
    -   **File Integrity Monitor**: Tracks critical file hashes and alerts on tampering.
    -   **Security Audit Log**: A dedicated feed for security-related events.
-   **Cross-Platform Profile Transfer**: Export and import your entire user configuration (persona, theme) as a JSON file.

## Section 2: Tech Stack

-   **Framework**: React 19
-   **Language**: TypeScript
-   **AI Integration**: Google Gemini API (`@google/genai`)
-   **Styling**: Global CSS variables with dynamic theming. No CSS-in-JS libraries or Tailwind for maximum performance and portability.
-   **Icons**: Lucide React

## Section 3: Termux Terminal Commands

The terminal provides direct access to advanced system functions.

-   `help`: Lists all available commands.
-   `scan <target_ip_or_domain>`: Initiates a simulated OSINT network scan on the specified target.
-   `lookup <sha256_hash>`: Queries the Threat Intelligence database for a known malicious file hash.
-   `git clone <repo_url>`: Simulates cloning a repository from a git provider.
-   `hf pull <space_id>`: Simulates pulling an AI model or space from Hugging Face.
-   `clear`: Clears the terminal history.
-   **Natural Language**: You can also type commands in plain English (e.g., "scan the corporate server").

## Section 4: Python FastAPI Backend Integration

This frontend is designed to be backend-agnostic but is optimized for a Python FastAPI environment. The following provides a clear guide to wiring up the mock services to live endpoints.

**Pydantic Models (Example)**

```python
# models.py
from pydantic import BaseModel, Field
from typing import List, Literal

class ModuleStatus(BaseModel):
    module_name: str
    status: Literal['Online', 'Offline', 'Degraded', 'Isolated']
    version: str

class DashboardMetrics(BaseModel):
    overall_status: Literal['HEALTHY', 'DEGRADED', 'ERROR']
    pattern_journal_summary: str
    total_users: int
    active_users_24h: int
    total_revenue: float
    transactions_24h: int
    modules: List[ModuleStatus]
    gpu_temp: float = Field(..., alias="gpuTemp")
    frame_latency: float = Field(..., alias="frameLatency")

```

**FastAPI Endpoints (Example)**

```python
# main.py
from fastapi import FastAPI
from .models import DashboardMetrics
# ... import your data sources

app = FastAPI()

@app.get("/api/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics():
    # Replace with your actual data fetching logic
    metrics_data = await your_data_source.get_all_metrics()
    return metrics_data

@app.post("/api/osint/scan")
async def scan_target(target: str):
    scan_result = await your_osint_tool.run_scan(target)
    return scan_result

# Use WebSockets for real-time services like TrafficAnalysis
from fastapi import WebSocket

@app.websocket("/ws/traffic")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Stream your real-time traffic data
            data = await your_traffic_monitor.get_latest_data()
            await websocket.send_json(data.dict())
            await asyncio.sleep(0.5) # 500ms interval
    except WebSocketDisconnect:
        print("Client disconnected")

```

## Section 5: Security Directives & OS Lifecycle Management

The A.D.E.P.T. operative's logic should be augmented with a strategic threat model that accounts for external, non-code vulnerabilities.

**Windows 10 End-of-Life (EOL) Directive:**

-   **Endpoint Inventory**: The backend must provide an endpoint inventory API (`/api/endpoints`) that lists all connected devices, their OS, and patch level.
-   **Threat Prioritization**: The frontend `operativeService` should be modified to consume this data. Any endpoint running Windows 10 post-EOL (October 14, 2025) must be flagged as a `CRITICAL` vulnerability.
-   **A.D.E.P.T. Response**: Upon detecting a vulnerable EOL endpoint, A.D.E.P.T. should autonomously execute a "Network Isolation" action (`POST /api/endpoints/isolate`). The reasoning should clearly state: "Proactive isolation of EOL Windows 10 endpoint to mitigate unpatchable vulnerability exposure."

## Section 6: Testing & Quality Assurance

To ensure the stability and reliability of the dashboard, a suite of unit tests should be implemented and maintained. The tests outlined in `/tests/README.md` serve as the foundational blueprint for this effort.

-   **Framework**: Jest & React Testing Library are recommended.
-   **CI/CD Pipeline**: Integrate test execution into your CI/CD pipeline (e.g., GitHub Actions) to automatically run tests on every commit, preventing regressions from being merged into the main branch.

## Section 7: Cross-Platform Profile Transfer

The dashboard supports user profile portability.

-   **Export**: In the Settings modal, the "Export Profile" button will save a JSON file (`equinex_profile.json`) containing the user's current persona and theme settings.
-   **Import**: The "Import Profile" button allows the user to upload a previously exported profile, instantly applying the saved settings to the current session. This is ideal for maintaining a consistent user experience across different devices or browsers.
