/**
 * Real API client — talks to Express backend at /api/*
 * Maintains the EXACT same interface as mockClient.js so all UI code
 * continues to work without any changes.
 */

const BASE = '/api';

// --- Token helpers ---
const getToken = () => localStorage.getItem('auth_token');
const setToken = (t) => localStorage.setItem('auth_token', t);
const clearToken = () => localStorage.removeItem('auth_token');

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.status === 204 ? null : res.json();
}

const get = (path) => request('GET', path);
const post = (path, body) => request('POST', path, body);
const patch = (path, body) => request('PATCH', path, body);
const del = (path) => request('DELETE', path);

// --- Entity class that matches MockEntity interface ---
class ApiEntity {
  constructor(name) {
    this.name = name;
    this.path = `/api/${name.toLowerCase()}s`; // e.g. /api/bookings
  }

  async get(id) {
    return fetch(`${this.path}/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then(r => r.json());
  }

  async create(payload) {
    return request('POST', `/${this.name.toLowerCase()}s`, payload);
  }

  async update(id, payload) {
    return request('PATCH', `/${this.name.toLowerCase()}s/${id}`, payload);
  }

  async delete(id) {
    return request('DELETE', `/${this.name.toLowerCase()}s/${id}`);
  }

  async filter(query = {}, orderBy = null, limit = null) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      params.set(k, String(v));
    }
    if (orderBy) params.set('_orderBy', orderBy);
    if (limit) params.set('_limit', String(limit));
    return request('GET', `/${this.name.toLowerCase()}s?${params.toString()}`);
  }

  subscribe() { return () => {}; } // no-op, real-time via polling or SSE later
}

export const apiClient = {
  auth: {
    async me() {
      return get('/auth/me');
    },
    async loginViaEmailPassword(email, password) {
      const data = await post('/auth/login', { email, password });
      setToken(data.access_token);
      return data;
    },
    async register(email, password, full_name) {
      const data = await post('/auth/register', { email, password, fullName: full_name });
      setToken(data.access_token);
      return data.user;
    },
    async updateMe(updateData) {
      // Map snake_case keys the UI sends → camelCase the backend expects
      const mapped = {};
      if (updateData.full_name !== undefined) mapped.fullName = updateData.full_name;
      if (updateData.phone_number !== undefined) mapped.phone = updateData.phone_number;
      if (updateData.city !== undefined) mapped.city = updateData.city;
      if (updateData.bio !== undefined) mapped.bio = updateData.bio;
      if (updateData.partner_verified !== undefined) mapped.partnerVerified = updateData.partner_verified;
      if (updateData.partner_rating !== undefined) mapped.partnerRating = updateData.partner_rating;
      return patch('/auth/me', mapped);
    },
    async logout() {
      clearToken();
      window.location.href = '/';
    },
    async loginWithProvider() {
      // OAuth not yet wired to a real provider; fall through to OTP login
      window.location.href = '/otp-login';
    },
    redirectToLogin() {
      import('sonner').then(({ toast }) => toast.info('Please log in to continue'));
      setTimeout(() => window.location.href = '/otp-login', 800);
    },
  },

  entities: {
    User: new ApiEntity('User'),
    Booking: new ApiEntity('Booking'),
    Coupon: new ApiEntity('Coupon'),
    Review: new ApiEntity('Review'),
    EscrowLedger: new ApiEntity('EscrowLedger'),
    RefundRequest: new ApiEntity('RefundRequest'),
    PayoutRecord: new ApiEntity('PayoutRecord'),
    ChatMessage: new ApiEntity('ChatMessage'),
    Notification: new ApiEntity('Notification'),
  },

  integrations: {
    Core: {
      async UploadFile({ file }) {
        // Placeholder — returns a local object URL until S3 is wired
        return { file_url: URL.createObjectURL(file) };
      },
    },
  },
};

export default apiClient;
