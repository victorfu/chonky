import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoginPage } from '@/components/auth/LoginPage';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ScreenshotPage } from '@/components/screenshots/ScreenshotPage';
import { ChatHomePage } from '@/components/chat/ChatHomePage';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore } from '@/stores/useChatStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((state) => state.initialize);
  const initChat = useChatStore((state) => state.initialize);
  const initSettings = useSettingsStore((state) => state.initialize);

  useEffect(() => {
    // Initialize Firebase Auth (returns unsubscribe function)
    const unsubscribeAuth = initAuth();
    const unsubscribeChat = initChat();
    const unsubscribeSettings = initSettings();

    // Cleanup: unsubscribe listeners on unmount
    return () => {
      unsubscribeAuth();
      unsubscribeChat();
      unsubscribeSettings();
    };
  }, [initAuth, initChat, initSettings]);

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
            <Route index element={<ChatHomePage />} />
            <Route path="analyze" element={<ScreenshotPage />} />

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
