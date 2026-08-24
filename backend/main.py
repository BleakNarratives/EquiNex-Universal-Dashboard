"""
EquiNex Universal Dashboard — Backend API
=========================================
FastAPI service backing every frontend service layer. All state is in-memory
(session-scoped), mirroring the mock semantics the frontend was built against:
module status changes, file quarantines, and endpoint isolations persist for
the life of the process, then reset on restart.

Endpoints
---------
GET    /api/health                     — liveness probe
GET    /api/metrics                    — dashboard KPIs + module statuses
GET    /api/logs                       — system event log
GET    /api/historical/{metric}        — 30-day series for 'users' | 'revenue'
POST   /api/modules/status             — operative action: set module status
GET    /api/security/logs              — security audit feed
POST   /api/osint/scan                 — OSINT port/vuln scan
POST   /api/threat-intel/lookup        — hash reputation lookup
GET    /api/files/status               — file integrity monitor
POST   /api/files/quarantine           — quarantine a tampered file
POST   /api/devops/git-clone           — simulate git clone
POST   /api/devops/hf-pull             — simulate Hugging Face space pull
GET    /api/endpoints                  — endpoint inventory (EOL-aware)
POST   /api/endpoints/isolate          — isolate an endpoint
WS     /ws/traffic                     — real-time traffic stream (500ms)
WS     /ws/operative                   — A.D.E.P.T. operative action stream

Run:
    cd backend && ../.venv/bin/uvicorn main:app --port 8000
"""

from __future__ import annotations

import asyncio
import json
import random
import time
from typing import List, Literal, Optional

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Pydantic models (mirror frontend types.ts)
# ---------------------------------------------------------------------------

ModuleStatus = Literal["Online", "Offline", "Degraded", "Isolated"]


class ModuleStatusModel(BaseModel):
    module_name: str
    status: ModuleStatus
    version: str


class DashboardMetrics(BaseModel):
    overall_status: Literal["HEALTHY", "DEGRADED", "ERROR"]
    pattern_journal_summary: str
    total_users: int
    active_users_24h: int
    total_revenue: float
    transactions_24h: int
    gpu_temp: float = Field(..., alias="gpuTemp")
    frame_latency: float = Field(..., alias="frameLatency")
    modules: List[ModuleStatusModel]

    model_config = {"populate_by_name": True}


class LogEntry(BaseModel):
    level: Literal["INFO", "WARN", "ERROR"]
    message: str
    timestamp: str


class HistoricalDataPoint(BaseModel):
    timestamp: str
    value: int


class SetModuleStatusRequest(BaseModel):
    module_name: str
    status: ModuleStatus


class SecurityLogEntry(BaseModel):
    level: Literal["AUDIT", "WARN", "CRITICAL"]
    event: str
    timestamp: str
    source_ip: str


class PortInfo(BaseModel):
    port: int
    service: str
    status: Literal["Open", "Closed", "Filtered"]


class Vulnerability(BaseModel):
    cve: str
    severity: Literal["Critical", "High", "Medium", "Low"]
    summary: str


class ScanResult(BaseModel):
    target: str
    status: Literal["Online", "Offline"]
    ports: List[PortInfo]
    vulnerabilities: List[Vulnerability]


class ThreatIntelResult(BaseModel):
    hash: str
    status: Literal["clean", "malicious"]
    signature: Optional[str] = None
    source: str


class FileIntegrityStatus(BaseModel):
    filePath: str
    hash: str
    status: Literal["VERIFIED", "TAMPERED", "QUARANTINED"]


class DevOpsResult(BaseModel):
    success: bool
    message: str
    details: Optional[str] = None


class Endpoint(BaseModel):
    id: str
    hostname: str
    os: str
    patch_level: str
    status: Literal["Online", "Offline", "Isolated"]
    risk: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    risk_reason: Optional[str] = None


class IsolateRequest(BaseModel):
    id: str


class OperativeAction(BaseModel):
    id: int
    timestamp: str
    action: str
    reasoning: str
    status: Literal["EXECUTING", "COMPLETED", "FAILED"]


