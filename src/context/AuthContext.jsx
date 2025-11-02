import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('kais_auth');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {}
    }
  }, []);

  const login = (userObj, token) => {
    const payload = { ...userObj, token };
    localStorage.setItem('kais_auth', JSON.stringify(payload));
    setUser(payload);
  };

  const logout = () => {
    localStorage.removeItem('kais_auth');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
