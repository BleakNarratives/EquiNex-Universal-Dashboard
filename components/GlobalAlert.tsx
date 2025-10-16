import React from 'react';
import { useAlert } from '../contexts/AppContext';
import { AlertTriangle, X } from 'lucide-react';

const GlobalAlert: React.FC = () => {
    const { globalAlert, dismissAlert } = useAlert();

    if (!globalAlert) {
        return null;
    }

    const alertStyles = {
        CRITICAL: 'bg-red-900/90 border-red-500 text-red-200',
        WARN: 'bg-amber-900/90 border-amber-500 text-amber-200',
    };

    return (
        <div 
            className={`fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-4xl z-50 p-4 border rounded-lg shadow-2xl backdrop-blur-md flex items-center justify-between animate-fade-in-down ${alertStyles[globalAlert.level]}`}
            role="alert"
        >
            <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 mr-4 flex-shrink-0" />
                <div className="font-mono">
                    <p className="font-bold uppercase tracking-wider">{globalAlert.level} ALERT</p>
                    <p className="text-sm">{globalAlert.message}</p>
                </div>
            </div>
            <button 
                onClick={dismissAlert} 
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Dismiss alert"
            >
                <X className="w-5 h-5" />
            </button>
            <style jsx>{`
                @keyframes fade-in-down {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, -20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translate(-50%, 0);
                    }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default GlobalAlert;
