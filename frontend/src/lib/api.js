// ── Base URL ────────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL is missing. Check Vercel environment variables.");
}

// Debug (remove later)
console.log("API URL:", API_URL);

// ── Token management ────────────────────────────────────────────────────────
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

// ── HTTP request helper ─────────────────────────────────────────────────────
const request = async (path, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (_token) {
    headers['Authorization'] = `Bearer ${_token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    headers,
    ...options,
  });

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

// ── Auth ────────────────────────────────────────────────────────────────────
// ⚠️ CHECK YOUR /docs → remove "/api" if not present there

export const login = async (userId) => {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
  setToken(data.access_token);
  return data;
};

export const requestOTP = (phone) =>
  request('/api/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });

export const verifyOTP = async (phone, otp) => {
  const data = await request('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp }),
  });
  setToken(data.access_token);
  return data;
};

// ── Users ───────────────────────────────────────────────────────────────────
export const registerUser = (data) =>
  request('/api/users/', { method: 'POST', body: JSON.stringify(data) });

export const fetchUser = (userId) =>
  request(`/api/users/${userId}`);

export const fetchCurrentUser = () =>
  request('/api/users/me');

export const fetchUserPolicies = (userId) =>
  request(`/api/users/${userId}/policies`);

// ── Policies ────────────────────────────────────────────────────────────────
export const createPolicy = (data) =>
  request('/api/policies/', { method: 'POST', body: JSON.stringify(data) });

export const togglePolicy = (policyId) =>
  request(`/api/policies/${policyId}/toggle`, { method: 'PATCH' });

export const fetchAllPolicies = () =>
  request('/api/policies/');

// ── Claims ──────────────────────────────────────────────────────────────────
export const fetchClaims = (userId) =>
  request(`/api/claims/?user_id=${userId}`);

export const fetchAllClaims = () =>
  request('/api/claims/');

// ── Simulator ───────────────────────────────────────────────────────────────
export const calculatePremium = (city, hours, platform) =>
  request(`/api/simulator/premium?city=${encodeURIComponent(city)}&hours=${hours}&platform=${encodeURIComponent(platform)}`);

export const simulateTrigger = (city = 'Mumbai') =>
  request(`/api/simulator/trigger?city=${encodeURIComponent(city)}`, { method: 'POST' });

// ── Fraud ───────────────────────────────────────────────────────────────────
export const fetchFraudAnalysis = (claimId) =>
  request(`/api/fraud/${claimId}/fraud-analysis`);

// ── Payouts ─────────────────────────────────────────────────────────────────
export const initiatePayout = (claimId, method) =>
  request('/api/payouts/initiate', {
    method: 'POST',
    body: JSON.stringify({ claim_id: claimId, method }),
  });

// ── Admin ───────────────────────────────────────────────────────────────────
export const fetchAdminAnalytics = () =>
  request('/api/admin/analytics');
