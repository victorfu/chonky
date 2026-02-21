import { useTranslation } from 'react-i18next';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useToast } from '@/hooks/useToast';
import type { Language } from '@/types';

const languageOptions = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'ja-JP', label: '日本語' },
];

export function GeneralSettings() {
  const { t } = useTranslation();
  const settings = useSettingsStore((state) => state.settings);
  const updateGeneralSettings = useSettingsStore((state) => state.updateGeneralSettings);
  const { error } = useToast();

  const handleLanguageChange = async (value: string) => {
    const lang = value as Language;
    try {
      await updateGeneralSettings({ language: lang });
    } catch (err) {
      error(
        err instanceof Error
          ? err.message
          : t('settings.general.updateError', 'Failed to update settings')
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-4" surface="surface">
        <h3 className="text-base font-semibold">{t('settings.general.languageRegion')}</h3>
        <Select
          label={t('settings.general.language')}
          value={settings.general.language}
          onChange={(value) => {
            void handleLanguageChange(value);
          }}
          options={languageOptions}
        />
      </Card>

    </div>
  );
}
