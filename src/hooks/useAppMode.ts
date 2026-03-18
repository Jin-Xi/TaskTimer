/**
 * useAppMode Hook
 *
 * Manages the application mode (offline/cloud)
 * - offline: Uses localStorage for data storage, user configures their own AI API key
 * - cloud: Uses backend API for data storage, AI is managed centrally
 */
import { useState, useEffect, useCallback } from 'react';

export type AppMode = 'offline' | 'cloud';

const STORAGE_KEY = 'app_mode';

interface UseAppModeReturn {
  mode: AppMode;
  isOffline: boolean;
  isCloud: boolean;
  enterOfflineMode: () => void;
  enterCloudMode: () => void;
  setMode: (mode: AppMode) => void;
}

/**
 * Hook for managing application mode
 */
export function useAppMode(): UseAppModeReturn {
  // Initialize from localStorage or default to offline
  const [mode, setModeState] = useState<AppMode>(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY) as AppMode | null;
    return savedMode || 'offline';
  });

  // Persist mode changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  // Enter offline mode
  const enterOfflineMode = useCallback(() => {
    setModeState('offline');
    // Clear cloud mode tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }, []);

  // Enter cloud mode
  const enterCloudMode = useCallback(() => {
    setModeState('cloud');
  }, []);

  // Set mode directly
  const setMode = useCallback((newMode: AppMode) => {
    if (newMode === 'offline') {
      enterOfflineMode();
    } else {
      enterCloudMode();
    }
  }, [enterOfflineMode, enterCloudMode]);

  return {
    mode,
    isOffline: mode === 'offline',
    isCloud: mode === 'cloud',
    enterOfflineMode,
    enterCloudMode,
    setMode,
  };
}

// Export type
export type { UseAppModeReturn };
