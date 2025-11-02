import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import apiClient from '../config/apiClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTimer, setRefreshTimer] = useState(null);

  // Function to refresh access token
  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('kais_refresh_token');
      
      if (!refreshToken) {
        logout();
        return false;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      // Update stored tokens and user data
      localStorage.setItem('kais_access_token', data.accessToken);
      localStorage.setItem('kais_refresh_token', data.refreshToken);
      localStorage.setItem('kais_auth', JSON.stringify(data.user));
      
      setUser({ ...data.user, token: data.accessToken });
      
      // Schedule next refresh (5 minutes before expiry)
      scheduleTokenRefresh(data.expiresIn);
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  }, []);

  // Schedule automatic token refresh
  const scheduleTokenRefresh = useCallback((expiresIn) => {
    // Clear existing timer
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    // Schedule refresh 5 minutes before expiry (or 55 minutes for 1-hour tokens)
    const refreshTime = (expiresIn - 300) * 1000; // Convert to milliseconds, subtract 5 minutes
    
    const timer = setTimeout(() => {
      refreshAccessToken();
    }, Math.max(refreshTime, 60000)); // Minimum 1 minute

    setRefreshTimer(timer);
  }, [refreshTimer, refreshAccessToken]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const accessToken = localStorage.getItem('kais_access_token');
        const refreshToken = localStorage.getItem('kais_refresh_token');
        const userStr = localStorage.getItem('kais_auth');

        if (!accessToken || !refreshToken || !userStr) {
          setIsLoading(false);
          return;
        }

        // Try to verify current token first
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/auth/me`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            // Token is still valid
            const userData = JSON.parse(userStr);
            setUser({ ...userData, token: accessToken });
            scheduleTokenRefresh(3600); // Assume 1 hour if we don't have exact expiry
          } else {
            // Token expired, try refresh
            await refreshAccessToken();
          }
        } catch (error) {
          // If verification fails, try refresh
          await refreshAccessToken();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [refreshAccessToken, scheduleTokenRefresh]);

  const login = (userObj, accessToken, refreshToken, expiresIn = 3600) => {
    const payload = { ...userObj, token: accessToken };
    
    // Store tokens separately for better security
    localStorage.setItem('kais_access_token', accessToken);
    localStorage.setItem('kais_refresh_token', refreshToken);
    localStorage.setItem('kais_auth', JSON.stringify(userObj));
    
    setUser(payload);
    
    // Schedule automatic token refresh
    scheduleTokenRefresh(expiresIn);
  };

  const logout = () => {
    // Clear all stored auth data
    localStorage.removeItem('kais_access_token');
    localStorage.removeItem('kais_refresh_token');
    localStorage.removeItem('kais_auth');
    
    // Clear refresh timer
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      setRefreshTimer(null);
    }
    
    setUser(null);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [refreshTimer]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading,
      refreshAccessToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