# ---------------------------------------------------------------------------
# In-memory state
# ---------------------------------------------------------------------------

app = FastAPI(title="EquiNex Universal Dashboard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODULES: List[dict] = [
    {"module_name": "Biome Generation", "status": "Online", "version": "v2.1.8-terra"},
    {"module_name": "User Tracker", "status": "Online", "version": "v5.0.2-persona"},
    {"module_name": "Multimodal Nexus", "status": "Degraded", "version": "v1.9.3-cognito"},
    {"module_name": "Syntax AI Captcoder", "status": "Online", "version": "v3.14.1-goliath"},
]

BASE_LOGS: List[dict] = [
    {"level": "INFO", "message": "System boot sequence initiated.", "timestamp": "2024-07-29T10:00:00Z"},
    {"level": "INFO", "message": "User Tracker authenticated session for user #8921.", "timestamp": "2024-07-29T10:00:15Z"},
    {"level": "INFO", "message": "Biome Generation created new instance: sector-gamma-9.", "timestamp": "2024-07-29T10:01:03Z"},
    {"level": "WARN", "message": "Multimodal Nexus latency > 500ms for query.", "timestamp": "2024-07-29T10:01:45Z"},
    {"level": "INFO", "message": "Syntax AI Captcoder compiled 1.2M lines of code.", "timestamp": "2024-07-29T10:02:10Z"},
    {"level": "INFO", "message": "Pattern Journal archived anomaly cluster #42.", "timestamp": "2024-07-29T10:03:00Z"},
    {"level": "ERROR", "message": "Failed to connect to Cognito-stream #1138. Retrying...", "timestamp": "2024-07-29T10:03:30Z"},
    {"level": "INFO", "message": "Cognito-stream #1138 connection established.", "timestamp": "2024-07-29T10:03:32Z"},
]

SECURITY_EVENTS = [
    {"level": "AUDIT", "event": "Firewall rule #4812 updated: DENY traffic from ASN-CVI-21"},
    {"level": "AUDIT", "event": "User persona matrix validated for session #9812"},
    {"level": "WARN", "event": "Anomalous login pattern detected for user #4201"},
    {"level": "CRITICAL", "event": "Brute-force attempt detected and blocked on auth-module"},
    {"level": "AUDIT", "event": "Cognito-stream #1138 integrity check passed"},
    {"level": "WARN", "event": "High-frequency outbound traffic from pod-terra-gamma-7"},
    {"level": "CRITICAL", "event": "Potential data exfiltration pattern recognized. Isolating node."},
    {"level": "AUDIT", "event": "Security patch v3.14.2 applied to Syntax AI Captcoder"},
    {"level": "CRITICAL", "event": "DDoS swarm detected. Rerouting traffic to sinkhole."},
    {"level": "CRITICAL", "event": "File tampering detected: /bin/kernel_init. Hash mismatch."},
    {"level": "AUDIT", "event": "File quarantined by operator: /etc/auth_module.so"},
]

# Canonical hashes for the integrity monitor. Content strings are hashed on
# boot; tampering rotates the hash in place, mirroring the frontend mock.
FILE_REGISTRY: List[dict] = [
    {"filePath": "/bin/kernel_init", "content": "bootstraps the core OS modules", "status": "VERIFIED"},
    {"filePath": "/etc/auth_module.so", "content": "handles user authentication and session management", "status": "VERIFIED"},
    {"filePath": "/lib/persona_matrix.dll", "content": "core library for AI persona management", "status": "VERIFIED"},
    {"filePath": "/var/log/pattern_journal.db", "content": "database for anomaly detection patterns", "status": "VERIFIED"},
    {"filePath": "/sys/nexus_firewall.conf", "content": "configuration for the multimodal nexus firewall", "status": "VERIFIED"},
]

MALICIOUS_HASHES = {
    "d4b4dd5c9e436f4575de233b8a1c6a2893815b3070d61181512b07897262d0b5": "Trojan.Generic.Win32",
    "a9f8d7e6c5b4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8": "Ransomware.LockBit.A",
}

