import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ChatHomePage } from '@/components/chat/ChatHomePage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore } from '@/stores/useChatStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

const LazyLoginPage = lazy(() =>
  import('@/components/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const LazySettingsPage = lazy(() =>
  import('@/components/settings/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

function RouteFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

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
          <Route path="/login" element={<Suspense fallback={<RouteFallback />}><LazyLoginPage /></Suspense>} />

          {/* App routes */}
          <Route element={<MainLayout />}>
            {/* Homepage (public) */}
            <Route index element={<ChatHomePage />} />
            {/* Protected routes */}
            <Route
              element={
                <AuthGuard>
                  <Outlet />
                </AuthGuard>
              }
            >
              <Route path="settings" element={<Suspense fallback={<RouteFallback />}><LazySettingsPage /></Suspense>} />
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
