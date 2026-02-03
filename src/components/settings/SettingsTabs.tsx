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
    <div className="tabs tabs-boxed bg-base-200/50 p-1">
      {tabIds.map((tabId) => (
        <button
          key={tabId}
          onClick={() => onChange(tabId)}
          className={cn(
            'tab',
            activeTab === tabId && 'tab-active'
          )}
        >
          {t(`settings.tabs.${tabId}`)}
        </button>
      ))}
    </div>
  );
}
