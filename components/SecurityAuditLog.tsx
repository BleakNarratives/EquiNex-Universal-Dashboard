import React, { useState, useEffect, useRef } from 'react';
import { Shield, AlertTriangle, Bug } from 'lucide-react';
import { ISecurityLogEntry } from '../types';
import { securityService } from '../services/securityService';

const logConfig = {
    AUDIT: { icon: <Shield className="w-4 h-4 text-cyan-400" />, color: 'text-cyan-400' },
    WARN: { icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, color: 'text-amber-400' },
    CRITICAL: { icon: <Bug className="w-4 h-4 text-red-500" />, color: 'text-red-500' },
};

const SecurityAuditLog: React.FC = () => {
    const [logs, setLogs] = useState<ISecurityLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getLogs = async () => {
            try {
                const data = await securityService.fetchSecurityLogs();
                setLogs(data);
            } catch (error) {
                console.error("Failed to fetch security logs:", error);
            } finally {
                setLoading(false);
            }
        };
        getLogs();

        const interval = setInterval(getLogs, 7000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="glass-panel p-4 rounded-xl h-full flex flex-col min-h-[250px]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--color-border)]">
                <h3 className="text-xl font-black font-display text-[var(--color-text-primary)] tracking-wider">SECURITY AUDIT LOG</h3>
            </div>
            <div ref={logContainerRef} className="flex-grow overflow-y-auto pr-2 font-mono text-sm space-y-2">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-[var(--color-primary-to)] animate-pulse">LOADING LOGS...</p>
                    </div>
                ) : logs.map((log, index) => {
                    const config = logConfig[log.level];
                    return (
                        <div key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 pt-0.5">{config.icon}</div>
                            <div className="flex-1">
                                <span className={`mr-2 font-bold ${config.color}`}>{`[${log.level}]`}</span>
                                <span className="text-[var(--color-text-tertiary)] mr-2">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                                <span className="text-[var(--color-text-secondary)] mr-2">{log.source_ip}</span>
                                <span className="text-[var(--color-text-primary)] whitespace-pre-wrap break-words">
                                    {log.event}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SecurityAuditLog;
