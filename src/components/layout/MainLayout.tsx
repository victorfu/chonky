import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './Sidebar';
import { getAdminRouteTitle, getAdminRouteSubtitle } from './routeMeta';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { GlobalLoading } from '@/components/common/GlobalLoading';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { KeyboardShortcuts } from '@/components/common/KeyboardShortcuts';
import { CommandPalette } from '@/components/common/CommandPalette';
import { IconButton } from '@/components/ui/IconButton';
import { useUIStore } from '@/stores/useUIStore';
import { cn } from '@/utils/cn';

export function MainLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen);
  const setCommandPaletteOpen = useUIStore((state) => state.setCommandPaletteOpen);

  const title = getAdminRouteTitle(location.pathname, t);
  const subtitle = getAdminRouteSubtitle(location.pathname, t);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(120% 80% at 0% 0%, color-mix(in oklch, var(--accent) 16%, transparent), transparent 56%), radial-gradient(90% 70% at 100% 0%, color-mix(in oklch, var(--accent) 10%, transparent), transparent 58%)',
        }}
      />
      <KeyboardShortcuts />
      <Sidebar />

      <div
        className={cn(
          'relative flex min-w-0 flex-1 flex-col transition-[padding-left] duration-300 ease-decelerate',
          'lg:pl-20',
          !isSidebarCollapsed && 'lg:pl-72'
        )}
      >
        <header className="glass-toolbar sticky top-0 z-30 flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <IconButton
              icon={<Menu className="h-5 w-5" />}
              aria-label={t('sidebar.expand')}
              onClick={() => setMobileSidebarOpen(true)}
              variant="ghost"
              className="lg:hidden"
            />
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">{title}</h1>
              {subtitle && (
                <p className="hidden truncate text-xs text-muted-foreground sm:block">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="glass-clear inline-flex items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground motion-safe:duration-200"
            >
              <span>⌘K</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <div className="w-full max-w-6xl">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      <GlobalLoading />
      <ToastContainer />
      <CommandPalette />
    </div>
  );
}
