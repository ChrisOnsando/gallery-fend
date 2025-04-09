import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import logger from '../services/logger';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/user/login/',
        {
          email,
          password,
        },
      );
      const { access, refresh } = response.data;
      setToken(access);
      setUser({ email });
      localStorage.setItem('token', access);
      localStorage.setItem('refresh', refresh);
      logger.info('User logged in successfully');
      return { success: true };
    } catch (error) {
      logger.error('Login failed', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        'http://127.0.0.1:8000/api/user/logout/',
        { refresh: localStorage.getItem('refresh') },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
      logger.info('User logged out');
    } catch (error) {
      logger.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
