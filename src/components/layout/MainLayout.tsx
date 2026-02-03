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
import { cn } from '@/utils/cn';

export function MainLayout() {
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen);

  return (
    <div className="flex h-screen bg-base-200">
      <KeyboardShortcuts />
      <Sidebar />

      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-base-100 border-b border-base-300 flex items-center px-4 gap-3 z-30 lg:hidden">
        <IconButton
          icon={<Menu className="w-5 h-5" />}
          aria-label="Open menu"
          onClick={() => setMobileSidebarOpen(true)}
          variant="ghost"
        />
        <Logo size="sm" />
        <span className="font-semibold">{import.meta.env.VITE_APP_NAME}</span>
      </div>

      <main
        className={cn(
          'flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300',
          // Desktop: margin based on sidebar state
          'lg:ml-16',
          !isSidebarCollapsed && 'lg:ml-64',
          // Mobile: no margin, but add top padding for header
          'ml-0 pt-14 lg:pt-0'
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
