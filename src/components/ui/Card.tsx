import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  className?: string;
}

const paddings = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' };
const shadows = { none: '', sm: 'shadow-sm', md: 'shadow-card', lg: 'shadow-card-hover' };

export function Card({ children, padding = 'md', shadow = 'sm', hover = false, onClick, className }: CardProps) {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      onClick={onClick}
      className={cn(
        'rounded-lg border bg-card text-card-foreground',
        paddings[padding], shadows[shadow],
        hover && 'transition-shadow hover:shadow-card-hover group',
        onClick && 'cursor-pointer text-left w-full',
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
