import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoginPage } from '@/components/auth/LoginPage';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ScreenshotPage } from '@/components/screenshots/ScreenshotPage';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { themeService } from '@/services/theme';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((state) => state.initialize);
  const initSettings = useSettingsStore((state) => state.initialize);

  useEffect(() => {
    // Initialize theme first
    themeService.initialize();

    // Initialize Firebase Auth (returns unsubscribe function)
    const unsubscribeAuth = initAuth();

    // Initialize other stores
    initSettings();

    // Cleanup: unsubscribe from Firebase Auth listener on unmount
    return () => {
      unsubscribeAuth();
    };
  }, [initAuth, initSettings]);

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AppInitializer>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* App routes */}
          <Route element={<MainLayout />}>
            {/* Homepage (public) */}
            <Route index element={<ScreenshotPage />} />
            <Route path="analyze" element={<Navigate to="/" replace />} />

            {/* Protected routes */}
            <Route
              element={
                <AuthGuard>
                  <Outlet />
                </AuthGuard>
              }
            >
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppInitializer>
    </BrowserRouter>
  );
}

export default App;
