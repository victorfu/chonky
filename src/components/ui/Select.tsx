import { forwardRef, type SelectHTMLAttributes } from 'react';
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
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Inline mode - removes form-control wrapper and full width */
  inline?: boolean;
}

const sizeClasses = {
  xs: 'select-xs',
  sm: 'select-sm',
  md: '',
  lg: 'select-lg',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, onChange, className, size = 'md', inline = false, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    const selectElement = (
      <select
        ref={ref}
        className={cn(
          'select select-bordered',
          sizeClasses[size],
          !inline && 'w-full',
          error && 'select-error',
          className
        )}
        onChange={handleChange}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    );

    // Inline mode - just return the select without wrapper
    if (inline) {
      return selectElement;
    }

    // Form mode - with wrapper, label, and error
    return (
      <div className="form-control w-full">
        {label && (
          <label className="label">
            <span className="label-text">{label}</span>
          </label>
        )}
        {selectElement}
        {error && (
          <label className="label">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
