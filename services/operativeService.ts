import { metricsService } from './metricsService';
import { OperativeAction } from '../types';
import { fetchJson, postJson } from './api';

interface EndpointInventory {
    id: string;
    hostname: string;
    os: string;
    patch_level: string;
    status: 'Online' | 'Offline' | 'Isolated';
    risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    risk_reason?: string;
}

// Using a simple class-based observable for clean subscription management
class OperativeObservable {
    private subscribers: Set<(action: OperativeAction) => void> = new Set();
    private intervalId: number | null = null;
    private actionId: number = 0;

    subscribe(callback: (action: OperativeAction) => void) {
        this.subscribers.add(callback);
        if (!this.intervalId) {
            this.start();
        }
    }

    unsubscribe(callback: (action: OperativeAction) => void) {
        this.subscribers.delete(callback);
        if (this.subscribers.size === 0) {
            this.stop();
        }
    }

    private start() {
        this.intervalId = window.setInterval(() => this.runCycle(), 8000);
        console.log("A.D.E.P.T. Operative cycle initiated.");
    }

    private stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log("A.D.E.P.T. Operative cycle paused.");
        }
    }

    private async runCycle() {
        // Phase 1: EOL endpoint sweep (README Section 5) — highest priority.
        const isolated = await this.sweepEolEndpoints();
        if (isolated) {
            const action: OperativeAction = {
                id: ++this.actionId,
                timestamp: new Date().toISOString(),
                action: isolated.action,
                reasoning: isolated.reasoning,
                status: 'COMPLETED',
            };
            this.subscribers.forEach(cb => cb(action));
            return;
        }

        // Phase 2: telemetry-driven corrective action.
        const telemetry = await this.gatherTelemetry();
        const decision = this.makeDecision(telemetry);
        decision.execute();

        const action: OperativeAction = {
            id: ++this.actionId,
            timestamp: new Date().toISOString(),
            action: decision.action,
            reasoning: decision.reasoning,
            status: Math.random() > 0.1 ? 'COMPLETED' : 'FAILED',
        };

        this.subscribers.forEach(cb => cb(action));
    }

    /**
     * Fetch the endpoint inventory and proactively isolate any endpoint still
     * running Windows 10 past end-of-life (2025-10-14). Returns the isolation
     * action taken, or null when nothing needs isolating.
     */
    private async sweepEolEndpoints(): Promise<{ action: string; reasoning: string } | null> {
        let endpoints: EndpointInventory[];
        try {
            endpoints = await fetchJson<EndpointInventory[]>('/api/endpoints');
        } catch (err) {
            console.warn('[equinex] endpoint inventory unavailable — skipping EOL sweep.', err);
            return null;
        }

        const vulnerable = endpoints.find(
            ep => ep.risk === 'CRITICAL' && ep.status !== 'Isolated' && /Windows 10/.test(ep.os),
        );
        if (!vulnerable) return null;

        try {
            await postJson('/api/endpoints/isolate', { id: vulnerable.id });
        } catch (err) {
            console.warn(`[equinex] failed to isolate ${vulnerable.hostname}.`, err);
            return null;
        }

        const action = `Proactive network isolation of ${vulnerable.hostname} (${vulnerable.os}).`;
        const reasoning = (
            `Proactive isolation of EOL Windows 10 endpoint to mitigate ` +
            `unpatchable vulnerability exposure.`
        );
        return { action, reasoning };
    }

    private async gatherTelemetry() {
        const metrics = await metricsService.getMetrics();
        return {
            degradedModules: metrics.modules.filter(m => m.status === 'Degraded').map(m => m.module_name),
        };
    }

    private makeDecision(telemetry: { degradedModules: string[] }) {
        // This simulates the AI's reasoning process.
        if (telemetry.degradedModules.length > 0) {
            const moduleToFix = telemetry.degradedModules[0];
            return {
                action: `Reallocating resources to stabilize ${moduleToFix}.`,
                reasoning: `Telemetry indicates performance degradation in ${moduleToFix}. Taking corrective action.`,
                execute: () => metricsService.setModuleStatus(moduleToFix, 'Online'),
            };
        }

        // Default actions if no immediate threats are found
        const routineActions = [
            {
                action: "Verifying module checksums.",
                reasoning: "Routine integrity check against known signatures.",
                execute: () => {}
            },
            {
                action: "Recalibrating pattern recognition heuristics.",
                reasoning: "Minor drift detected in user behavior baselines.",
                execute: () => {}
            },
        ];
        return routineActions[Math.floor(Math.random() * routineActions.length)];
    }
}

// Export a single instance (singleton)
export const operativeService = new OperativeObservable();
