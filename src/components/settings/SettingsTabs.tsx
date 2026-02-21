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
    <div role="tablist" aria-label={t('settings.title')} className="inline-flex w-full rounded-xl border border-border-hairline bg-background-elevated/70 p-1 sm:w-auto">
      {tabIds.map((tabId) => (
        <button
          key={tabId}
          id={`settings-tab-${tabId}`}
          role="tab"
          type="button"
          tabIndex={activeTab === tabId ? 0 : -1}
          aria-selected={activeTab === tabId}
          aria-controls={`settings-panel-${tabId}`}
          onClick={() => onChange(tabId)}
          className={cn(
            'flex-1 rounded-[10px] px-3 py-2 text-sm font-medium transition-all motion-safe:duration-200 sm:flex-none',
            activeTab === tabId
              ? 'bg-accent text-white shadow-sm'
              : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
          )}
        >
          {t(`settings.tabs.${tabId}`)}
        </button>
      ))}
    </div>
  );
}
