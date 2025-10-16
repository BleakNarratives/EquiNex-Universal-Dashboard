import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Loader } from 'lucide-react';
import { osintService } from '../services/osintService';
import { threatIntelService } from '../services/threatIntelService';
import { devOpsService } from '../services/devOpsService';

type HistoryItem = {
    id: number;
    type: 'command' | 'output' | 'error' | 'success';
    content: string | React.ReactNode;
};

const TermuxTerminal: React.FC = () => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const endOfHistoryRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [history]);

    const addHistory = (item: Omit<HistoryItem, 'id'>) => {
        setHistory(prev => [...prev, { ...item, id: Date.now() + Math.random() }]);
    };

    const handleCommand = async (command: string) => {
        setIsLoading(true);
        addHistory({ type: 'command', content: command });
        
        const [cmd, ...args] = command.trim().split(' ');
        
        switch (cmd.toLowerCase()) {
            case 'help':
                addHistory({ type: 'output', content: 'Commands: help, scan <target>, lookup <hash>, git clone <url>, hf pull <space_id>, clear' });
                break;
            case 'scan':
                if (args.length === 0) {
                    addHistory({ type: 'error', content: 'Usage: scan <target_ip_or_domain>' });
                } else {
                    const result = await osintService.scanTarget(args[0]);
                    const output = (
                        <div>
                            <p>Scan report for: {result.target}</p>
                            <p>Status: {result.status}</p>
                            <p>Open Ports:</p>
                            <ul className="list-disc list-inside ml-4">
                                {result.ports.filter(p => p.status === 'Open').map(p => <li key={p.port}>{p.port}/{p.service}</li>)}
                                {result.ports.filter(p => p.status === 'Open').length === 0 && <li>None found</li>}
                            </ul>
                            <p>Vulnerabilities:</p>
                            <ul className="list-disc list-inside ml-4">
                                {result.vulnerabilities.map(v => <li key={v.cve} className={v.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'}>{v.cve} ({v.severity}): {v.summary}</li>)}
                                {result.vulnerabilities.length === 0 && <li>None found</li>}
                            </ul>
                        </div>
                    );
                    addHistory({ type: 'output', content: output });
                }
                break;
            case 'lookup':
                 if (args.length === 0) {
                    addHistory({ type: 'error', content: 'Usage: lookup <sha256_hash>' });
                } else {
                    const result = await threatIntelService.lookupHash(args[0]);
                     const output = (
                        <p>Threat Intel for {result.hash.substring(0, 16)}...: <span className={result.status === 'malicious' ? 'text-red-400' : 'text-green-400'}>{result.status.toUpperCase()}</span> {result.signature ? `(${result.signature})` : ''} - Source: {result.source}</p>
                    );
                    addHistory({ type: 'output', content: output });
                }
                break;
            case 'git':
                if (args[0]?.toLowerCase() === 'clone' && args[1]) {
                    const result = await devOpsService.cloneRepo(args[1]);
                    if (result.success) {
                        addHistory({ type: 'success', content: `${result.message}\n${result.details}` });
                    } else {
                        addHistory({ type: 'error', content: result.message });
                    }
                } else {
                     addHistory({ type: 'error', content: "Usage: git clone <repository_url>" });
                }
                break;
            case 'hf':
                 if (args[0]?.toLowerCase() === 'pull' && args[1]) {
                    const result = await devOpsService.pullHuggingFaceSpace(args[1]);
                    if (result.success) {
                        addHistory({ type: 'success', content: `${result.message}\n${result.details}` });
                    } else {
                        addHistory({ type: 'error', content: result.message });
                    }
                } else {
                     addHistory({ type: 'error', content: "Usage: hf pull <user/space_id>" });
                }
                break;
            case 'clear':
                setHistory([]);
                break;
            default:
                addHistory({ type: 'error', content: `Command not found: ${cmd}` });
                break;
        }

        setIsLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && input.trim() !== '' && !isLoading) {
            handleCommand(input);
            setInput('');
        }
    };

    return (
        <div className="glass-panel p-4 rounded-xl h-full flex flex-col font-mono text-sm min-h-[480px]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--color-border)]">
                <h3 className="text-xl font-black font-display text-[var(--color-text-primary)] tracking-wider">TERMUX INTERFACE</h3>
                <p className="text-xs text-[var(--color-text-tertiary)]">/dev/pts/0</p>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 space-y-2">
                {history.map(item => (
                    <div key={item.id}>
                        {item.type === 'command' && (
                            <div className="flex items-center">
                                <span className="text-[var(--color-primary-to)]">operative@equinex:~$</span>
                                <span className="text-[var(--color-text-primary)] ml-2">{item.content}</span>
                            </div>
                        )}
                        {item.type === 'output' && (
                           <div className="text-[var(--color-text-secondary)] whitespace-pre-wrap">{item.content}</div>
                        )}
                         {item.type === 'error' && (
                           <div className="text-red-400">Error: {item.content}</div>
                        )}
                         {item.type === 'success' && (
                           <div className="text-green-400 whitespace-pre-wrap">{item.content}</div>
                        )}
                    </div>
                ))}
                <div ref={endOfHistoryRef} />
            </div>
            <div className="mt-2 flex items-center border-t border-[var(--color-border)] pt-2">
                <span className="text-[var(--color-primary-to)]">operative@equinex:~$</span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    className="flex-grow bg-transparent text-[var(--color-text-primary)] ml-2 focus:outline-none"
                    placeholder={isLoading ? 'Processing...' : 'Type a command...'}
                />
                {isLoading && <Loader className="w-4 h-4 text-[var(--color-primary-to)] animate-spin" />}
            </div>
        </div>
    );
};

export default TermuxTerminal;
