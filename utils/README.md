# /utils

This directory contains pure, reusable utility functions that can be used across the application. These functions are self-contained and have no external dependencies on the application's state or components.

## Utility Overview

-   **`audio.ts`**: Contains helper functions for handling audio data for the Live Voice Assistant.
    -   `encode()`: Encodes a `Uint8Array` of audio data into a base64 string for transmission.
    -   `decode()`: Decodes a base64 string into a `Uint8Array`.
    -   `decodeAudioData()`: Converts raw PCM audio data (as a `Uint8Array`) into a browser-playable `AudioBuffer`.

-   **`crypto.ts`**: Contains helper functions for cryptographic operations.
    -   `calculateSHA256()`: An asynchronous function that uses the browser's native `SubtleCrypto` API to securely calculate the SHA-256 hash of a string. This is the core of the File Integrity Monitor.
