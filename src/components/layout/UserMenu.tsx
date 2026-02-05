import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useUIStore } from '@/stores/useUIStore';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown } from '@/components/ui/Dropdown';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';

export function UserMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { error } = useToast();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const theme = useSettingsStore((state) => state.settings.appearance.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const isCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const isMobileOpen = useUIStore((state) => state.isMobileSidebarOpen);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (err) {
      error(
        err instanceof Error
          ? err.message
          : t('settings.profile.logOutError', 'Failed to log out')
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'auto' : 'dark';
    void setTheme(nextTheme).catch((err) => {
      error(
        err instanceof Error
          ? err.message
          : t('settings.general.updateError', 'Failed to update settings')
      );
    });
  };

  if (!user) return null;

  const themeLabel = theme === 'light'
    ? t('settings.appearance.light')
    : theme === 'dark'
      ? t('settings.appearance.dark')
      : t('settings.appearance.system');

  const menuItems = [
    {
      id: 'settings',
      label: t('userMenu.settings'),
      icon: <Settings className="w-4 h-4" />,
      onClick: () => navigate('/settings'),
    },
    {
      id: 'theme',
      label: `${t('settings.appearance.theme')}: ${themeLabel}`,
      icon: theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />,
      onClick: toggleTheme,
    },
    { id: 'divider-1', label: '', icon: null, onClick: () => {}, divider: true },
    {
      id: 'logout',
      label: isLoggingOut
        ? t('settings.profile.loggingOut', 'Logging out...')
        : t('userMenu.logOut'),
      icon: <LogOut className="w-4 h-4" />,
      onClick: () => {
        void handleLogout();
      },
      disabled: isLoggingOut,
      danger: true,
    },
  ];

  const showDetails = !isCollapsed || isMobileOpen;

  return (
    <Dropdown
      trigger={
        <button
          className={cn(
            'flex items-center gap-3 p-3 w-full hover:bg-muted transition-colors',
            !showDetails && 'justify-center'
          )}
        >
          <Avatar name={user.fullName} size="sm" />
          {showDetails && (
            <div className="flex-1 text-left min-w-0">
              <div className="font-medium truncate">{user.displayName}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
          )}
        </button>
      }
      items={menuItems}
      position="top-start"
    />
  );
}
