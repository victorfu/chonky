import { NavLink } from 'react-router-dom';
import { MessageSquareText, Settings } from 'lucide-react';
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
    { to: '/', icon: MessageSquareText, label: t('nav.chat', 'Chat'), end: true },
    { to: '/settings', icon: Settings, label: t('nav.settings', 'Settings') },
  ];

  const showLabels = !isCollapsed || isMobileOpen;

  return (
    <nav className="p-2 space-y-1">
      {/* Nav Items */}
      {navItems.map((item) => {
        const Icon = item.icon;
        const link = (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-colors',
                isActive
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                !showLabels && 'justify-center px-2'
              )
            }
          >
            <Icon className="w-5 h-5" />
            {showLabels && <span>{item.label}</span>}
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
    </nav>
  );
}
