import { IFileIntegrityStatus, FileStatus } from '../types';
import { calculateSHA256 } from '../utils/crypto';
import { withFallback, postJson } from './api';

// This mock data would be replaced by a live backend service (e.g., AIDE, Wazuh)
const mockFileSystem: Record<string, string> = {
  '/bin/kernel_init': 'bootstraps the core OS modules',
  '/etc/auth_module.so': 'handles user authentication and session management',
  '/lib/persona_matrix.dll': 'core library for AI persona management',
  '/var/log/pattern_journal.db': 'database for anomaly detection patterns',
  '/sys/nexus_firewall.conf': 'configuration for the multimodal nexus firewall',
};

let mockStatuses: IFileIntegrityStatus[] = [];
let isInitialized = false;

const initializeMock = async () => {
  if (isInitialized) return;
  const statuses: IFileIntegrityStatus[] = [];
  for (const [filePath, content] of Object.entries(mockFileSystem)) {
    const hash = await calculateSHA256(content);
    statuses.push({ filePath, hash, status: 'VERIFIED' });
  }
  mockStatuses = statuses;
  isInitialized = true;
};

const getMockStatuses = async (): Promise<IFileIntegrityStatus[]> => {
  await initializeMock();
  return [...mockStatuses];
};

const quarantineMock = async (filePath: string): Promise<boolean> => {
  await initializeMock();
  const file = mockStatuses.find(f => f.filePath === filePath);
  if (file) {
    file.status = 'QUARANTINED';
    return true;
  }
  return false;
};

const getFileStatuses = (): Promise<IFileIntegrityStatus[]> => {
  return withFallback<IFileIntegrityStatus[]>(
    '/api/files/status',
    () => new Promise(resolve => setTimeout(() => resolve(getMockStatuses()), 800)),
  );
};

const quarantineFile = async (filePath: string): Promise<boolean> => {
  try {
    await postJson<IFileIntegrityStatus>('/api/files/quarantine', { filePath });
    return true;
  } catch (err) {
    console.warn(`[equinex] backend unreachable for POST /api/files/quarantine — applying locally.`, err);
    return quarantineMock(filePath);
  }
};

export const fileIntegrityService = {
    getFileStatuses,
    quarantineFile,
};
