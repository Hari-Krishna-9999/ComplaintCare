import axios from 'axios';

const normalizeBaseURL = (value) => {
  if (!value) return null;

  let normalized = value.trim().replace(/\/+$/, '');

  // Guard against common deployment mistake where health endpoint is used as API base.
  if (normalized.endsWith('/api/health')) {
    normalized = normalized.replace('/api/health', '/api');
  }

  return normalized;
};

const configuredBaseURL = normalizeBaseURL(import.meta.env.VITE_API_URL);
const fallbackBaseURL = 'https://complaintcare-zomt.onrender.com/api';
const baseURL = configuredBaseURL || fallbackBaseURL;

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

export default API;