# Windows 10 reached EOL 2025-10-14. Anything still on it is CRITICAL.
WINDOWS_10_EOL = "2025-10-14"

ENDPOINTS: List[dict] = [
    {"id": "endpoint-001", "hostname": "hr-files-01", "os": "Windows 11 Pro", "patch_level": "23H2 KB5044284", "status": "Online"},
    {"id": "endpoint-002", "hostname": "pos-terminal-07", "os": "Windows 10 Pro", "patch_level": "22H2 KB5027397", "status": "Online"},
    {"id": "endpoint-003", "hostname": "syntax-core-01", "os": "Ubuntu 24.04 LTS", "patch_level": "kernel 6.8.0-45", "status": "Online"},
    {"id": "endpoint-004", "hostname": "warehouse-scanner-3", "os": "Windows 10 IoT", "patch_level": "21H2 EOL", "status": "Online"},
    {"id": "endpoint-005", "hostname": "vault-archive-02", "os": "Debian 12", "patch_level": "kernel 6.1.0", "status": "Online"},
]


def _random_ip() -> str:
    return ".".join(str(random.randint(0, 255)) for _ in range(4))


def _hash_content(content: str) -> str:
    """Deterministic stand-in for SHA-256 (stable per content string)."""
    import hashlib
    return hashlib.sha256(content.encode()).hexdigest()


def _risk_for(endpoint: dict) -> tuple[str, Optional[str]]:
    if endpoint["status"] == "Isolated":
        return "CRITICAL", "Isolated by A.D.E.P.T. — no traffic permitted."
    os_name = endpoint["os"]
    if "Windows 10" in os_name:
        return "CRITICAL", (
            f"Windows 10 reached end-of-life {WINDOWS_10_EOL}. Unpatchable "
            "vulnerability exposure; no security updates available."
        )
    if "Windows 11" in os_name:
        return "MEDIUM", "Windows 11 receiving updates; monitor patch cadence."
    return "LOW", None


def _enriched_endpoints() -> List[dict]:
    out = []
    for ep in ENDPOINTS:
        risk, reason = _risk_for(ep)
        out.append({**ep, "risk": risk, "risk_reason": reason})
    return out


# ---------------------------------------------------------------------------
# Metrics & system logs
# ---------------------------------------------------------------------------

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "equinex-dashboard-api", "time": time.time()}


@app.get("/api/metrics", response_model=DashboardMetrics)
async def get_metrics():
    degraded = any(m["status"] == "Degraded" for m in MODULES)
    isolated = any(m["status"] == "Isolated" for m in MODULES)
    overall = "DEGRADED" if (degraded or isolated) else "HEALTHY"
    return {
        "overall_status": overall,
        "pattern_journal_summary": (
            "No critical anomalies detected. Pattern recognition stable."
            if overall == "HEALTHY"
            else "Degraded module detected. A.D.E.P.T. operative engaged."
        ),
        "total_users": 42000,
        "active_users_24h": 780,
        "total_revenue": 100420.69,
        "transactions_24h": 150,
        "gpuTemp": round(68 + random.random() * 5, 2),
        "frameLatency": round(16.2 + (random.random() - 0.5) * 2, 2),
        "modules": [dict(m) for m in MODULES],
    }


@app.get("/api/logs", response_model=List[LogEntry])
async def get_logs():
    heartbeat = {
        "level": "INFO",
        "message": "Heartbeat check successful. All modules reporting.",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    return [*BASE_LOGS, heartbeat]


@app.get("/api/historical/{metric}", response_model=List[HistoricalDataPoint])
async def get_historical(metric: str):
    if metric not in ("users", "revenue"):
        raise HTTPException(status_code=400, detail="metric must be 'users' or 'revenue'")
    data = []
    now = time.time()
    for i in range(30, -1, -1):
        ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now - i * 86400))
        if metric == "users":
            value = int(42000 - i * 100 + random.random() * 500)
        else:
            value = int(100420 - i * 500 + random.random() * 2000)
        data.append({"timestamp": ts, "value": value})
    return data


