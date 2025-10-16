# /contexts

This directory manages the global state of the application using React's Context API. This approach avoids "prop drilling" and allows disparate components to share and react to state changes efficiently.

## Context Overview

-   **`AppContext.tsx`**: This is the all-encompassing provider for the application's shared state. It is the single source of truth for:
    -   **Voice Connection State**: Manages the entire lifecycle of the live voice assistant connection, including status (`CONNECTED`, `ERROR`, etc.), transcriptions, and error messages.
    -   **Persona & Theming**: Controls the currently active AI persona (`Operator`, `Engineer`, etc.) and dynamically applies the corresponding UI theme across the entire application.
    -   **Global Alerting**: Manages the state for the system-wide `GlobalAlert` banner, allowing any component to trigger a critical notification.
    -   **Autonomous Operative State**: Manages the log, current status, and threat level assessment of the A.D.E.P.T. AI, and also contains the "heartbeat" `setInterval` that drives its autonomous cycle.
