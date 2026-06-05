/**
 * servisakuClient.js — ServisAku API layer entry point
 *
 * Detects whether the real Express backend is available.
 * Falls back to the localStorage mockClient if not (Netlify / offline).
 * The `readyPromise` resolves once detection is done so AuthContext
 * can wait before making its first auth.me() call.
 */
import { apiClient } from './apiClient';
import { mockClient } from './mockClient';

let resolvedClient = null;
let detecting = false;
let _resolve;
export const readyPromise = new Promise((res) => { _resolve = res; });

async function detectServer() {
  if (detecting) return;
  detecting = true;
  try {
    const res = await fetch('/api/health', { signal: AbortSignal.timeout(3000) });
    const contentType = res.headers.get('content-type') || '';
    // Only trust a real JSON response — Netlify SPA redirect returns HTML
    if (!res.ok || !contentType.includes('application/json')) throw new Error('not json');
    resolvedClient = apiClient;
    console.log('✅ ServisAku — real backend connected');
  } catch {
    resolvedClient = mockClient;
    console.warn('⚠️  ServisAku — no backend, using demo mode');
  }
  detecting = false;
  _resolve(resolvedClient);
}

// Kick off detection immediately
detectServer();

// Re-check every 30 s so we reconnect after a local server restart
setInterval(async () => {
  detecting = false;   // reset guard so we can re-run
  await detectServer();
}, 30_000);

// Proxy — before detection completes, any call awaits the ready promise
export const servisaku = new Proxy({}, {
  get(_, prop) {
    const client = resolvedClient ?? apiClient;
    return client[prop];
  }
});

export default servisaku;