@app.post("/api/modules/status", response_model=ModuleStatusModel)
async def set_module_status(req: SetModuleStatusRequest):
    for mod in MODULES:
        if mod["module_name"] == req.module_name:
            mod["status"] = req.status
            return dict(mod)
    raise HTTPException(status_code=404, detail=f"Unknown module: {req.module_name}")


# ---------------------------------------------------------------------------
# Security
# ---------------------------------------------------------------------------

@app.get("/api/security/logs", response_model=List[SecurityLogEntry])
async def get_security_logs():
    now = time.time()
    logs = []
    for i in range(9):
        ev = random.choice(SECURITY_EVENTS)
        logs.append({
            **ev,
            "timestamp": time.strftime(
                "%Y-%m-%dT%H:%M:%SZ", time.gmtime(now - random.random() * 150)
            ),
            "source_ip": _random_ip(),
        })
    logs.sort(key=lambda l: l["timestamp"])
    return logs


# ---------------------------------------------------------------------------
# OSINT / threat intel / devops
# ---------------------------------------------------------------------------

OSINT_DB = {
    "corp.equinex.io": {
        "target": "corp.equinex.io (203.0.113.84)",
        "status": "Online",
        "ports": [
            {"port": 22, "service": "SSH", "status": "Open"},
            {"port": 80, "service": "HTTP", "status": "Filtered"},
            {"port": 443, "service": "HTTPS", "status": "Open"},
            {"port": 3306, "service": "MySQL", "status": "Closed"},
            {"port": 3389, "service": "RDP", "status": "Closed"},
        ],
        "vulnerabilities": [
            {"cve": "CVE-2024-3094", "severity": "Critical",
             "summary": "xz-utils backdoor detected (liblzma.so.5)"},
            {"cve": "CVE-2021-44228", "severity": "High",
             "summary": "Apache Log4j2 JNDI features do not protect against attacker controlled LDAP."},
        ],
    },
    "localhost": {
        "target": "localhost (127.0.0.1)",
        "status": "Online",
        "ports": [{"port": 8080, "service": "dev-server", "status": "Open"}],
        "vulnerabilities": [],
    },
    "127.0.0.1": {
        "target": "localhost (127.0.0.1)",
        "status": "Online",
        "ports": [{"port": 8080, "service": "dev-server", "status": "Open"}],
        "vulnerabilities": [],
    },
}


@app.post("/api/osint/scan", response_model=ScanResult)
async def osint_scan(req: dict):
    target = str(req.get("target", "")).lower()
    if not target:
        raise HTTPException(status_code=400, detail="target is required")
    if target in OSINT_DB:
        return OSINT_DB[target]
    return {
        "target": target,
        "status": "Offline",
        "ports": [],
        "vulnerabilities": [],
    }


@app.post("/api/threat-intel/lookup", response_model=ThreatIntelResult)
async def threat_intel_lookup(req: dict):
    h = str(req.get("hash", "")).lower()
    if not h:
        raise HTTPException(status_code=400, detail="hash is required")
    if h in MALICIOUS_HASHES:
        return {"hash": h, "status": "malicious", "signature": MALICIOUS_HASHES[h], "source": "EquiNex ThreatDB"}
    return {"hash": h, "status": "clean", "source": "EquiNex ThreatDB"}


@app.post("/api/devops/git-clone", response_model=DevOpsResult)
async def devops_git_clone(req: dict):
    url = str(req.get("url", ""))
    if not url or "github.com" not in url:
        return {"success": False, "message": "Invalid repository URL provided."}
    repo_name = url.rstrip("/").split("/")[-1].replace(".git", "")
    return {
        "success": True,
        "message": f"Successfully cloned repository '{repo_name}'.",
        "details": "Checked out 'main' branch. Total objects: 1.2M, compressed: 450MB.",
    }


