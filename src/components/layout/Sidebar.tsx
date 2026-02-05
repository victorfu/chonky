import { useEffect } from 'react';
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/ui/Logo';
import { IconButton } from '@/components/ui/IconButton';
import { SidebarNav } from './SidebarNav';
import { UserMenu } from './UserMenu';
import { useUIStore } from '@/stores/useUIStore';
import { cn } from '@/utils/cn';

export function Sidebar() {
  const { t } = useTranslation();
  const isCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const isMobileOpen = useUIStore((state) => state.isMobileSidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen);

  // Close mobile sidebar on route change or escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setMobileSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileOpen, setMobileSidebarOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-background border-r border-border flex flex-col transition-all duration-300 z-50',
          // Desktop: show based on collapsed state
          'hidden lg:flex',
          isCollapsed ? 'lg:w-16' : 'lg:w-64',
          // Mobile: show as overlay when open
          isMobileOpen && 'flex w-64'
        )}
      >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className={cn('flex items-center gap-2', isCollapsed && !isMobileOpen && 'justify-center w-full')}>
          <Logo size="md" />
          {(!isCollapsed || isMobileOpen) && <span className="font-semibold">{import.meta.env.VITE_APP_NAME}</span>}
        </div>
        {/* Desktop collapse button */}
        {!isCollapsed && !isMobileOpen && (
          <IconButton
            icon={<PanelLeftClose className="w-4 h-4" />}
            aria-label={t('sidebar.collapse')}
            onClick={toggleSidebar}
            size="sm"
            className="hidden lg:flex"
          />
        )}
        {/* Mobile close button */}
        {isMobileOpen && (
          <IconButton
            icon={<X className="w-4 h-4" />}
            aria-label={t('common.close')}
            onClick={() => setMobileSidebarOpen(false)}
            size="sm"
            className="lg:hidden"
          />
        )}
      </div>

      {/* Collapsed toggle - desktop only */}
      {isCollapsed && !isMobileOpen && (
        <div className="p-2 hidden lg:block">
          <IconButton
            icon={<PanelLeftOpen className="w-4 h-4" />}
            aria-label={t('sidebar.expand')}
            onClick={toggleSidebar}
            className="w-full"
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-visible">
        <SidebarNav onNavigate={() => setMobileSidebarOpen(false)} />
      </div>

      {/* User menu */}
      <div className="border-t border-border">
        <UserMenu />
      </div>
    </aside>
    </>
  );
}
