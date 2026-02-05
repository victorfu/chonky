import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsTabs, type SettingsTab } from './SettingsTabs';
import { GeneralSettings } from './GeneralSettings';
import { AppearanceSettings } from './AppearanceSettings';
import { ProfileSettings } from './ProfileSettings';

export function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 sm:px-6 py-4 bg-background">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">{t('settings.title')}</h1>
        <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-2xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
