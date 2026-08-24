import { IThreatIntelResult } from '../types';
import { postJson } from './api';

const maliciousHashes: Record<string, string> = {
    'd4b4dd5c9e436f4575de233b8a1c6a2893815b3070d61181512b07897262d0b5': 'Trojan.Generic.Win32',
    'a9f8d7e6c5b4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8': 'Ransomware.LockBit.A',
};

const getMockLookup = (hash: string): IThreatIntelResult => {
    if (maliciousHashes[hash]) {
        return {
            hash,
            status: 'malicious',
            signature: maliciousHashes[hash],
            source: 'EquiNex ThreatDB',
        };
    }
    return { hash, status: 'clean', source: 'EquiNex ThreatDB' };
};

const lookupHash = (hash: string): Promise<IThreatIntelResult> => {
    return postJson<IThreatIntelResult>('/api/threat-intel/lookup', { hash })
        .catch((err) => {
            console.warn(`[equinex] backend unreachable for POST /api/threat-intel/lookup — using local fallback.`, err);
            return new Promise<IThreatIntelResult>(resolve => setTimeout(() => resolve(getMockLookup(hash)), 1200));
        });
};

export const threatIntelService = {
    lookupHash,
};
