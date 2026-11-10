/**
 * Central configuration for the services layer.
 *
 * Set EXPO_PUBLIC_API_URL in .env to point at the UmucoCore backend.
 * When the variable is absent the app falls back to mock/local data
 * so every screen still works without a running server.
 */

import { Platform } from 'react-native';

const rawApiUrl = process.env.EXPO_PUBLIC_API_URL ?? '';

/**
 * 192.168.240.1 is the host as seen *from inside* the Waydroid container.
 * A browser running on the host itself cannot reach that bridge address, so
 * on web we swap it for localhost. This keeps a single .env working for both
 * the Waydroid app and the web dev build.
 */
const apiUrl =
  Platform.OS === 'web' && rawApiUrl.includes('192.168.240.1')
    ? rawApiUrl.replace('192.168.240.1', 'localhost')
    : rawApiUrl;

export const config = {
  /** Base URL of the UmucoCore REST API, e.g. http://localhost:4000/api */
  apiBaseUrl: apiUrl.replace(/\/$/, ''),

  /**
   * When true, content is served from local mock data instead of the API.
   * Automatically true when EXPO_PUBLIC_API_URL is not set.
   */
  useMockData: apiUrl.trim() === '',

  /** Public website that hosts the heritage content this app connects to. */
  contentWebsite: 'https://umucocore.rw/',

  /** Demo checkout never takes money. Flip only when a real payment provider is integrated. */
  paymentsEnabled: false,

  /** Flat shipping fee in RWF — also returned by the backend, kept here for display before order creation. */
  demoShippingRwf: 2000,

  appVersionLabel: 'v1.0.0',
} as const;
