/**
 * base44Client.js — API layer entry point
 *
 * Uses the real Express backend (apiClient) in all environments.
 * Falls back to the localStorage mockClient automatically if the server
 * is unreachable (useful for offline development).
 */
import { apiClient } from './apiClient';
import { mockClient } from './mockClient';

// Check server reachability once at startup; use mock if server is down
let resolvedClient = apiClient; // optimistic default

async function detectServer() {
  try {
    const res = await fetch('/api/health', { signal: AbortSignal.timeout(2000) });
    if (!res.ok) throw new Error();
    resolvedClient = apiClient;
    console.log('✅ Connected to ServisAku backend API');
  } catch {
    resolvedClient = mockClient;
    console.warn('⚠️  Backend offline — using local mock client');
  }
}

detectServer();

// Proxy so any import of base44 always uses the current resolvedClient
export const base44 = new Proxy({}, {
  get(_, prop) {
    return resolvedClient[prop];
  }
});

export default base44;
