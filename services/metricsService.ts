import { IDashboardMetrics, ILogEntry, IHistoricalDataPoint, IModuleStatus } from '../types';
import { withFallback, postJson } from './api';

let mockModules: IModuleStatus[] = [
    { module_name: 'Biome Generation', status: 'Online', version: 'v2.1.8-terra' },
    { module_name: 'User Tracker', status: 'Online', version: 'v5.0.2-persona' },
    { module_name: 'Multimodal Nexus', status: 'Degraded', version: 'v1.9.3-cognito' },
    { module_name: 'Syntax AI Captcoder', status: 'Online', version: 'v3.14.1-goliath' }
];

const getMockData = (): IDashboardMetrics => ({
  overall_status: "HEALTHY",
  pattern_journal_summary: "No critical anomalies detected. Pattern recognition stable.",
  total_users: 42000,
  active_users_24h: 780,
  total_revenue: 100420.69,
  transactions_24h: 150,
  gpu_temp: 68 + Math.random() * 5, // Simulate GPU temp between 68-73°C
  frame_latency: 16.2 + (Math.random() - 0.5) * 2, // Simulate latency around 16ms
  modules: [...mockModules] // Return a copy to prevent direct mutation
});

const mockLogs: ILogEntry[] = [
    { level: 'INFO', message: 'System boot sequence initiated.', timestamp: '2024-07-29T10:00:00Z' },
    { level: 'INFO', message: 'User Tracker authenticated session for user #8921.', timestamp: '2024-07-29T10:00:15Z' },
    { level: 'INFO', message: 'Biome Generation created new instance: sector-gamma-9.', timestamp: '2024-07-29T10:01:03Z' },
    { level: 'WARN', message: 'Multimodal Nexus latency > 500ms for query.', timestamp: '2024-07-29T10:01:45Z' },
    { level: 'INFO', message: 'Syntax AI Captcoder compiled 1.2M lines of code.', timestamp: '2024-07-29T10:02:10Z' },
    { level: 'INFO', message: 'Pattern Journal archived anomaly cluster #42.', timestamp: '2024-07-29T10:03:00Z' },
    { level: 'ERROR', message: 'Failed to connect to Cognito-stream #1138. Retrying...', timestamp: '2024-07-29T10:03:30Z' },
    { level: 'INFO', message: 'Cognito-stream #1138 connection established.', timestamp: '2024-07-29T10:03:32Z' },
];

const getMockLogs = (): ILogEntry[] => [
    ...mockLogs,
    { level: 'INFO', message: 'Heartbeat check successful. All modules reporting.', timestamp: new Date().toISOString() }
];

const getMockHistorical = (metric: 'users' | 'revenue'): IHistoricalDataPoint[] => {
    const data: IHistoricalDataPoint[] = [];
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString();
        const value = metric === 'users'
            ? 42000 - i * 100 + Math.random() * 500
            : 100420 - i * 500 + Math.random() * 2000;
        data.push({ timestamp, value: Math.round(value) });
    }
    return data;
};

const getMetrics = (): Promise<IDashboardMetrics> => {
    return withFallback<IDashboardMetrics>(
        '/api/metrics',
        () => new Promise(resolve => setTimeout(() => resolve(getMockData()), 800)),
    );
};

const fetchSystemLogs = (): Promise<ILogEntry[]> => {
    return withFallback<ILogEntry[]>(
        '/api/logs',
        () => new Promise(resolve => setTimeout(() => resolve(getMockLogs()), 600)),
    );
};

const fetchHistoricalData = (metric: 'users' | 'revenue'): Promise<IHistoricalDataPoint[]> => {
    return withFallback<IHistoricalDataPoint[]>(
        `/api/historical/${metric}`,
        () => new Promise(resolve => setTimeout(() => resolve(getMockHistorical(metric)), 1200)),
    );
};

const setModuleStatus = async (moduleName: string, status: IModuleStatus['status']): Promise<void> => {
    try {
        await postJson<IModuleStatus>('/api/modules/status', { module_name: moduleName, status });
        return;
    } catch (err) {
        console.warn(`[equinex] backend unreachable for POST /api/modules/status — applying locally.`, err);
    }
    // Local fallback: mutate the mock so the operative action still takes effect
    const module = mockModules.find(m => m.module_name === moduleName);
    if (module) {
        module.status = status;
    } else {
        console.warn(`Attempted to set status for unknown module: ${moduleName}`);
    }
};

export const metricsService = {
    getMetrics,
    fetchSystemLogs,
    fetchHistoricalData,
    setModuleStatus,
};
