import { IFileIntegrityStatus, FileStatus } from '../types';
import { calculateSHA256 } from '../utils/crypto';

// This mock data would be replaced by a live backend service (e.g., AIDE, Wazuh)
const mockFileSystem: Record<string, string> = {
  '/bin/kernel_init': 'bootstraps the core OS modules',
  '/etc/auth_module.so': 'handles user authentication and session management',
  '/lib/persona_matrix.dll': 'core library for AI persona management',
  '/var/log/pattern_journal.db': 'database for anomaly detection patterns',
  '/sys/nexus_firewall.conf': 'configuration for the multimodal nexus firewall',
};

let fileStatuses: IFileIntegrityStatus[] = [];
let isInitialized = false;

const initialize = async () => {
  if (isInitialized) return;

  const initialStatuses: IFileIntegrityStatus[] = [];
  for (const [filePath, content] of Object.entries(mockFileSystem)) {
    const hash = await calculateSHA256(content);
    initialStatuses.push({ filePath, hash, status: 'VERIFIED' });
  }
  fileStatuses = initialStatuses;
  isInitialized = true;
  console.log('File Integrity Service Initialized (using mock data).');

  // This interval simulates file tampering events from the backend
  setInterval(async () => {
    if (Math.random() < 0.15) {
      const randomIndex = Math.floor(Math.random() * fileStatuses.length);
      const fileToTamper = fileStatuses[randomIndex];
      
      if (fileToTamper.status === 'VERIFIED') {
        console.warn(`BACKEND EVENT: Tampering detected for ${fileToTamper.filePath}`);
        fileToTamper.hash = await calculateSHA256(Math.random().toString());
        fileToTamper.status = 'TAMPERED';
      }
    }
  }, 25000);
};

const getFileStatuses = async (): Promise<IFileIntegrityStatus[]> => {
  console.log("Calling Production Endpoint: GET /api/files/status");
  if (!isInitialized) {
    await initialize();
  }
  return [...fileStatuses]; // Return a copy
};

const quarantineFile = async (filePath: string): Promise<boolean> => {
  console.log(`Calling Production Endpoint: POST /api/files/quarantine for ${filePath}`);
  const file = fileStatuses.find(f => f.filePath === filePath);
  if (file) {
    file.status = 'QUARANTINED';
    return true;
  }
  return false;
};

export const fileIntegrityService = {
    getFileStatuses,
    quarantineFile,
};
