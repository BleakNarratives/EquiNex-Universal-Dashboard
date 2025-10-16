import React, { useState, useEffect, useRef } from 'react';
import { Bot, CheckCircle, XCircle } from 'lucide-react';
import { OperativeAction } from '../types';
import { operativeService } from '../services/operativeService';

const AutonomousOperative: React.FC = () => {
    const [actions, setActions] = useState<OperativeAction[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleNewAction = (action: OperativeAction) => {
            setActions(prev => [action, ...prev.slice(0, 19)]); // Keep max 20 actions
        };
        
        if (isPaused) {
            operativeService.unsubscribe(handleNewAction);
        } else {
            operativeService.subscribe(handleNewAction);
        }

        return () => operativeService.unsubscribe(handleNewAction);
    }, [isPaused]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    }, [actions]);

    const statusConfig = {
        EXECUTING: { icon: <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse" />, color: 'text-blue-400' },
        COMPLETED: { icon: <CheckCircle className="w-4 h-4 text-green-500" />, color: 'text-green-500' },
        FAILED: { icon: <XCircle className="w-4 h-4 text-red-500" />, color: 'text-red-500' },
    };

    return (
        <div className="glass-panel p-4 rounded-xl h-full flex flex-col min-h-[480px]">
             <style>{`
                @keyframes slide-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .action-item-enter {
                    animation: slide-in 0.5s ease-out forwards;
                }
            `}</style>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                    <Bot className="w-5 h-5 text-[var(--color-primary-text)]" />
                    <h3 className="text-lg font-black font-display text-[var(--color-text-primary)] tracking-wider">AUTONOMOUS OPERATIVE: A.D.E.P.T.</h3>
                </div>
                <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="font-mono text-xs px-3 py-1 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-border)] transition-colors"
                >
                    {isPaused ? 'RESUME' : 'PAUSE'}
                </button>
            </div>
            <div ref={containerRef} className="flex-grow overflow-y-auto pr-2 font-mono text-xs space-y-3">
                {actions.length === 0 && (
                    <div className="flex justify-center items-center h-full text-center text-[var(--color-text-tertiary)]">
                        <p>Initializing A.D.E.P.T. agent...<br />Awaiting first directive.</p>
                    </div>
                )}
                {actions.map((action, index) => {
                    const config = statusConfig[action.status];
                    return (
                        <div key={action.id} className={`border-l-2 border-[var(--color-border)] pl-3 ${index === 0 ? 'action-item-enter' : ''}`}>
                            <div className="flex items-center gap-2">
                                {config.icon}
                                <span className={config.color}>{action.status}</span>
                                <span className="text-[var(--color-text-tertiary)]">{new Date(action.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-[var(--color-text-primary)] mt-1">{action.action}</p>
                            <p className="text-[var(--color-text-secondary)] italic">Reason: {action.reasoning}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AutonomousOperative;