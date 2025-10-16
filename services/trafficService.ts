import { ITrafficData } from '../types';

class TrafficObservable {
    private subscribers: Set<(data: ITrafficData) => void> = new Set();
    private intervalId: number | null = null;
    private isUnderAttack = false;
    private attackCooldown = 0;
    private lastTotalPackets = 5000;

    subscribe(callback: (data: ITrafficData) => void) {
        this.subscribers.add(callback);
        if (!this.intervalId) {
            this.start();
        }
    }

    unsubscribe(callback: (data: ITrafficData) => void) {
        this.subscribers.delete(callback);
        if (this.subscribers.size === 0) {
            this.stop();
        }
    }

    private start() {
        console.log("Establishing real-time traffic data link (WebSocket)...");
        this.intervalId = window.setInterval(() => {
            const data = this.generateTrafficData();
            this.subscribers.forEach(cb => cb(data));
        }, 500);
    }

    private stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log("Real-time traffic data link closed.");
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
