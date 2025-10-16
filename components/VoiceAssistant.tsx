import React from 'react';
import { Mic, MicOff, Wifi, WifiOff } from 'lucide-react';
import { useVoiceConnection } from '../contexts/AppContext';

const VoiceAssistant: React.FC = () => {
    const { status, toggleConnection, transcription } = useVoiceConnection();

    const isConnected = status === 'CONNECTED';
    const isConnecting = status === 'CONNECTING';
    const isDisconnected = status === 'DISCONNECTED' || status === 'ERROR';

    const getStatusText = () => {
        switch (status) {
            case 'CONNECTED':
                return 'LIVE CONNECTION ESTABLISHED';
            case 'CONNECTING':
                return 'ESTABLISHING CONNECTION...';
            case 'DISCONNECTED':
                return 'AWAITING CONNECTION';
            case 'ERROR':
                return 'CONNECTION ERROR';
            default:
                return 'STATUS UNKNOWN';
        }
    };
    
    const statusColor = {
        CONNECTED: 'text-green-400',
        CONNECTING: 'text-amber-400',
        DISCONNECTED: 'text-[var(--color-text-secondary)]',
        ERROR: 'text-red-500',
    };

    return (
        <div className="glass-panel p-4 rounded-xl h-full flex flex-col min-h-[250px]">
             <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--color-border)]">
                <h3 className="text-xl font-black font-display text-[var(--color-text-primary)] tracking-wider">VOICE INTERFACE</h3>
            </div>
            
            <div className="flex-grow flex flex-col justify-center items-center text-center font-mono">
                 <div className={`flex items-center gap-2 mb-4 transition-colors ${statusColor[status]}`}>
                    {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                    <span className="text-xs font-bold tracking-widest">{getStatusText()}</span>
                </div>
                
                <p className="h-16 text-sm text-[var(--color-text-primary)] p-2">
                    {transcription.user || transcription.assistant || "..."}
                </p>
            </div>
            
            <div className="flex justify-center items-center mt-4">
                 <button
                    onClick={toggleConnection}
                    disabled={isConnecting}
                    aria-label={isConnected ? 'Disconnect voice' : 'Connect voice'}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 border-2
                        ${isConnected ? 'bg-red-900/50 border-red-500 text-red-400 hover:bg-red-900/80' : 'bg-green-900/50 border-green-500 text-green-400 hover:bg-green-900/80'}
                        ${isConnecting ? 'animate-pulse cursor-not-allowed' : ''}
                    `}
                 >
                    {isConnected ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                 </button>
            </div>
        </div>
    );
};

export default VoiceAssistant;
