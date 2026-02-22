import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'size'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  inline?: boolean;
}

const sizeClasses = {
  xs: 'h-8 text-xs',
  sm: 'h-9 text-sm',
  md: 'h-10 text-sm',
  lg: 'h-12 text-base',
};

const iconSizeClasses = {
  xs: 'size-3.5',
  sm: 'size-4',
  md: 'size-4',
  lg: 'size-5',
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, onChange, className, size = 'md', inline = false, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    const selectElement = (
      <div className={cn('relative', !inline && 'w-full')}>
        <select
          ref={ref}
          className={cn(
            'appearance-none flex items-center rounded-[6px] border border-border-hairline bg-background/50 px-3 pr-8 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
            sizeClasses[size],
            !inline && 'w-full',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          onChange={handleChange}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className={cn('pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground', iconSizeClasses[size])} />
      </div>
    );

    if (inline) return selectElement;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none">{label}</label>
        )}
        {selectElement}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export { Select };
