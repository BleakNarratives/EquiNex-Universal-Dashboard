import React, { useState, useEffect } from 'react';
import { Wifi } from 'lucide-react';
import { trafficService } from '../services/trafficService';
import { ITrafficData } from '../types';
import { useAlert } from '../contexts/AppContext';

const TrafficAnalysis: React.FC = () => {
    const [traffic, setTraffic] = useState<ITrafficData | null>(null);
    const { triggerAlert } = useAlert();
    const [attackAlertShown, setAttackAlertShown] = useState(false);

    useEffect(() => {
        const handleTrafficUpdate = (data: ITrafficData) => {
            setTraffic(data);
            if (data.isUnderAttack && !attackAlertShown) {
                triggerAlert('CRITICAL', 'DDoS attack detected. Rerouting malicious traffic to sinkhole.');
                setAttackAlertShown(true);
            } else if (!data.isUnderAttack && attackAlertShown) {
                setAttackAlertShown(false);
            }
        };

        trafficService.subscribe(handleTrafficUpdate);
        return () => trafficService.unsubscribe(handleTrafficUpdate);
    }, [triggerAlert, attackAlertShown]);

    const getBarWidth = (value: number, total: number) => {
        if (total === 0) return '0%';
        return `${(value / total) * 100}%`;
    };

    const formatNumber = (num: number) => num.toLocaleString();

    return (
        <div className="glass-panel p-4 rounded-xl h-full flex flex-col min-h-[250px]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--color-border)]">
                <h3 className="text-xl font-black font-display text-[var(--color-text-primary)] tracking-wider">TRAFFIC ANALYSIS</h3>
            </div>
            <div className="flex-grow flex flex-col justify-between">
                {traffic ? (
                    <>
                        <div className={`p-3 rounded-lg text-center transition-colors duration-300 ${traffic.isUnderAttack ? 'bg-red-900/50 animate-pulse' : 'bg-black/20'}`}>
                            <p className="font-display text-lg font-bold tracking-widest">
                                {traffic.isUnderAttack ? 'DDoS ATTACK DETECTED' : 'SYSTEM NOMINAL'}
                            </p>
                            <p className="font-mono text-xs text-red-300">
                                {traffic.isUnderAttack ? 'TRAPDOOR PROTOCOL ACTIVE' : ''}
                            </p>
                        </div>

                        <div className="font-mono text-sm space-y-3 mt-4">
                            <div>
                                <p className="text-[var(--color-text-secondary)]">TOTAL INGRESS</p>
                                <div className="flex items-center gap-2">
                                    <Wifi className="w-4 h-4 text-[var(--color-primary-text)]" />
                                    <p className="text-xl font-bold text-[var(--color-text-primary)]">{formatNumber(traffic.totalPackets)} PPS</p>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-xs text-[var(--color-text-secondary)] mb-1">TRAFFIC COMPOSITION</p>
                                <div className="w-full h-6 bg-black/30 rounded-full overflow-hidden flex">
                                    <div 
                                        className="h-full bg-green-500 transition-all duration-500"
                                        style={{ width: getBarWidth(traffic.cleanPackets, traffic.totalPackets) }}
                                        title={`Clean: ${formatNumber(traffic.cleanPackets)}`}
                                    ></div>
                                    <div
                                        className="h-full bg-red-500 transition-all duration-500"
                                        style={{ width: getBarWidth(traffic.maliciousPackets, traffic.totalPackets) }}
                                        title={`Malicious: ${formatNumber(traffic.maliciousPackets)}`}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs mt-1">
                                    <span className="text-green-400">CLEAN: {formatNumber(traffic.cleanPackets)}</span>
                                    <span className="text-red-400">MALICIOUS: {formatNumber(traffic.maliciousPackets)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center font-mono text-xs text-[var(--color-text-tertiary)] mt-4">
                            LIVE INGRESS ANALYSIS FROM MODMIND NEXUS
                        </div>
                    </>
                ) : (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-[var(--color-primary-to)] animate-pulse">ESTABLISHING DATALINK...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrafficAnalysis;
