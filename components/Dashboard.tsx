import React, { useState, useEffect } from 'react';
import { metricsService } from '../services/metricsService';
import { IDashboardMetrics } from '../types';
import { Users, DollarSign, Activity, BarChart, Thermometer, Gauge } from 'lucide-react';
import SystemHealth from './SystemHealth';
import MetricCard from './MetricCard';
import ModuleStatusTable from './ModuleStatusTable';
import TermuxTerminal from './TermuxTerminal';
import SecurityAuditLog from './SecurityAuditLog';
import TrafficAnalysis from './TrafficAnalysis';
import FileIntegrityMonitor from './FileIntegrityMonitor';
import AutonomousOperative from './AutonomousOperative';
import VoiceAssistant from './VoiceAssistant';
import AIAssistant from './AIAssistant';

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="glass-panel h-24 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="glass-panel h-32 rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel h-96 rounded-xl"></div>
            <div className="glass-panel h-96 rounded-xl"></div>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<IDashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const metricsData = await metricsService.getMetrics();
                setMetrics(metricsData);
            } catch (error) {
                console.error("Failed to fetch dashboard metrics:", error);
            } finally {
                if (loading) setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [loading]);

    if (loading || !metrics) {
        return <LoadingSkeleton />;
    }

    const { 
        overall_status, pattern_journal_summary, 
        total_users, active_users_24h, total_revenue, transactions_24h,
        gpu_temp, frame_latency, modules 
    } = metrics;
    
    return (
        <div className="space-y-6">
            {/* Row 1: High-Level Status */}
            <SystemHealth overall_status={overall_status} pattern_journal_summary={pattern_journal_summary} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <MetricCard title="Total Users" value={total_users.toLocaleString()} icon={<Users className="w-6 h-6" />} />
                <MetricCard title="Active Users (24h)" value={active_users_24h.toLocaleString()} icon={<Activity className="w-6 h-6" />} />
                <MetricCard title="Total Revenue" value={`$${total_revenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} icon={<DollarSign className="w-6 h-6" />} />
                <MetricCard title="Transactions (24h)" value={transactions_24h.toLocaleString()} icon={<BarChart className="w-6 h-6" />} />
                <MetricCard title="GPU Temp" value={`${gpu_temp.toFixed(1)}°C`} icon={<Thermometer className="w-6 h-6" />} />
                <MetricCard title="Frame Latency" value={`${frame_latency.toFixed(2)}ms`} icon={<Gauge className="w-6 h-6" />} />
            </div>

            {/* Row 2: Core Operations */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <AutonomousOperative />
                </div>
                <div className="lg:col-span-2">
                     <ModuleStatusTable modules={modules} />
                </div>
            </div>
            
            {/* Row 3: Interactive Interfaces */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                 <div className="lg:col-span-3">
                    <TermuxTerminal />
                 </div>
                 <div className="lg:col-span-2">
                    <VoiceAssistant />
                 </div>
            </div>

            {/* Row 4: AI Assistant */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                 <div className="lg:col-span-5">
                    <AIAssistant />
                 </div>
            </div>
            
            {/* Row 4: Security Telemetry - OPTIMIZED LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1"><TrafficAnalysis /></div>
                <div className="lg:col-span-1"><FileIntegrityMonitor /></div>
                <div className="lg:col-span-1"><SecurityAuditLog /></div>
            </div>
        </div>
    );
};

export default Dashboard;
