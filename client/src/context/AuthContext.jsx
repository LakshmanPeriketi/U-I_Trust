import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

const STORAGE_KEY = 'uandi_user';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user || parsed);
      }
      catch { localStorage.removeItem(STORAGE_KEY); }
    }
    setLoading(false);
  }, []);

  // ── Email / password login ─────────────────────────────────────────────
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    _persist(data);
    return data.user;
  };

  // ── Register (all roles) ───────────────────────────────────────────────
  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    _persist(data);
    return data.user;
  };

  // ── Donor OTP flow — request ───────────────────────────────────────────
  const otpRequest = async (phone) => {
    const { data } = await api.post('/auth/otp/request', { phone });
    return data;
  };

  // ── Donor OTP flow — verify ────────────────────────────────────────────
  const otpVerify = async (phone, code) => {
    const { data } = await api.post('/auth/otp/verify', { phone, code });
    _persist(data);
    return data.user;
  };

  // ── Logout ─────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  // ── Private helper ──────────────────────────────────────────────────────
  const _persist = ({ token, user: u }) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: u }));
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, otpRequest, otpVerify }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
