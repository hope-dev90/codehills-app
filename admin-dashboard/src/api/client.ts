// Fetch wrapper for the CodeHills / UmucoCore admin API.
//
// Responsibilities:
// - Base URL resolution from VITE_API_URL (default http://localhost:4000/api)
// - Bearer token injection from localStorage
// - Transparent single-flight refresh on 401, retrying the original request once
// - Envelope unwrapping and JS Error propagation carrying the server message
// - Token + user persistence under the agreed localStorage keys

import type { AdminUser, ApiEnvelope } from './types';

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'
).replace(/\/+$/, '');

const TOKENS_KEY = 'codehills.admin.tokens';
const USER_KEY = 'codehills.admin.user';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ─── Session notification ────────────────────────────────────────────────────

let authFailureHandler: (() => void) | null = null;

/** Registers a callback invoked when the session can no longer be refreshed. */
export function setAuthFailureHandler(handler: (() => void) | null): void {
  authFailureHandler = handler;
}

function notifyAuthFailure(): void {
  if (authFailureHandler) authFailureHandler();
}

// ─── Token storage ───────────────────────────────────────────────────────────

export function getTokens(): TokenPair | null {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TokenPair>;
    if (!parsed.accessToken) return null;
    return { accessToken: parsed.accessToken, refreshToken: parsed.refreshToken ?? '' };
  } catch {
    return null;
  }
}

export function setTokens(pair: TokenPair): void {
  try {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(pair));
  } catch {
    // Storage unavailable; session stays in memory only.
  }
}

export function clearTokens(): void {
  try {
    localStorage.removeItem(TOKENS_KEY);
  } catch {
    // Ignore.
  }
}

export function getStoredUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AdminUser): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Ignore.
  }
}

export function clearUser(): void {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // Ignore.
  }
}

// ─── Token refresh (single-flight) ───────────────────────────────────────────

let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const tokens = getTokens();
  if (!tokens || !tokens.refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const json = (await res.json()) as ApiEnvelope<{ accessToken: string; refreshToken: string }>;
    const data = json.data;
    if (!data || !data.accessToken) {
      clearTokens();
      return null;
    }
    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? tokens.refreshToken,
    });
    return data.accessToken;
  } catch {
    return null;
  }
}

function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ─── Core request ────────────────────────────────────────────────────────────

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Skip the Authorization header (used for login / refresh). */
  skipAuth?: boolean;
  /** Internal flag: the request has already been retried after a 401. */
  retried?: boolean;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, skipAuth = false, retried = false } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (!skipAuth) {
    const tokens = getTokens();
    if (tokens && tokens.accessToken) {
      headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Could not reach the server. Check your connection.', 0);
  }

  if (res.status === 401 && !skipAuth && !retried) {
    const token = await refreshAccessToken();
    if (token) {
      return request<T>(path, { ...options, retried: true });
    }
    clearTokens();
    clearUser();
    notifyAuthFailure();
    throw new ApiError('Your session has expired. Please log in again.', 401);
  }

  let json: ApiEnvelope<T>;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError('Unexpected response from the server.', res.status);
  }

  if (!res.ok || json.success === false) {
    throw new ApiError(json.message || `Request failed with status ${res.status}`, res.status);
  }

  return (json.data ?? (json as unknown as T)) as T;
}
