import axios from 'axios';
import config from './config';

const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (cfg) => {
    const token = localStorage.getItem('rf_access_token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('rf_refresh_token');
        if (refreshToken) {
          const res = await fetch(`${config.API_BASE_URL}/api/v1/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (res.ok) {
            const data = await res.json();
            localStorage.setItem('rf_access_token', data.accessToken);
            localStorage.setItem('rf_refresh_token', data.refreshToken);
            localStorage.setItem('rf_auth', JSON.stringify(data.user));

            // Sync React state via custom event (AuthContext listens for this)
            window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
              detail: { accessToken: data.accessToken, user: data.user },
            }));

            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch { /* fall through to logout */ }

      localStorage.removeItem('rf_access_token');
      localStorage.removeItem('rf_refresh_token');
      localStorage.removeItem('rf_auth');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
