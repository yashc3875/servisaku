/**
 * Global runtime configuration.
 *
 * The single source of truth for switching the app between mock data and a real
 * backend. Today every service module reads `USE_MOCKS` and returns mock data.
 * When the backend is ready, flip this to `false` (or wire it to an env var) and
 * the service layer will route through `src/services/apiClient.ts` instead — no
 * screen or component needs to change.
 */
export const config = {
  /** When true, the service layer returns local mock data. */
  USE_MOCKS: true,

  /** Base URL for the real REST API (only used when USE_MOCKS is false). */
  API_BASE_URL: 'https://api.servisaku.my/v1',

  /** Socket.IO endpoint for live tracking (mocked locally when USE_MOCKS). */
  SOCKET_URL: 'https://realtime.servisaku.my',

  /** Simulated network latency range (ms) for mock service calls. */
  MOCK_LATENCY: { min: 280, max: 720 },

  /** Default map region — Klang Valley (Kuala Lumpur). */
  DEFAULT_REGION: {
    latitude: 3.139,
    longitude: 101.6869,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },

  /** Default locale used before the user picks one. */
  DEFAULT_LOCALE: 'en' as const,

  CURRENCY: 'MYR' as const,
  COUNTRY_CODE: '+60',
} as const;

export type AppConfig = typeof config;
