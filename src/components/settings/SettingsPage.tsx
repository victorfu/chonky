import { useState } from 'react';
import { SettingsTabs, type SettingsTab } from './SettingsTabs';
import { GeneralSettings } from './GeneralSettings';
import { AppearanceSettings } from './AppearanceSettings';
import { ProfileSettings } from './ProfileSettings';

export function SettingsPage() {
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
    <div className="flex h-full flex-col gap-4">
      <div className="glass-regular rounded-2xl p-2 sm:p-3">
        <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-border-hairline/80 bg-background-elevated/65 p-4 shadow-card sm:p-6">
        <div
          id={`settings-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`settings-tab-${activeTab}`}
          className="mx-auto w-full max-w-3xl"
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
