import { cn } from '@/utils/cn';
import { glassVariantClasses, type GlassVariant } from './glass';

interface CardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  surface?: 'surface' | 'glass';
  glassVariant?: GlassVariant;
  hover?: boolean;
  onClick?: () => void;
  className?: string;
}

const paddings = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' };
const shadows = { none: '', sm: 'shadow-sm', md: 'shadow-card', lg: 'shadow-card-hover' };

export function Card({
  children,
  padding = 'md',
  shadow = 'sm',
  surface = 'surface',
  glassVariant = 'regular',
  hover = false,
  onClick,
  className,
}: CardProps) {
  const Component = onClick ? 'button' : 'div';
  const surfaceClass =
    surface === 'glass'
      ? cn(glassVariantClasses[glassVariant], 'rounded-[12px] text-card-foreground')
      : 'rounded-[12px] border border-border-hairline bg-card text-card-foreground';

  return (
    <Component
      onClick={onClick}
      className={cn(
        surfaceClass,
        paddings[padding], shadows[shadow],
        hover && 'transition-shadow motion-safe:duration-200 hover:shadow-card-hover',
        onClick && 'w-full cursor-pointer text-left transition-all motion-safe:duration-200 hover:bg-accent/5 active:scale-[0.99]',
        className
      )}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-lg font-semibold', className)}>{children}</h3>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mt-4 pt-4 border-t', className)}>{children}</div>;
}
