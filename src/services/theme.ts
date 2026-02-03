import type { ThemeMode } from '@/types';
import { getStorageKey } from '@/constants';

class ThemeService {
  private mediaQuery: MediaQueryList;
  private listeners: Set<(theme: 'light' | 'dark') => void>;

  constructor() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.listeners = new Set();

    this.mediaQuery.addEventListener('change', this.handleSystemChange);
  }

  private handleSystemChange = (e: MediaQueryListEvent) => {
    const savedTheme = this.getSavedTheme();
    if (savedTheme === 'auto') {
      const resolvedTheme = e.matches ? 'dark' : 'light';
      this.applyTheme(resolvedTheme);
      this.listeners.forEach((listener) => listener(resolvedTheme));
    }
  };

  getSavedTheme(): ThemeMode {
    try {
      const saved = localStorage.getItem(getStorageKey('THEME'));
      if (saved === 'light' || saved === 'dark' || saved === 'auto') {
        return saved;
      }
    } catch {
      // Ignore localStorage errors
    }
    return 'light';
  }

  saveTheme(theme: ThemeMode): void {
    try {
      localStorage.setItem(getStorageKey('THEME'), theme);
    } catch {
      // Ignore localStorage errors
    }
  }

  getResolvedTheme(theme: ThemeMode): 'light' | 'dark' {
    if (theme === 'auto') {
      return this.mediaQuery.matches ? 'dark' : 'light';
    }
    return theme;
  }

  applyTheme(resolvedTheme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
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
    this.saveTheme(theme);
    const resolved = this.getResolvedTheme(theme);
    this.applyTheme(resolved);
  }

  subscribe(listener: (theme: 'light' | 'dark') => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  initialize(): void {
    const savedTheme = this.getSavedTheme();
    const resolved = this.getResolvedTheme(savedTheme);
    this.applyTheme(resolved);
  }
}

export const themeService = new ThemeService();
