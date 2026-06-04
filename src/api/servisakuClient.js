/**
 * servisakuClient.js — ServisAku API layer entry point
 *
 * Uses the real Express backend (apiClient) in all environments.
 * Falls back to the localStorage mockClient automatically if the server
 * is unreachable (useful for Netlify / offline development).
 * Re-checks every 30 seconds so it reconnects automatically after a restart.
 */
import { apiClient } from './apiClient';
import { mockClient } from './mockClient';

let resolvedClient = null; // null = not yet determined
let detecting = false;

async function detectServer() {
  if (detecting) return;
  detecting = true;
  try {
    const res = await fetch('/api/health', { signal: AbortSignal.timeout(3000) });
    const contentType = res.headers.get('content-type');

    // On Netlify with SPA redirects, /api/health might return a 200 OK with the HTML index page.
    // We strictly ensure we are getting JSON from the real backend.
    if (!res.ok || !contentType || !contentType.includes('application/json')) {
      throw new Error('Not OK or Not JSON');
    }

    resolvedClient = apiClient;
    console.log('✅ ServisAku — connected to real backend');
  } catch {
    resolvedClient = mockClient;
    console.warn('⚠️  ServisAku — backend offline, using local mock (demo mode)');
  }
  detecting = false;
}

// Initial detection
const readyPromise = detectServer();

// Re-check every 30 seconds so we reconnect after a server restart
setInterval(detectServer, 30_000);

// Proxy so any import of servisaku always uses the current resolvedClient
export const servisaku = new Proxy({}, {
  get(_, prop) {
    // If not yet resolved, use apiClient optimistically
    const client = resolvedClient ?? apiClient;
    return client[prop];
  }
});

export { readyPromise };
export default servisaku;
