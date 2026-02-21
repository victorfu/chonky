import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const isCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const isMobileOpen = useUIStore((state) => state.isMobileSidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen);
  const prevPathname = useRef(location.pathname);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (prevPathname.current !== location.pathname && isMobileOpen) {
      setMobileSidebarOpen(false);
    }
    prevPathname.current = location.pathname;
  }, [location.pathname, isMobileOpen, setMobileSidebarOpen]);

  // Close mobile sidebar on escape key
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
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'glass-sidebar fixed left-0 top-0 z-50 flex h-full flex-col transition-all duration-300 ease-decelerate',
          // Desktop: show based on collapsed state
          'hidden lg:flex',
          isCollapsed ? 'lg:w-20' : 'lg:w-72',
          // Mobile: show as overlay when open
          isMobileOpen && 'flex w-72'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-hairline px-4 py-4">
          <div className={cn('flex items-center gap-2', isCollapsed && !isMobileOpen && 'w-full justify-center')}>
            <Logo size="md" />
            {(!isCollapsed || isMobileOpen) && (
              <span className="truncate text-sm font-semibold tracking-tight">
                {import.meta.env.VITE_APP_NAME}
              </span>
            )}
          </div>
          {!isCollapsed && !isMobileOpen && (
            <IconButton
              icon={<PanelLeftClose className="h-4 w-4" />}
              aria-label={t('sidebar.collapse')}
              onClick={toggleSidebar}
              size="sm"
              className="hidden lg:inline-flex"
            />
          )}
          {isMobileOpen && (
            <IconButton
              icon={<X className="h-4 w-4" />}
              aria-label={t('common.close')}
              onClick={() => setMobileSidebarOpen(false)}
              size="sm"
              className="lg:hidden"
            />
          )}
        </div>

        {/* Collapsed toggle - desktop only */}
        {isCollapsed && !isMobileOpen && (
          <div className="hidden p-2 lg:block">
            <IconButton
              icon={<PanelLeftOpen className="h-4 w-4" />}
              aria-label={t('sidebar.expand')}
              onClick={toggleSidebar}
              className="w-full"
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <SidebarNav onNavigate={() => setMobileSidebarOpen(false)} />
        </div>

        {/* User menu */}
        <div className="border-t border-border-hairline">
          <UserMenu />
        </div>
      </aside>
    </>
  );
}
