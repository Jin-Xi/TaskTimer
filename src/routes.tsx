/**
 * App Router Configuration
 *
 * Handles routing between authentication pages and the main app,
 * with proper guards for cloud/offline mode.
 */
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import MainApp from './App';

/**
 * Auth wrapper component that handles routing logic
 */
function AuthWrapper() {
  const { isCloud, isAuthenticated, loading } = useAuthContext();
  const navigate = useNavigate();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
          <p className="text-sm text-neutral-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Login Route */}
      <Route
        path="/login"
        element={
          (!isCloud) || (isCloud && isAuthenticated) ? (
            <Navigate to="/app" replace />
          ) : (
            <LoginPage onRegisterClick={() => navigate('/register')} />
          )
        }
      />

      {/* Register Route */}
      <Route
        path="/register"
        element={
          (!isCloud) || (isCloud && isAuthenticated) ? (
            <Navigate to="/app" replace />
          ) : (
            <RegisterPage onLoginClick={() => navigate('/login')} />
          )
        }
      />

      {/* Main App Route - Protected in cloud mode */}
      <Route
        path="/app/*"
        element={
          isCloud && !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <MainApp />
          )
        }
      />

      {/* Default Route */}
      <Route
        path="/"
        element={
          isCloud ? (
            isAuthenticated ? (
              <Navigate to="/app" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          ) : (
            <Navigate to="/app" replace />
          )
        }
      />

      {/* Catch all - redirect to app or login */}
      <Route
        path="*"
        element={
          isCloud && !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <Navigate to="/app" replace />
          )
        }
      />
    </Routes>
  );
}

/**
 * Main Router component with providers
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthWrapper />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppRouter;
