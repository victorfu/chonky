import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  'aria-label': string;
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

const sizeMap = {
  sm: 'h-8 w-8' as const,
  md: 'h-10 w-10' as const,
  lg: 'h-11 w-11' as const,
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', variant = 'ghost', className, tooltip, type = 'button', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size="icon"
        className={cn(sizeMap[size], className)}
        title={tooltip}
        type={type}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';
