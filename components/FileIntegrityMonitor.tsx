import React, { useState, useEffect, useRef } from 'react';
import { FileCheck, FileWarning, ShieldOff } from 'lucide-react';
import { fileIntegrityService } from '../services/fileIntegrityService';
import { IFileIntegrityStatus, FileStatus } from '../types';
import { useAlert } from '../contexts/AppContext';

const statusConfig: Record<FileStatus, { icon: React.ReactNode; color: string; label: string }> = {
    VERIFIED: { icon: <FileCheck className="w-4 h-4" />, color: 'text-green-400', label: 'VERIFIED' },
    TAMPERED: { icon: <FileWarning className="w-4 h-4" />, color: 'text-amber-400 animate-pulse', label: 'TAMPERED' },
    QUARANTINED: { icon: <ShieldOff className="w-4 h-4" />, color: 'text-red-500', label: 'QUARANTINED' },
};

const FileIntegrityMonitor: React.FC = () => {
    const [files, setFiles] = useState<IFileIntegrityStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const { triggerAlert } = useAlert();
    const tamperedFilesRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const checkFiles = async () => {
            try {
                const data = await fileIntegrityService.getFileStatuses();
                setFiles(data);
                
                const currentTampered = new Set(data.filter(f => f.status === 'TAMPERED').map(f => f.filePath));
                
                const newTamperedFiles = [...currentTampered].filter(file => !tamperedFilesRef.current.has(file));
                
                if (newTamperedFiles.length > 0) {
                    triggerAlert('CRITICAL', `File tampering detected: ${newTamperedFiles[0]}`);
                    tamperedFilesRef.current = currentTampered;
                }
                
            } catch (error) {
                console.error("Failed to fetch file statuses:", error);
            } finally {
                setLoading(false);
            }
        };

        checkFiles();
        const interval = setInterval(checkFiles, 2000);
        return () => clearInterval(interval);
    }, [triggerAlert]);

    return (
        <div className="glass-panel p-4 rounded-xl h-full flex flex-col min-h-[250px]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--color-border)]">
                <h3 className="text-xl font-black font-display text-[var(--color-text-primary)] tracking-wider">FILE INTEGRITY MONITOR</h3>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 font-mono text-xs">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-[var(--color-primary-to)] animate-pulse">SCANNING FILESYSTEM...</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[var(--color-text-secondary)]">
                                <th className="py-2">STATUS</th>
                                <th className="py-2">FILEPATH</th>
                                <th className="py-2">HASH (SHA-256)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((file) => {
                                const config = statusConfig[file.status];
                                return (
                                    <tr key={file.filePath} className={`${config.color} border-t border-[var(--color-border)]/50`}>
                                        <td className="py-2 pr-2">
                                            <div className="flex items-center gap-2">
                                                {config.icon}
                                                <span>{config.label}</span>
                                            </div>
                                        </td>
                                        <td className="py-2 pr-2 text-[var(--color-text-primary)]">{file.filePath}</td>
                                        <td className="py-2 text-[var(--color-text-secondary)] font-mono">{file.hash.substring(0, 16)}...</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default FileIntegrityMonitor;
