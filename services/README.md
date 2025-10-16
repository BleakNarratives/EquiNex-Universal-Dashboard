# /services

This directory is the nexus for all communication with backend systems. In the current build, it contains modular, mock services that simulate a live API. Each service is designed to be a "drop-in" replacement point for real `fetch` calls or WebSocket connections to your backend infrastructure.

The core principle is to completely decouple the UI components from the data-fetching implementation.

## Service Overview

-   **`aiService.ts`**: Handles all interactions with the Google Gemini API. This is a **live service** that requires a valid `API_KEY` to function. It powers the Voice Assistant, terminal AI, and the A.D.E.P.T. operative's reasoning.

-   **`fileIntegrityService.ts`**: Simulates a File Integrity Monitor (FIM). It maintains a list of critical system files and their hashes, simulates file tampering, and allows for quarantining.

-   **`metricsService.ts`**: Simulates fetching core dashboard metrics, module statuses, and system event logs. This is the primary data source for the main dashboard view.

-   **`operativeService.ts`**: The "brain" of the A.D.E.P.T. protocol. This service autonomously polls other services for telemetry, uses the `aiService` to reason about the data, and then executes simulated defensive actions by calling exported functions from other services.

-   **`osintService.ts`**: Simulates an Open-Source Intelligence (OSINT) network scan for the terminal's `scan` command.

-   **`securityService.ts`**: Simulates fetching data for the Security Audit Log.

-   **`settingsService.ts`**: Manages loading and saving user settings to `localStorage`.

-   **`threatIntelService.ts`**: Simulates querying an external threat intelligence database (like VirusTotal) for the terminal's `verify` command.

-   **`trafficService.ts`**: Simulates a real-time feed of network traffic data, including logic for detecting and mitigating DDoS attacks.
