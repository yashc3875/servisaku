/**
 * app-params.js — ServisAku runtime parameters
 * Reads optional URL/localStorage overrides for auth tokens.
 * Safe to use in both browser and SSR/test environments.
 */

const isBrowser = typeof window !== 'undefined';

const getParam = (name) => {
  if (!isBrowser) return null;
  try {
    const key = `servisaku_${name}`;
    const urlParams = new URLSearchParams(window.location.search);
    const fromUrl = urlParams.get(name);
    if (fromUrl) {
      localStorage.setItem(key, fromUrl);
      // Remove from URL cleanly
      urlParams.delete(name);
      const clean = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
      window.history.replaceState({}, document.title, clean);
      return fromUrl;
    }
    return localStorage.getItem(key) || null;
  } catch {
    return null;
  }
};

export const appParams = {
  // An access_token passed via ?access_token= in the URL (e.g. from OAuth redirect)
  token: isBrowser ? getParam('access_token') : null,
};
