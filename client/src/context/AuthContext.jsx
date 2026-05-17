import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser({ ...payload, token });
        } else {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
        }
      } catch (e) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password, remember) => {
    const response = await api.post('/auth/login', { username, password });
    const { token, user: userData } = response.data;
    if (remember) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
    setUser({ ...userData, token });
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
