/**
 * Central configuration for the services layer.
 *
 * Set EXPO_PUBLIC_API_URL in .env to point at the UmucoCore backend.
 * When the variable is absent the app falls back to mock/local data
 * so every screen still works without a running server.
 */

const rawApiUrl = process.env.EXPO_PUBLIC_API_URL ?? '';

export const config = {
  /** Base URL of the UmucoCore REST API, e.g. http://localhost:4000/api */
  apiBaseUrl: rawApiUrl.replace(/\/$/, ''),

  /**
   * When true, content is served from local mock data instead of the API.
   * Automatically true when EXPO_PUBLIC_API_URL is not set.
   */
  useMockData: rawApiUrl.trim() === '',

  /** Public website that hosts the heritage content this app connects to. */
  contentWebsite: 'https://umucocore.rw/',

  /** Demo checkout never takes money. Flip only when a real payment provider is integrated. */
  paymentsEnabled: false,

  /** Flat shipping fee in RWF — also returned by the backend, kept here for display before order creation. */
  demoShippingRwf: 2000,

  appVersionLabel: 'v1.0.0',
} as const;
