import type { ThemeMode } from '@/types';

class ThemeService {
  private mediaQuery: MediaQueryList | null;
  private listeners: Set<(theme: 'light' | 'dark') => void>;
  private currentTheme: ThemeMode;

  constructor() {
    if (typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', this.handleSystemChange);
    } else {
      this.mediaQuery = null;
    }
    this.listeners = new Set();
    this.currentTheme = 'light';
  }

  private handleSystemChange = (e: MediaQueryListEvent) => {
    if (this.currentTheme === 'auto') {
      const resolvedTheme = e.matches ? 'dark' : 'light';
      this.applyTheme(resolvedTheme);
      this.listeners.forEach((listener) => listener(resolvedTheme));
    }
  };

  getResolvedTheme(theme: ThemeMode): 'light' | 'dark' {
    if (theme === 'auto') {
      return this.mediaQuery?.matches ? 'dark' : 'light';
    }
    return theme;
  }

  applyTheme(resolvedTheme: 'light' | 'dark'): void {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        resolvedTheme === 'dark' ? '#1a1a1a' : '#F5F5F0'
      );
    }
  }

  setTheme(theme: ThemeMode): void {
    this.currentTheme = theme;
    const resolved = this.getResolvedTheme(theme);
    this.applyTheme(resolved);
  }

  subscribe(listener: (theme: 'light' | 'dark') => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  initialize(initialTheme: ThemeMode = 'light'): void {
    this.currentTheme = initialTheme;
    const resolved = this.getResolvedTheme(initialTheme);
    this.applyTheme(resolved);
  }
}

export const themeService = new ThemeService();
