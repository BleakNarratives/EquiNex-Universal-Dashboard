import { IScanResult } from '../types';

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

const scanTarget = (target: string): Promise<IScanResult> => {
    console.log(`Calling Production Endpoint: POST /api/osint/scan for target: ${target}`);
    return new Promise(resolve => {
        setTimeout(() => {
            const key = target.toLowerCase();
            let result: IScanResult;
            
            if (mockScanResults[key]) {
                result = mockScanResults[key];
            } else if (key === '127.0.0.1') {
                result = mockScanResults['localhost'];
            }
            else {
                result = { 
                    target: target,
                    status: 'Offline',
                    ports: [],
                    vulnerabilities: [],
                };
            }
            
            resolve(result);
        }, 2500);
    });
};

export const osintService = {
    scanTarget,
};
