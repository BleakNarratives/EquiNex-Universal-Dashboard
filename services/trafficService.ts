import { ITrafficData } from '../types';
import { connectWebSocket } from './api';

class TrafficObservable {
    private subscribers: Set<(data: ITrafficData) => void> = new Set();
    private intervalId: number | null = null;
    private isUnderAttack = false;
    private attackCooldown = 0;
    private lastTotalPackets = 5000;
    private ws: WebSocket | null = null;

    subscribe(callback: (data: ITrafficData) => void) {
        this.subscribers.add(callback);
        if (!this.intervalId && !this.ws) {
            this.connect();
        }
    }

    unsubscribe(callback: (data: ITrafficData) => void) {
        this.subscribers.delete(callback);
        if (this.subscribers.size === 0) {
            this.disconnect();
        }
    }

    private connect() {
        // Try the live backend WebSocket first; fall back to the local simulator.
        try {
            this.ws = connectWebSocket('/ws/traffic');
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data) as ITrafficData;
                    this.subscribers.forEach(cb => cb(data));
                } catch {
                    // ignore malformed frames
                }
            };
            this.ws.onerror = () => this.fallbackToSimulator();
            this.ws.onclose = () => this.fallbackToSimulator();
        } catch {
            this.fallbackToSimulator();
        }
    }

    private fallbackToSimulator() {
        if (this.ws) {
            this.ws = null;
        }
        if (!this.intervalId && this.subscribers.size > 0) {
            console.warn("[equinex] WebSocket unavailable — using simulated traffic feed.");
            this.intervalId = window.setInterval(() => {
                const data = this.generateTrafficData();
                this.subscribers.forEach(cb => cb(data));
            }, 500);
        }
    }

    private disconnect() {
        if (this.ws) {
            this.ws.onmessage = null;
            this.ws.onerror = null;
            this.ws.onclose = null;
            this.ws.close();
            this.ws = null;
        }
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private generateTrafficData = (): ITrafficData => {
        const timestamp = Date.now();
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
            if (this.attackCooldown === 0) this.isUnderAttack = false;
        } else if (!this.isUnderAttack && Math.random() < 0.05) {
            this.isUnderAttack = true;
            this.attackCooldown = 20;
        }

        let totalPackets: number;
        let maliciousPackets: number;

        if (this.isUnderAttack) {
            totalPackets = 50000 + Math.random() * 25000;
            maliciousPackets = totalPackets * (0.8 + Math.random() * 0.15);
        } else {
            const change = (Math.random() - 0.5) * 1000;
            totalPackets = Math.max(2000, this.lastTotalPackets + change);
            maliciousPackets = totalPackets * (0.01 + Math.random() * 0.04);
        }
        this.lastTotalPackets = totalPackets;

        return {
            timestamp,
            totalPackets: Math.round(totalPackets),
            cleanPackets: Math.round(totalPackets - maliciousPackets),
            maliciousPackets: Math.round(maliciousPackets),
            isUnderAttack: this.isUnderAttack,
        };
    };
}

export const trafficService = new TrafficObservable();
