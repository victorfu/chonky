import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { themeService } from '@/services/theme';

export function useTheme() {
  const theme = useSettingsStore((state) => state.settings.appearance.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    themeService.getResolvedTheme(theme)
  );

  useEffect(() => {
    // Update resolved theme when theme changes
    setResolvedTheme(themeService.getResolvedTheme(theme));

    // Subscribe to system theme changes when in auto mode
    if (theme === 'auto') {
      const unsubscribe = themeService.subscribe((newTheme) => {
        setResolvedTheme(newTheme);
      });
      return unsubscribe;
    }
  }, [theme]);

  return {
    theme,
    resolvedTheme,
    setTheme,
    isDark: resolvedTheme === 'dark',
  };
}
