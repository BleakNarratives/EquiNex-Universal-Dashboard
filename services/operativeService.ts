import { metricsService } from './metricsService';
import { OperativeAction } from '../types';

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
        const telemetry = await this.gatherTelemetry();
        // In a real system, we'd pass telemetry to a more complex AI prompt
        // For this version, we simulate the AI's decision based on telemetry
        const decision = this.makeDecision(telemetry);
        
        // Execute the decided action
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
