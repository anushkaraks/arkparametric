const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const request = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const registerUser = (data) =>
  request('/api/users/', { method: 'POST', body: JSON.stringify(data) });

export const fetchUser = (userId) =>
  request(`/api/users/${userId}`);

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
