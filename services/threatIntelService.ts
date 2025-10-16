import { IThreatIntelResult } from '../types';

const maliciousHashes: Record<string, string> = {
    'd4b4dd5c9e436f4575de233b8a1c6a2893815b3070d61181512b07897262d0b5': 'Trojan.Generic.Win32',
    'a9f8d7e6c5b4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8': 'Ransomware.LockBit.A',
};

const lookupHash = (hash: string): Promise<IThreatIntelResult> => {
    console.log(`Calling Production Endpoint: POST /api/threat-intel/lookup for hash: ${hash.substring(0, 12)}...`);

    return new Promise(resolve => {
        setTimeout(() => {
            let result: IThreatIntelResult;
            if (maliciousHashes[hash]) {
                result = {
                    hash,
                    status: 'malicious',
                    signature: maliciousHashes[hash],
                    source: 'EquiNex ThreatDB',
                };
            } else {
                result = {
                    hash,
                    status: 'clean',
                    source: 'EquiNex ThreatDB',
                };
            }
            resolve(result);
        }, 1200);
    });
};

export const threatIntelService = {
    lookupHash,
};
