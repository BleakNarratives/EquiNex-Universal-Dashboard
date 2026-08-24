// Central API client for the EquiNex backend.
//
// All services call the FastAPI backend through this module. If the backend
// is unreachable, callers use `withFallback` to degrade to their local mock
// data — the dashboard keeps working offline, and logs a clear warning.

const API_BASE = '';

export async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...(options?.headers ?? {}),
            },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
        return await res.json() as T;
    } finally {
        clearTimeout(timeout);
    }
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
    return fetchJson<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

/** Try the live backend; on any failure run the local fallback. */
export async function withFallback<T>(
    path: string,
    fallback: () => Promise<T> | T,
    options?: RequestInit,
): Promise<T> {
    try {
        return await fetchJson<T>(path, options);
    } catch (err) {
        console.warn(`[equinex] backend unreachable for ${path} — using local fallback.`, err);
        return fallback();
    }
}

/** Same-origin WebSocket (proxied to the backend in dev). */
export function connectWebSocket(path: string): WebSocket {
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return new WebSocket(`${proto}://${window.location.host}${path}`);
}
