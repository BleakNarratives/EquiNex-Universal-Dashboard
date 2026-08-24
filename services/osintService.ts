import { IScanResult } from '../types';
import { postJson } from './api';

const mockScanResults: Record<string, IScanResult> = {
    'corp.equinex.io': {
        target: 'corp.equinex.io (203.0.113.84)',
        status: 'Online',
        ports: [
            { port: 22, service: 'SSH', status: 'Open' },
            { port: 80, service: 'HTTP', status: 'Filtered' },
            { port: 443, service: 'HTTPS', status: 'Open' },
            { port: 3306, service: 'MySQL', status: 'Closed' },
            { port: 3389, service: 'RDP', status: 'Closed' },
        ],
        vulnerabilities: [
            { cve: 'CVE-2024-3094', severity: 'Critical', summary: 'xz-utils backdoor detected (liblzma.so.5)' },
            { cve: 'CVE-2021-44228', severity: 'High', summary: 'Apache Log4j2 JNDI features do not protect against attacker controlled LDAP.' },
        ]
    },
    'localhost': {
        target: 'localhost (127.0.0.1)',
        status: 'Online',
        ports: [
            { port: 8080, service: 'dev-server', status: 'Open' },
        ],
        vulnerabilities: []
    }
};

const getMockScan = (target: string): IScanResult => {
    const key = target.toLowerCase();
    if (mockScanResults[key]) return mockScanResults[key];
    if (key === '127.0.0.1') return mockScanResults['localhost'];
    return {
        target,
        status: 'Offline',
        ports: [],
        vulnerabilities: [],
    };
};

const scanTarget = (target: string): Promise<IScanResult> => {
    return postJson<IScanResult>('/api/osint/scan', { target })
        .catch((err) => {
            console.warn(`[equinex] backend unreachable for POST /api/osint/scan — using local fallback.`, err);
            return new Promise<IScanResult>(resolve => setTimeout(() => resolve(getMockScan(target)), 2500));
        });
};

export const osintService = {
    scanTarget,
};
