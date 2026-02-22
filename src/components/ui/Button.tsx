import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[6px] text-sm font-medium transition-all motion-safe:duration-200 ease-decelerate focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-accent text-white shadow-sm hover:bg-accent/90 active:scale-[0.98] active:opacity-90',
        secondary: 'border border-border-hairline bg-background-elevated/88 shadow-sm hover:bg-accent/8 active:scale-[0.98] active:opacity-90 active:shadow-inner-pressed',
        outline: 'border border-border-hairline bg-transparent text-foreground hover:bg-accent/8',
        ghost: 'hover:bg-accent/10 hover:text-accent-foreground',
        destructive: 'bg-destructive text-white shadow-sm hover:bg-destructive/90 active:scale-[0.98] active:opacity-90',
        link: 'text-accent underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 py-2',
        lg: 'h-10 px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Keep backward-compatible variant names
type LegacyVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
type NonLegacyButtonVariant = Exclude<ButtonVariant, null | undefined>;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, Omit<VariantProps<typeof buttonVariants>, 'variant'> {
  variant?: LegacyVariant | NonLegacyButtonVariant;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  asChild?: boolean;
}

function resolveVariant(variant: ButtonProps['variant']): NonLegacyButtonVariant {
  switch (variant) {
    case 'primary':
      return 'default';
    case 'danger':
      return 'destructive';
    case 'secondary':
    case 'outline':
    case 'ghost':
    case 'default':
    case 'destructive':
    case 'link':
      return variant;
    default:
      return 'default';
  }
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', type = 'button', loading = false, leftIcon, rightIcon, disabled, className, children, asChild = false, ...props }, ref) => {
    const mappedVariant = resolveVariant(variant);

    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant: mappedVariant, size, className }))}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant: mappedVariant, size, className }))}
        disabled={disabled || loading}
        type={type}
        {...props}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          <span className="mr-1">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !loading && <span className="ml-1">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
