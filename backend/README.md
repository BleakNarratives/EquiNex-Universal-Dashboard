# EquiNex Backend API

FastAPI service backing every frontend service layer. All state is in-memory
(session-scoped): module status changes, file quarantines, and endpoint
isolations persist for the life of the process, then reset on restart.

## Run

```bash
cd ~/EquiNex-Universal-Dashboard
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt
.venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

Or from the backend dir: `../.venv/bin/uvicorn main:app --port 8000`

Interactive docs: http://localhost:8000/docs

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Liveness probe |
| GET | `/api/metrics` | Dashboard KPIs + module statuses |
| GET | `/api/logs` | System event log |
| GET | `/api/historical/{users\|revenue}` | 30-day series |
| POST | `/api/modules/status` | Set module status (operative action) |
| GET | `/api/security/logs` | Security audit feed |
| POST | `/api/osint/scan` | OSINT port/vuln scan |
| POST | `/api/threat-intel/lookup` | Hash reputation lookup |
| GET | `/api/files/status` | File integrity monitor |
| POST | `/api/files/quarantine` | Quarantine a tampered file |
| POST | `/api/devops/git-clone` | Simulate git clone |
| POST | `/api/devops/hf-pull` | Simulate Hugging Face space pull |
| GET | `/api/endpoints` | Endpoint inventory (EOL-aware risk) |
| POST | `/api/endpoints/isolate` | Isolate an endpoint |
| WS | `/ws/traffic` | Real-time traffic stream (500ms) |
| WS | `/ws/operative` | A.D.E.P.T. operative action stream (8s) |

## Windows 10 EOL directive (README Section 5)

`GET /api/endpoints` enriches every endpoint with a `risk` rating. Any endpoint
running Windows 10 (EOL 2025-10-14) is flagged `CRITICAL` with the reason
"Unpatchable vulnerability exposure". `POST /api/endpoints/isolate` flips the
endpoint to `Isolated` — the action A.D.E.P.T. takes on EOL exposure.

```bash
# Flag the EOL boxes
curl -s localhost:8000/api/endpoints | python3 -m json.tool

# Isolate one
curl -s -X POST localhost:8000/api/endpoints/isolate \
  -H 'Content-Type: application/json' -d '{"id":"pos-terminal-07"}'
```
