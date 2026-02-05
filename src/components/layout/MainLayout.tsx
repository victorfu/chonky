import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { GlobalLoading } from '@/components/common/GlobalLoading';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { KeyboardShortcuts } from '@/components/common/KeyboardShortcuts';
import { CommandPalette } from '@/components/common/CommandPalette';
import { IconButton } from '@/components/ui/IconButton';
import { Logo } from '@/components/ui/Logo';
import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/utils/cn';

export function MainLayout() {
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const showNavigationSidebar = isAuthenticated;

  return (
    <div className="flex h-screen bg-muted">
      <KeyboardShortcuts />
      {showNavigationSidebar && <Sidebar />}

      {/* Mobile header */}
      {showNavigationSidebar && (
        <div className="fixed top-0 left-0 right-0 h-14 bg-background border-b border-border flex items-center px-4 gap-3 z-30 lg:hidden">
          <IconButton
            icon={<Menu className="w-5 h-5" />}
            aria-label="Open menu"
            onClick={() => setMobileSidebarOpen(true)}
            variant="ghost"
          />
          <Logo size="sm" />
          <span className="font-semibold">{import.meta.env.VITE_APP_NAME}</span>
        </div>
      )}

      <main
        className={cn(
          'flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300',
          showNavigationSidebar && 'lg:ml-16',
          showNavigationSidebar && !isSidebarCollapsed && 'lg:ml-64',
          showNavigationSidebar ? 'ml-0 pt-14 lg:pt-0' : 'ml-0 pt-0'
        )}
      >
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <GlobalLoading />
      <ToastContainer />
      <CommandPalette />
    </div>
  );
}
