# /hooks

This directory contains custom React hooks that encapsulate reusable logic, particularly for handling complex user interactions.

## Hook Overview

-   **`useAesthesis.ts`**: This is a custom interaction hook that provides an enhanced user experience beyond standard `onClick` events. It is used throughout the application to create a more tactile and responsive feel.
    -   **Functionality**:
        -   Detects pointer press states (`isPressed`).
        -   Recognizes swipe gestures (left, right, up, down) based on a configurable threshold.
        -   Provides a unified `onActivate` callback that fires on a "tap" or "click" that is *not* a swipe.
        -   Handles pointer capture and release for robust interaction tracking.
