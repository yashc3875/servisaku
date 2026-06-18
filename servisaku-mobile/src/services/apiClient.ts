import { config } from '@/config/env';

/**
 * Thin, inert REST client. Scaffolded for the day `config.USE_MOCKS` is flipped
 * to `false`; until then no service module calls it. Kept dependency-free (uses
 * `fetch`) so swapping to axios later is trivial.
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public payload?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Query = Record<string, string | number | boolean | undefined>;

function buildUrl(path: string, query?: Query): string {
  const url = new URL(`${config.API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function request<T>(
  method: string,
  path: string,
  opts: { query?: Query; body?: unknown; token?: string } = {},
): Promise<T> {
  const res = await fetch(buildUrl(path, opts.query), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    let payload: unknown;
    try {
      payload = await res.json();
    } catch {
      payload = undefined;
    }
    throw new ApiError(res.status, `Request failed: ${res.status}`, payload);
  }

  return (await res.json()) as T;
}

export const apiClient = {
  get: <T>(path: string, query?: Query, token?: string) =>
    request<T>('GET', path, { query, token }),
  post: <T>(path: string, body?: unknown, token?: string) =>
    request<T>('POST', path, { body, token }),
  patch: <T>(path: string, body?: unknown, token?: string) =>
    request<T>('PATCH', path, { body, token }),
  delete: <T>(path: string, token?: string) =>
    request<T>('DELETE', path, { token }),
};
