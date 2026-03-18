/**
 * useAuth Hook
 *
 * Manages authentication state and operations for cloud mode
 */
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

export interface User {
  id: string;
  username: string;
  language: string;
  theme: string;
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

/**
 * Hook for managing authentication state
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check if user is authenticated
   */
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const userData = await apiClient.get<User>('/auth/me');
        setUser(userData);
      }
    } catch (error) {
      // Token is invalid or expired
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login with username and password
   */
  const login = useCallback(async (username: string, password: string) => {
    const response = await apiClient.post<{
      access_token: string;
      refresh_token: string;
      user: User;
    }>('/auth/login', { username, password });

    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('app_mode', 'cloud');
    setUser(response.user);
  }, []);

  /**
   * Register a new user
   */
  const register = useCallback(async (username: string, password: string) => {
    const response = await apiClient.post<{
      access_token: string;
      refresh_token: string;
      user: User;
    }>('/auth/register', { username, password });

    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('app_mode', 'cloud');
    setUser(response.user);
  }, []);

  /**
   * Logout the current user
   */
  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore logout API errors
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('app_mode');
      setUser(null);
    }
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    checkAuth,
  };
}

// Export types
export type { UseAuthReturn };
