/**
 * Central configuration for the services layer.
 *
 * Nothing here points at a real CodeHills / umucocore.rw API: those details are not available yet.
 * When they are, fill in `apiBaseUrl`, set `useMockData` to false and implement the `http*`
 * services in src/services/api.ts. No secrets belong in this file; use a secure mechanism
 * (for example EAS secrets) once real credentials exist.
 */
export const config = {
  /** TODO(backend): base URL of the real API. Intentionally empty. */
  apiBaseUrl: '' as string,

  /** While true, all content comes from the local mock data in src/data. */
  useMockData: true,

  /** Public website that hosts the heritage content this app will be connected to. */
  contentWebsite: 'https://umucocore.rw/',

  /** Demo checkout never takes money. Flip only when a real payment provider is integrated. */
  paymentsEnabled: false,

  /** Flat demo shipping fee in RWF. Replace with a real delivery-fee service. */
  demoShippingRwf: 2000,

  appVersionLabel: 'Demo build 1.0.0',
} as const;
