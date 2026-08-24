import { ISecurityLogEntry } from '../types';
import { withFallback } from './api';

const securityEvents = [
    { level: 'AUDIT', event: 'Firewall rule #4812 updated: DENY traffic from ASN-CVI-21' },
    { level: 'AUDIT', event: 'User persona matrix validated for session #9812' },
    { level: 'WARN', event: 'Anomalous login pattern detected for user #4201' },
    { level: 'CRITICAL', event: 'Brute-force attempt detected and blocked on auth-module' },
    { level: 'AUDIT', event: 'Cognito-stream #1138 integrity check passed' },
    { level: 'WARN', event: 'High-frequency outbound traffic from pod-terra-gamma-7' },
    { level: 'CRITICAL', event: 'Potential data exfiltration pattern recognized. Isolating node.' },
    { level: 'AUDIT', event: 'Security patch v3.14.2 applied to Syntax AI Captcoder' },
    { level: 'CRITICAL', event: 'DDoS swarm detected. Rerouting traffic to sinkhole.' },
    { level: 'CRITICAL', event: 'File tampering detected: /bin/kernel_init. Hash mismatch.' },
    { level: 'AUDIT', event: 'File quarantined by operator: /etc/auth_module.so' },
] as const;

const generateRandomIp = (): string => {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

const getMockSecurityLogs = (): ISecurityLogEntry[] => {
    const now = new Date();
    const logs: ISecurityLogEntry[] = [];

    for (let i = 0; i < 8; i++) {
        const eventTemplate = securityEvents[i % securityEvents.length];
        logs.push({
            ...eventTemplate,
            timestamp: new Date(now.getTime() - (30 - i) * 1000 * Math.random() * 5).toISOString(),
            source_ip: generateRandomIp(),
        });
    }

    const newEvent = securityEvents[Math.floor(Math.random() * securityEvents.length)];
    logs.push({
        ...newEvent,
        timestamp: now.toISOString(),
        source_ip: generateRandomIp(),
    });

    logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return logs;
};

const fetchSecurityLogs = (): Promise<ISecurityLogEntry[]> => {
    return withFallback<ISecurityLogEntry[]>(
        '/api/security/logs',
        () => new Promise(resolve => setTimeout(() => resolve(getMockSecurityLogs()), 750)),
    );
};

export const securityService = {
    fetchSecurityLogs,
};
