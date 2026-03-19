/**
 * App Router Configuration
 *
 * Simple router that renders the main app directly.
 * Authentication system is disabled for local-only mode.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainApp from './App';

/**
 * Main Router component
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main App Route */}
        <Route path="/app/*" element={<MainApp />} />

        {/* Default Route - redirect to app */}
        <Route path="/" element={<Navigate to="/app" replace />} />

        {/* Catch all - redirect to app */}
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
