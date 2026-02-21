import type { TFunction } from 'i18next';

export type AdminRouteId = 'knowledge-base' | 'settings';

export interface AdminRouteMeta {
  id: AdminRouteId;
  pattern: RegExp;
  titleKey: string;
  titleFallback: string;
  subtitleKey?: string;
  subtitleFallback?: string;
}

export const ADMIN_ROUTE_META: AdminRouteMeta[] = [
  {
    id: 'knowledge-base',
    pattern: /^\/admin\/knowledge-base\/?$/,
    titleKey: 'knowledgeBase.title',
    titleFallback: 'Knowledge Base',
    subtitleKey: 'search.tagline',
    subtitleFallback: 'Search our knowledge base',
  },
  {
    id: 'settings',
    pattern: /^\/admin\/settings\/?$/,
    titleKey: 'settings.title',
    titleFallback: 'Settings',
  },
];

const DEFAULT_ADMIN_ROUTE: AdminRouteMeta = ADMIN_ROUTE_META[0];

export function getAdminRouteMeta(pathname: string): AdminRouteMeta {
  return ADMIN_ROUTE_META.find((route) => route.pattern.test(pathname)) ?? DEFAULT_ADMIN_ROUTE;
}

export function getAdminRouteTitle(pathname: string, t: TFunction): string {
  const route = getAdminRouteMeta(pathname);
  return t(route.titleKey, route.titleFallback);
}

export function getAdminRouteSubtitle(pathname: string, t: TFunction): string | null {
  const route = getAdminRouteMeta(pathname);
  if (!route.subtitleKey) return null;
  return route.subtitleFallback
    ? t(route.subtitleKey, route.subtitleFallback)
    : t(route.subtitleKey);
}
