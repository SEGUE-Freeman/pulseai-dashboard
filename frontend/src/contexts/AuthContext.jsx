'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, hospitalAPI } from '../lib/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check for token in localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      loadUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async (authToken) => {
    try {
      const profile = await hospitalAPI.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };
  
  const refreshUser = async () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      await loadUser(storedToken);
    }
  };

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    await loadUser(data.access_token);
    router.push('/dashboard');
  };

  const register = async (formData) => {
    const hospital = await authAPI.register(formData);
    // Auto login after registration
    await login(formData.email, formData.password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
