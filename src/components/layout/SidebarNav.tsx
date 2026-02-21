import { NavLink } from 'react-router-dom';
import { Database, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/useUIStore';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/cn';

interface SidebarNavProps {
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const { t } = useTranslation();
  const isCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const isMobileOpen = useUIStore((state) => state.isMobileSidebarOpen);

  const navItems = [
    { to: '/admin/knowledge-base', icon: Database, label: t('nav.knowledgeBase', 'Knowledge Base') },
    { to: '/admin/settings', icon: Settings, label: t('nav.settings', 'Settings') },
  ];

  const showLabels = !isCollapsed || isMobileOpen;

  return (
    <nav className="flex-1 p-2">
      {showLabels && (
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
          {t('commandPalette.navigation')}
        </p>
      )}
      {/* Nav Items */}
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const link = (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-sm font-medium transition-all motion-safe:duration-200',
                  isActive
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground',
                  !showLabels && 'justify-center px-2'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {showLabels && <span className="truncate">{item.label}</span>}
            </NavLink>
          );

          if (!showLabels) {
            return (
              <Tooltip key={item.to} content={item.label} position="right">
                {link}
              </Tooltip>
            );
          }

          return link;
        })}
      </div>
    </nav>
  );
}
