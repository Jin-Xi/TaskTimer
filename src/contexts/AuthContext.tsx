/**
 * Auth Context
 *
 * Provides authentication state and methods to the application
 */
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, User } from '../hooks/useAuth';
import { useAppMode, AppMode } from '../hooks/useAppMode';

interface AuthContextValue {
  // Auth state
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Auth methods
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;

  // App mode
  mode: AppMode;
  isOffline: boolean;
  isCloud: boolean;
  enterOfflineMode: () => void;
  enterCloudMode: () => void;
  setMode: (mode: AppMode) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const appMode = useAppMode();
  
  // Use a custom auth hook wrapper or just intercept the calls
  const rawAuth = useAuth();
  
  const auth = {
    ...rawAuth,
    login: async (username: string, password: string) => {
      await rawAuth.login(username, password);
      appMode.enterCloudMode();
    },
    register: async (username: string, password: string) => {
      await rawAuth.register(username, password);
      appMode.enterCloudMode();
    },
    logout: async () => {
      await rawAuth.logout();
      appMode.enterOfflineMode();
    },
    checkAuth: async () => {
      await rawAuth.checkAuth();
      // If we checked auth and user exists, we should be in cloud mode
      // However, checkAuth in useAuth reads app_mode from storage implicitly by checking token
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        ...appMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
