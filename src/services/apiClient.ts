/**
 * Centralized HTTP client for the UmucoCore backend.
 *
 * Features:
 * - Single base-URL configuration from config.ts
 * - Automatic Bearer token injection from secure storage
 * - Transparent access-token refresh on 401 (single-flight, no duplicate refreshes)
 * - Request timeout (15 s default)
 * - Typed response helper: unwraps { success, data } envelope
 * - Network-error resilience: throws ApiError with a user-readable message
 */

import { config } from './config';
import { tokenStorage } from './tokenStorage';

// ─── Error type ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Internal state ──────────────────────────────────────────────────────────

let refreshPromise: Promise<string | null> | null = null;

// ─── Token refresh ───────────────────────────────────────────────────────────

async function performRefresh(): Promise<string | null> {
  const raw = await tokenStorage.getRefreshToken();
  if (!raw) return null;

  try {
    const res = await fetch(`${config.apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: raw }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      await tokenStorage.clearTokens();
      return null;
    }
    const json = await res.json();
    const { accessToken, refreshToken } = json.data ?? {};
    if (accessToken) await tokenStorage.setTokenPair(accessToken, refreshToken ?? raw);
    return accessToken ?? null;
  } catch {
    return null;
  }
}

/** Returns a fresh access token. Deduplicates concurrent refresh attempts. */
async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

// ─── Core request ────────────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, 'signal'> {
  /** Request timeout in ms. Default: 15 000. */
  timeout?: number;
  /** Skip injecting auth header (public endpoints). */
  skipAuth?: boolean;
  /** Already retried once after a 401. Prevents infinite loops. */
  _retried?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { timeout = 15_000, skipAuth = false, _retried = false, ...init } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = await tokenStorage.getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${config.apiBaseUrl}${path}`, {
      ...init,
      headers,
      signal: AbortSignal.timeout(timeout),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    if (msg.includes('timeout') || msg.includes('TimeoutError')) {
      throw new ApiError(0, 'TIMEOUT', 'Request timed out. Check your connection.');
    }
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the server. Check your connection.');
  }

  // 401 → try to refresh once
  if (res.status === 401 && !_retried && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, { ...options, _retried: true });
    }
    // refresh failed — clear tokens so the app can prompt re-login
    await tokenStorage.clearTokens();
    throw new ApiError(401, 'UNAUTHORIZED', 'Your session has expired. Please log in again.');
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new ApiError(res.status, 'PARSE_ERROR', 'Unexpected response from server.');
  }

  const json = body as { success?: boolean; data?: T; message?: string; error?: string; details?: unknown };

  if (!res.ok) {
    throw new ApiError(
      res.status,
      json.error ?? 'API_ERROR',
      json.message ?? `Request failed with status ${res.status}`,
      json.details,
    );
  }

  return (json.data ?? json) as T;
}

// ─── Convenience wrappers ────────────────────────────────────────────────────

export const api = {
  get:    <T>(path: string, opts?: RequestOptions) =>
    apiFetch<T>(path, { method: 'GET', ...opts }),

  post:   <T>(path: string, body: unknown, opts?: RequestOptions) =>
    apiFetch<T>(path, { method: 'POST',   body: JSON.stringify(body), ...opts }),

  put:    <T>(path: string, body: unknown, opts?: RequestOptions) =>
    apiFetch<T>(path, { method: 'PUT',    body: JSON.stringify(body), ...opts }),

  patch:  <T>(path: string, body: unknown, opts?: RequestOptions) =>
    apiFetch<T>(path, { method: 'PATCH',  body: JSON.stringify(body), ...opts }),

  delete: <T>(path: string, opts?: RequestOptions) =>
    apiFetch<T>(path, { method: 'DELETE', ...opts }),
};
