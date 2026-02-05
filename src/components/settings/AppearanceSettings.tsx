import { Sun, Moon, Monitor } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';
import type { ThemeMode } from '@/types';

const themeOptions: { id: ThemeMode; labelKey: string; icon: typeof Sun }[] = [
  { id: 'light', labelKey: 'settings.appearance.light', icon: Sun },
  { id: 'dark', labelKey: 'settings.appearance.dark', icon: Moon },
  { id: 'auto', labelKey: 'settings.appearance.system', icon: Monitor },
];

export function AppearanceSettings() {
  const { t } = useTranslation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { error } = useToast();

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold mb-4">{t('settings.appearance.theme')}</h3>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.id;

            return (
              <button
                key={option.id}
                onClick={() => {
                  void setTheme(option.id).catch((err) => {
                    error(
                      err instanceof Error
                        ? err.message
                        : t('settings.general.updateError', 'Failed to update settings')
                    );
                  });
                }}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <Icon className={cn('w-6 h-6', isSelected && 'text-primary')} />
                <span className={cn('text-sm font-medium', isSelected && 'text-primary')}>
                  {t(option.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          {theme === 'auto'
            ? t('settings.appearance.currentThemeAuto', { theme: resolvedTheme })
            : t('settings.appearance.currentTheme', { theme })}
        </p>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">{t('settings.appearance.preview')}</h3>
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="mb-2">
            {t('settings.appearance.previewText')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('settings.appearance.previewSmallText')}
          </p>
        </div>
      </Card>
    </div>
  );
}
