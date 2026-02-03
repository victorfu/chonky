import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

const variants = {
  default: 'badge-ghost',
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
};

const sizes = {
  sm: 'badge-sm',
  md: '',
  lg: 'badge-lg',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  removable = false,
  onRemove,
  className,
}: BadgeProps) {
  return (
    <span className={cn('badge gap-1', variants[variant], sizes[size], className)}>
      {children}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="hover:bg-base-content/20 rounded-full p-0.5"
          aria-label="Remove"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
