import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

export type SettingsTab = 'general' | 'appearance' | 'profile';

interface SettingsTabsProps {
  activeTab: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}

const tabIds: SettingsTab[] = ['general', 'appearance', 'profile'];

export function SettingsTabs({ activeTab, onChange }: SettingsTabsProps) {
  const { t } = useTranslation();

  return (
    <div className="inline-flex rounded-lg bg-muted/50 p-1">
      {tabIds.map((tabId) => (
        <button
          key={tabId}
          onClick={() => onChange(tabId)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            activeTab === tabId
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {t(`settings.tabs.${tabId}`)}
        </button>
      ))}
    </div>
  );
}
