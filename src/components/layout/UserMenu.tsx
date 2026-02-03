import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, Download, Upload, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useUIStore } from '@/stores/useUIStore';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown } from '@/components/ui/Dropdown';
import { exportData, importData } from '@/services/storage';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';

function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function UserMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const theme = useSettingsStore((state) => state.settings.appearance.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const isCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const isMobileOpen = useUIStore((state) => state.isMobileSidebarOpen);

  const handleExport = () => {
    try {
      const data = exportData();
      downloadJson(data, `chonky-export-${new Date().toISOString().split('T')[0]}.json`);
      success(t('settings.general.exportSuccess'));
    } catch {
      error(t('settings.general.exportError'));
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const result = importData(data);
        if (result) {
          success(t('settings.general.importSuccess'));
        } else {
          error(t('settings.general.importError'));
        }
      } catch {
        error(t('settings.general.invalidFormat'));
      }
    };
    input.click();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'auto' : 'dark');
  };

  if (!user) return null;

  const themeLabel = theme === 'light' ? t('settings.appearance.light')
    : theme === 'dark' ? t('settings.appearance.dark')
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
      id: 'export',
      label: t('userMenu.exportData'),
      icon: <Download className="w-4 h-4" />,
      onClick: handleExport,
    },
    {
      id: 'import',
      label: t('userMenu.importData'),
      icon: <Upload className="w-4 h-4" />,
      onClick: handleImport,
    },
    { id: 'divider-2', label: '', icon: null, onClick: () => {}, divider: true },
    {
      id: 'logout',
      label: t('userMenu.logOut'),
      icon: <LogOut className="w-4 h-4" />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  const showDetails = !isCollapsed || isMobileOpen;

  return (
    <Dropdown
      trigger={
        <button
          className={cn(
            'flex items-center gap-3 p-3 w-full hover:bg-base-200 transition-colors',
            !showDetails && 'justify-center'
          )}
        >
          <Avatar name={user.fullName} size="sm" />
          {showDetails && (
            <div className="flex-1 text-left min-w-0">
              <div className="font-medium truncate">{user.displayName}</div>
              <div className="text-xs text-base-content/60 truncate">{user.email}</div>
            </div>
          )}
        </button>
      }
      items={menuItems}
      position="top-start"
    />
  );
}
