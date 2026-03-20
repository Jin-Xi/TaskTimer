/**
 * AuthGuard Component
 *
 * Guards routes that require authentication in cloud mode
 */
import { ReactNode, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
  onUnauthorized: () => void;
}

export function AuthGuard({ children, onUnauthorized }: AuthGuardProps) {
  const { loading, isAuthenticated, isCloud } = useAuthContext();

  useEffect(() => {
    // Only check auth in cloud mode
    if (!loading && isCloud && !isAuthenticated) {
      onUnauthorized();
    }
  }, [loading, isAuthenticated, isCloud, onUnauthorized]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
          <p className="text-sm text-neutral-500">加载中...</p>
        </div>
      </div>
    );
  }

  // In offline mode, always allow access
  if (!isCloud) {
    return <>{children}</>;
  }

  // In cloud mode, only allow access if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
