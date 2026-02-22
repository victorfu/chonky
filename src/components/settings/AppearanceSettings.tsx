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
      <Card surface="surface">
        <h3 className="mb-4 text-base font-semibold">{t('settings.appearance.theme')}</h3>
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
                  'flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all motion-safe:duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
                  isSelected
                    ? 'glass-clear border-accent/45 text-accent'
                    : 'border-border-hairline bg-background-elevated/60 hover:border-accent/35'
                )}
              >
                <Icon className={cn('h-6 w-6', isSelected && 'text-accent')} />
                <span className={cn('text-sm font-medium', isSelected && 'text-accent')}>
                  {t(option.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {theme === 'auto'
            ? t('settings.appearance.currentThemeAuto', { theme: resolvedTheme })
            : t('settings.appearance.currentTheme', { theme })}
        </p>
      </Card>
    </div>
  );
}
