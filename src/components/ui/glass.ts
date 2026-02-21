export type GlassVariant = 'regular' | 'clear' | 'solid-fallback';

export const glassVariantClasses: Record<GlassVariant, string> = {
  regular: 'glass-regular',
  clear: 'glass-clear',
  'solid-fallback': 'border border-border-hairline bg-background-elevated/92',
};
