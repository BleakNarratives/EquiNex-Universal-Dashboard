import React, { useState, useEffect, useRef } from 'react';
import { ILogEntry } from '../types';
// FIX: Imported the whole service to call the method from it, as it's not a named export.
import { metricsService } from '../services/metricsService';
import { useAesthesis } from '../hooks/useAesthesis';
import { HardDrive, AlertTriangle, FileText, ChevronRight } from 'lucide-react';

const logConfig = {
    INFO: { icon: <FileText className="w-4 h-4 text-sky-400" />, color: 'text-sky-400' },
    WARN: { icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, color: 'text-amber-400' },
    ERROR: { icon: <HardDrive className="w-4 h-4 text-red-500" />, color: 'text-red-500' },
};

const LoadingLogs: React.FC = () => (
    <div className="flex justify-center items-center h-full">
        <p className="text-[var(--color-primary-to)] font-display tracking-widest animate-pulse">
            LOADING SYSTEM LOGS...
        </p>
    </div>
);

const SystemLog: React.FC<{onSwipeRight: () => void}> = ({ onSwipeRight }) => {
    const [logs, setLogs] = useState<ILogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const logContainerRef = useRef<HTMLDivElement>(null);

    const { handlers } = useAesthesis({ onSwipeRight });

    useEffect(() => {
        const getLogs = async () => {
            try {
                // FIX: Called fetchSystemLogs from the imported metricsService object.
                const data = await metricsService.fetchSystemLogs();
                setLogs(data);
            } catch (error) {
                console.error("Failed to fetch system logs:", error);
            } finally {
                setLoading(false);
            }
        };
        getLogs();

        const interval = setInterval(getLogs, 5000); // Refresh logs every 5 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div {...handlers} className="glass-panel p-4 rounded-xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--color-border)]">
                <h3 className="text-xl font-black font-display text-[var(--color-text-primary)] tracking-wider">SYSTEM EVENT LOG</h3>
                <div className="flex items-center text-xs font-mono text-[var(--color-text-secondary)] animate-pulse">
                    <span>SWIPE BACK FOR METRICS</span>
                    <ChevronRight className="w-4 h-4"/>
                </div>
            </div>
            <div ref={logContainerRef} className="flex-grow overflow-y-auto pr-2 font-mono text-sm space-y-2">
                {loading ? <LoadingLogs /> : logs.map((log, index) => {
                    const config = logConfig[log.level] || logConfig.INFO;
                    return (
                        <div key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 pt-0.5">{config.icon}</div>
                            <div className="flex-1">
                                <span className={`mr-2 ${config.color}`}>{`[${log.level}]`}</span>
                                <span className="text-[var(--color-text-secondary)] mr-2">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                                <span className="text-[var(--color-text-primary)] whitespace-pre-wrap break-words">
                                    {log.message}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SystemLog;