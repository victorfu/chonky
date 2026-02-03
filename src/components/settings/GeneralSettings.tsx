import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { exportData, importData } from '@/services/storage';
import { useToast } from '@/hooks/useToast';
import type { Language } from '@/types';

const languageOptions = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'ja-JP', label: '日本語' },
];

function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function GeneralSettings() {
  const { t, i18n } = useTranslation();
  const settings = useSettingsStore((state) => state.settings);
  const updateGeneralSettings = useSettingsStore((state) => state.updateGeneralSettings);
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLanguageChange = (value: string) => {
    const lang = value as Language;
    updateGeneralSettings({ language: lang });
    i18n.changeLanguage(lang);
  };

  const handleExport = () => {
    try {
      const data = exportData();
      downloadJson(data, `chonky-export-${new Date().toISOString().split('T')[0]}.json`);
      success('Data exported successfully');
    } catch {
      error('Failed to export data');
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = importData(data);
      if (result) {
        success('Data imported successfully. Please refresh the page.');
      } else {
        error('Failed to import data');
      }
    } catch {
      error('Invalid file format');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold mb-4">{t('settings.general.languageRegion')}</h3>
        <Select
          label={t('settings.general.language')}
          value={settings.general.language}
          onChange={handleLanguageChange}
          options={languageOptions}
        />
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">{t('settings.general.dataManagement')}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg">
            <div>
              <p className="font-medium">{t('settings.general.exportData')}</p>
              <p className="text-sm text-base-content/60">
                {t('settings.general.exportDataDesc')}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExport}
            >
              {t('common.export')}
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg">
            <div>
              <p className="font-medium">{t('settings.general.importData')}</p>
              <p className="text-sm text-base-content/60">
                {t('settings.general.importDataDesc')}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={handleImport}
            >
              {t('common.import')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
