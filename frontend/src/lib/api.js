const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── Token management ──────────────────────────────────────────────────────────
let _token = localStorage.getItem('ark_token') || null;

export const setToken = (token) => {
  _token = token;
  if (token) {
    localStorage.setItem('ark_token', token);
  } else {
    localStorage.removeItem('ark_token');
  }
};

export const getToken = () => _token;

export const clearToken = () => {
  _token = null;
  localStorage.removeItem('ark_token');
};

// ── HTTP request helper ───────────────────────────────────────────────────────
const request = async (path, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Attach JWT if available
  if (_token) {
    headers['Authorization'] = `Bearer ${_token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    headers,
    ...options,
  });

  // Handle 401 — clear token and re-throw
  if (res.status === 401) {
    clearToken();
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = async (userId) => {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
  setToken(data.access_token);
  return data;
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const registerUser = (data) =>
  request('/api/users/', { method: 'POST', body: JSON.stringify(data) });

export const fetchUser = (userId) =>
  request(`/api/users/${userId}`);

export const fetchCurrentUser = () =>
  request('/api/users/me');

export const fetchUserPolicies = (userId) =>
  request(`/api/users/${userId}/policies`);

// ── Policies ──────────────────────────────────────────────────────────────────
export const createPolicy = (data) =>
  request('/api/policies/', { method: 'POST', body: JSON.stringify(data) });

export const togglePolicy = (policyId) =>
  request(`/api/policies/${policyId}/toggle`, { method: 'PATCH' });

export const fetchAllPolicies = () =>
  request('/api/policies/');

// ── Claims ────────────────────────────────────────────────────────────────────
export const fetchClaims = (userId) =>
  request(`/api/claims/?user_id=${userId}`);

export const fetchAllClaims = () =>
  request('/api/claims/');

// ── Premium Calculator (Gemini) ───────────────────────────────────────────────
export const calculatePremium = (city, hours, platform) =>
  request(`/api/simulator/premium?city=${encodeURIComponent(city)}&hours=${hours}&platform=${encodeURIComponent(platform)}`);

// ── Simulator ─────────────────────────────────────────────────────────────────
export const simulateTrigger = (city = 'Mumbai') =>
  request(`/api/simulator/trigger?city=${encodeURIComponent(city)}`, { method: 'POST' });
