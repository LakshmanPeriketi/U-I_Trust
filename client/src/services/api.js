import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('uandi_user');
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      /* ignore malformed data */
    }
  }
  return config;
});

// Global 401 handler — clear session and redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('uandi_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