@app.post("/api/devops/hf-pull", response_model=DevOpsResult)
async def devops_hf_pull(req: dict):
    space_id = str(req.get("space_id", ""))
    if not space_id or "/" not in space_id:
        return {
            "success": False,
            "message": "Invalid Hugging Face space ID. Expected format: user/space-name",
        }
    return {
        "success": True,
        "message": f"Successfully pulled space '{space_id}'.",
        "details": "Model files and application code synced to local cache. Ready for integration.",
    }


# ---------------------------------------------------------------------------
# File integrity monitor
# ---------------------------------------------------------------------------

def _file_payload(f: dict) -> dict:
    return {"filePath": f["filePath"], "hash": _hash_content(f["content"]), "status": f["status"]}


@app.get("/api/files/status", response_model=List[FileIntegrityStatus])
async def files_status():
    return [_file_payload(f) for f in FILE_REGISTRY]


@app.post("/api/files/quarantine", response_model=FileIntegrityStatus)
async def files_quarantine(req: dict):
    path = str(req.get("filePath", ""))
    for f in FILE_REGISTRY:
        if f["filePath"] == path:
            f["status"] = "QUARANTINED"
            return _file_payload(f)
    raise HTTPException(status_code=404, detail=f"Unknown file: {path}")


# ---------------------------------------------------------------------------
# Endpoint inventory + Windows 10 EOL isolation (README Section 5)
# ---------------------------------------------------------------------------

@app.get("/api/endpoints", response_model=List[Endpoint])
async def get_endpoints():
    return _enriched_endpoints()


@app.post("/api/endpoints/isolate", response_model=Endpoint)
async def isolate_endpoint(req: IsolateRequest):
    for ep in ENDPOINTS:
        if ep["id"] == req.id:
            ep["status"] = "Isolated"
            risk, reason = _risk_for(ep)
            return {**ep, "risk": risk, "risk_reason": reason}
    raise HTTPException(status_code=404, detail=f"Unknown endpoint: {req.id}")


# ---------------------------------------------------------------------------
# WebSockets — traffic stream + operative stream
# ---------------------------------------------------------------------------

async def _traffic_frame() -> dict:
    """One traffic datapoint; mirrors the frontend mock's attack simulation."""
    global _attack_cooldown, _under_attack, _last_total_packets

    if _attack_cooldown > 0:
        _attack_cooldown -= 1
        if _attack_cooldown == 0:
            _under_attack = False
    elif not _under_attack and random.random() < 0.05:
        _under_attack = True
        _attack_cooldown = 20

    if _under_attack:
        total = 50000 + random.random() * 25000
        malicious = total * (0.8 + random.random() * 0.15)
    else:
        change = (random.random() - 0.5) * 1000
        total = max(2000, _last_total_packets + change)
        malicious = total * (0.01 + random.random() * 0.04)

    _last_total_packets = total
    return {
        "timestamp": int(time.time() * 1000),
        "totalPackets": round(total),
        "cleanPackets": round(total - malicious),
        "maliciousPackets": round(malicious),
        "isUnderAttack": _under_attack,
    }


_attack_cooldown = 0
_under_attack = False
_last_total_packets = 5000.0


@app.websocket("/ws/traffic")
async def ws_traffic(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_json(await _traffic_frame())
            await asyncio.sleep(0.5)
    except WebSocketDisconnect:
        pass


@app.websocket("/ws/operative")
async def ws_operative(websocket: WebSocket):
    """A.D.E.P.T. operative stream — emits an action every ~8s."""
    await websocket.accept()
    action_id = 0
    try:
        while True:
            action_id += 1
            degraded = [m["module_name"] for m in MODULES if m["status"] == "Degraded"]
            if degraded:
                target = degraded[0]
                action = {
                    "id": action_id,
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "action": f"Reallocating resources to stabilize {target}.",
                    "reasoning": f"Telemetry indicates performance degradation in {target}. Taking corrective action.",
                    "status": "COMPLETED",
                }
            else:
                action = {
                    "id": action_id,
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "action": "Verifying module checksums.",
                    "reasoning": "Routine integrity check against known signatures.",
                    "status": "COMPLETED",
                }
            await websocket.send_json(action)
            await asyncio.sleep(8)
    except WebSocketDisconnect:
        pass


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
