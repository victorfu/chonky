import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  'aria-label': string;
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

const sizes = {
  sm: 'btn-sm btn-square',
  md: 'btn-square',
  lg: 'btn-lg btn-square',
};

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
};

const tooltipPositions = {
  top: 'tooltip-top',
  bottom: 'tooltip-bottom',
  left: 'tooltip-left',
  right: 'tooltip-right',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { icon, size = 'md', variant = 'ghost', className, tooltip, tooltipPosition = 'top', ...props },
    ref
  ) => {
    const button = (
      <button
        ref={ref}
        className={cn('btn', variants[variant], sizes[size], className)}
        {...props}
      >
        {icon}
      </button>
    );

    if (tooltip) {
      return (
        <div className={cn('tooltip', tooltipPositions[tooltipPosition])} data-tip={tooltip}>
          {button}
        </div>
      );
    }

    return button;
  }
);

IconButton.displayName = 'IconButton';
