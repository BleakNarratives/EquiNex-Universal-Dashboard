// System & Metrics
export interface IModuleStatus {
  module_name: string;
  status: 'Online' | 'Offline' | 'Degraded' | 'Isolated';
  version: string;
}

export interface IDashboardMetrics {
  overall_status: 'HEALTHY' | 'DEGRADED' | 'ERROR';
  pattern_journal_summary: string;
  total_users: number;
  active_users_24h: number;
  total_revenue: number;
  transactions_24h: number;
  gpu_temp: number;
  frame_latency: number;
  modules: IModuleStatus[];
}

export interface ILogEntry {
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  timestamp: string;
}

export interface IHistoricalDataPoint {
  timestamp: string;
  value: number;
}

// Settings & Theme
export interface UserProfile {
    persona: Persona;
    themeName: string;
}

export interface Settings {
    activeProvider: 'Gemini'; // Can be extended later
    pollingInterval: number;
    animationsEnabled: boolean;
}

export interface Theme {
    name: string;
    displayName: string;
    properties: Record<string, string>;
}

export type Persona = 'default' | 'engineer' | 'support' | 'analyst' | 'operator';

// Security & OSINT
export interface IScanResult {
    target: string;
    status: 'Online' | 'Offline';
    ports: { port: number; service: string; status: 'Open' | 'Closed' | 'Filtered' }[];
    vulnerabilities: { cve: string; severity: 'Critical' | 'High' | 'Medium' | 'Low'; summary: string }[];
}

export interface ISecurityLogEntry {
    level: 'AUDIT' | 'WARN' | 'CRITICAL';
    event: string;
    timestamp: string;
    source_ip: string;
}

export interface ITrafficData {
    timestamp: number;
    totalPackets: number;
    cleanPackets: number;
    maliciousPackets: number;
    isUnderAttack: boolean;
}

export type FileStatus = 'VERIFIED' | 'TAMPERED' | 'QUARANTINED';

export interface IFileIntegrityStatus {
    filePath: string;
    hash: string;
    status: FileStatus;
}

export interface IThreatIntelResult {
    hash:string;
    status: 'clean' | 'malicious';
    signature?: string;
    source: string;
}

// DevOps Service
export interface IDevOpsResult {
    success: boolean;
    message: string;
    details?: string;
}


// Autonomous Operative
export interface OperativeAction {
    id: number;
    timestamp: string;
    action: string;
    reasoning: string;
    status: 'EXECUTING' | 'COMPLETED' | 'FAILED';
}

// Global Alert
export interface GlobalAlertState {
    id: number;
    level: 'CRITICAL' | 'WARN';
    message: string;
}
