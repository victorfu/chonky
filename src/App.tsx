import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SearchHomePage } from '@/components/search/SearchHomePage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/stores/useAuthStore';
import { useKnowledgeStore } from '@/stores/useKnowledgeStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

const LazyLoginPage = lazy(() =>
  import('@/components/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const LazySettingsPage = lazy(() =>
  import('@/components/settings/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const LazyKnowledgeBasePage = lazy(() =>
  import('@/components/knowledge-base/KnowledgeBasePage').then((m) => ({
    default: m.KnowledgeBasePage,
  }))
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
  const initKnowledge = useKnowledgeStore((state) => state.initialize);
  const initSettings = useSettingsStore((state) => state.initialize);

  useEffect(() => {
    const unsubscribeAuth = initAuth();
    const unsubscribeKnowledge = initKnowledge();
    const unsubscribeSettings = initSettings();

    return () => {
      unsubscribeAuth();
      unsubscribeKnowledge();
      unsubscribeSettings();
    };
  }, [initAuth, initKnowledge, initSettings]);

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AppInitializer>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Suspense fallback={<RouteFallback />}><LazyLoginPage /></Suspense>} />

          {/* Public search homepage — no sidebar, no auth */}
          <Route index element={<SearchHomePage />} />

          {/* Admin routes — with sidebar + auth */}
          <Route element={<MainLayout />}>
            <Route
              element={
                <AuthGuard>
                  <Outlet />
                </AuthGuard>
              }
            >
              <Route
                path="admin/knowledge-base"
                element={<Suspense fallback={<RouteFallback />}><LazyKnowledgeBasePage /></Suspense>}
              />
              <Route
                path="admin/settings"
                element={<Suspense fallback={<RouteFallback />}><LazySettingsPage /></Suspense>}
              />
              <Route path="admin" element={<Navigate to="/admin/knowledge-base" replace />} />
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
