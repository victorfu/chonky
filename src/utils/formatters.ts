import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { zhTW, enUS, ja } from 'date-fns/locale';

const locales = { 'zh-TW': zhTW, 'en-US': enUS, 'ja-JP': ja };

export function formatDate(
  date: string | Date,
  formatStr: string = 'PPP',
  locale: string = 'zh-TW'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr, { locale: locales[locale as keyof typeof locales] || enUS });
}

export function formatRelativeTime(date: string | Date, locale: string = 'zh-TW'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isToday(d)) {
    return format(d, 'HH:mm');
  }
  if (isYesterday(d)) {
    return 'Yesterday';
  }

  return formatDistanceToNow(d, {
    addSuffix: true,
    locale: locales[locale as keyof typeof locales] || enUS,
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural || `${singular}s`;
}
