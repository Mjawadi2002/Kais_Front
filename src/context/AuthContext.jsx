import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

const AuthContext = createContext();
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function getJwtExpiry(token) {
  try { return JSON.parse(atob(token.split('.')[1])).exp * 1000; }
  catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef(null);
  const refreshFnRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('rf_access_token');
    localStorage.removeItem('rf_refresh_token');
    localStorage.removeItem('rf_auth');
    clearTimer();
    setUser(null);
  }, []);

  const scheduleTokenRefresh = useCallback((accessToken) => {
    clearTimer();
    const expiresAt = getJwtExpiry(accessToken);
    if (!expiresAt) return;
    const delay = Math.max(expiresAt - Date.now() - 5 * 60 * 1000, 60 * 1000);
    timerRef.current = setTimeout(() => refreshFnRef.current?.(), delay);
  }, []);

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('rf_refresh_token');
    if (!refreshToken) { logout(); return false; }
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) throw new Error('Refresh failed');
      const data = await res.json();
      localStorage.setItem('rf_access_token', data.accessToken);
      localStorage.setItem('rf_refresh_token', data.refreshToken);
      localStorage.setItem('rf_auth', JSON.stringify(data.user));
      setUser({ ...data.user, token: data.accessToken });
      scheduleTokenRefresh(data.accessToken);
      return true;
    } catch {
      logout();
      return false;
    }
  }, [logout, scheduleTokenRefresh]);

  useEffect(() => { refreshFnRef.current = refreshAccessToken; }, [refreshAccessToken]);

  useEffect(() => {
    const handleTokenRefreshed = (e) => {
      setUser({ ...e.detail.user, token: e.detail.accessToken });
    };
    window.addEventListener('auth:token-refreshed', handleTokenRefreshed);

    const initAuth = async () => {
      try {
        const accessToken = localStorage.getItem('rf_access_token');
        const refreshToken = localStorage.getItem('rf_refresh_token');
        const userStr = localStorage.getItem('rf_auth');
        if (!accessToken || !refreshToken || !userStr) return;

        const expiresAt = getJwtExpiry(accessToken);
        const isExpired = expiresAt ? Date.now() >= expiresAt : false;

        if (isExpired) {
          await refreshAccessToken();
        } else {
          try {
            const res = await fetch(`${API_URL}/api/v1/auth/me`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.ok) {
              setUser({ ...JSON.parse(userStr), token: accessToken });
              scheduleTokenRefresh(accessToken);
            } else {
              await refreshAccessToken();
            }
          } catch {
            await refreshAccessToken();
          }
        }
      } catch { logout(); }
      finally { setIsLoading(false); }
    };

    initAuth();

    return () => {
      clearTimer();
      window.removeEventListener('auth:token-refreshed', handleTokenRefreshed);
    };
  }, []); // mount-only

  const login = useCallback((userObj, accessToken, refreshToken) => {
    localStorage.setItem('rf_access_token', accessToken);
    localStorage.setItem('rf_refresh_token', refreshToken);
    localStorage.setItem('rf_auth', JSON.stringify(userObj));
    setUser({ ...userObj, token: accessToken });
    scheduleTokenRefresh(accessToken);
  }, [scheduleTokenRefresh]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
