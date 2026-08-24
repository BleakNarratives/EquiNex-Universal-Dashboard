# EquiNex Universal Dashboard

**Real-time AI-powered system monitoring, security analysis, and autonomous operations.**

A React 19 dashboard with a FastAPI backend. Live metrics, AI assistant, file integrity monitoring, traffic analysis, OSINT scanning, and an autonomous AI operative (A.D.E.P.T.) — all in one interface.

---

## Demo

```bash
# Install
npm install
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt

# Run (two terminals)
.venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000  # Terminal A
npm run dev                                                      # Terminal B

# Open http://localhost:3000
```

Optional: Add `GEMINI_API_KEY` to `.env` for the live AI assistant.

---

## Features

| Feature | What it does |
|---------|--------------|
| **Dashboard Metrics** | Real-time KPIs — users, revenue, module status, system health |
| **AI Assistant** | Gemini-powered chat interface with conversation history |
| **A.D.E.P.T. Operative** | Autonomous AI agent — preemptive defensive actions |
| **Traffic Analysis** | Live network monitoring, DDoS detection, protocol breakdown |
| **File Integrity Monitor** | Hash tracking, tamper detection, file quarantine |
| **Security Audit Log** | Security event feed with severity levels |
| **OSINT Scanner** | Port scanning, vulnerability detection, threat intel |
| **Module Status** | Live status of all system modules (Online/Offline/Degraded) |
| **Dynamic Theming** | 5 AI personas — Aura, Cygnus, Orion, Vela, Scorpius |
| **Voice Interface** | Real-time voice commands (WebSocket) |
| **Terminal** | NLP-powered command line with system access |

---

## Architecture

```
┌─────────────────────────────────────────┐
│  React 19 Frontend (Vite)              │
│  TypeScript · Lucide Icons             │
│  Dynamic CSS Theming · WebSocket       │
└──────────────┬──────────────────────────┘
               │ /api + /ws proxy
               ▼
┌─────────────────────────────────────────┐
│  FastAPI Backend (Python)              │
│  In-memory state · WebSocket streams   │
│  15 REST endpoints + 2 WebSocket feeds │
└──────────────────┬──────────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
   ┌───────────┐      ┌───────────┐
   │ Gemini AI │      │ OSINT/     │
   │ Assistant │      │ Threat Intel│
   └───────────┘      └───────────┘
```

---

## API Endpoints

| Method | Endpoint | What |
|--------|----------|------|
| GET | `/api/health` | Liveness probe |
| GET | `/api/metrics` | Dashboard KPIs + module statuses |
| GET | `/api/logs` | System event log |
| GET | `/api/historical/{metric}` | 30-day time series |
| POST | `/api/modules/status` | Update module status |
| GET | `/api/security/logs` | Security audit feed |
| POST | `/api/osint/scan` | Port/vulnerability scan |
| POST | `/api/threat-intel/lookup` | Hash reputation lookup |
| GET | `/api/files/status` | File integrity status |
| POST | `/api/files/quarantine` | Quarantine tampered file |
| POST | `/api/devops/git-clone` | Simulate git clone |
| POST | `/api/devops/hf-pull` | Simulate HF space pull |
| GET | `/api/endpoints` | Endpoint inventory |
| POST | `/api/endpoints/isolate` | Isolate an endpoint |
| WS | `/ws/traffic` | Real-time traffic stream |
| WS | `/ws/operative` | A.D.E.P.T. action stream |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite, Lucide Icons |
| Styling | Global CSS variables, dynamic theming (no Tailwind) |
| Backend | Python 3.10+, FastAPI, Pydantic |
| AI | Google Gemini (`@google/genai`) |
| Real-time | WebSocket (traffic + operative streams) |
| Data | In-memory (session-scoped, resets on restart) |

---

## Project Structure

```
EquiNex-Universal-Dashboard/
├── App.tsx                    Root component
├── index.tsx                  Entry point
├── components/
│   ├── Dashboard.tsx          Main dashboard layout
│   ├── AIAssistant.tsx        Gemini-powered chat
│   ├── AutonomousOperative.tsx A.D.E.P.T. agent
│   ├── TrafficAnalysis.tsx    Network monitoring
│   ├── FileIntegrityMonitor.tsx File hash tracking
│   ├── SecurityAuditLog.tsx   Security events
│   ├── SystemHealth.tsx       System health view
│   ├── ModuleStatusTable.tsx  Module status grid
│   ├── Header.tsx             Top bar + persona selector
│   └── ...                    15+ components
├── services/
│   ├── api.ts                 Backend API client
│   ├── aiService.ts           Gemini AI integration
│   ├── metricsService.ts      Metrics fetching
│   ├── securityService.ts     Security data
│   └── ...                    8 service layers
├── contexts/
│   ├── AppContext.tsx          Global state
│   └── ThemeContext.tsx        Persona theming
├── backend/
│   ├── main.py                FastAPI app (563 lines)
│   ├── requirements.txt       Python deps
│   └── README.md              Backend docs
├── .env.example               Configuration
├── package.json               Node deps
└── vite.config.ts             Build config
```

---

## Configuration

Only one key is needed:

| Key | Purpose | Required |
|-----|---------|----------|
| `GEMINI_API_KEY` | AI assistant chat | No (app works without it) |

```bash
cp .env.example .env
# Add your Gemini key (optional)
```

---

## Persona Themes

| Persona | Accent | Personality |
|---------|--------|-------------|
| **Aura** | Cyan | Calm, analytical, precise |
| **Cygnus** | Purple | Creative, exploratory, visionary |
| **Orion** | Gold | Commanding, strategic, bold |
| **Vela** | Teal | Efficient, methodical, reliable |
| **Scorpius** | Red | Aggressive, defensive, vigilant |

---

## License

MIT — Built by Mike / BleakNarratives
