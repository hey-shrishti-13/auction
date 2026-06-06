import React, { createContext, useContext, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { setUser, setLoading, logout } = useAuthStore();

  const checkAuth = React.useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await authAPI.me();
      setUser(data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const { data } = await authAPI.login({ email, password });
      setUser(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (email, password, name, role) => {
    try {
      const { data } = await authAPI.register({ email, password, name, role });
      setUser(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
    } catch (error) {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ login, register, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};