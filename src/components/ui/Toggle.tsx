import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (checked: boolean) => void;
}

const sizes = {
  sm: 'toggle-sm',
  md: '',
  lg: 'toggle-lg',
};

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, description, size = 'md', onChange, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          className={cn('toggle toggle-primary', sizes[size], className)}
          onChange={handleChange}
          {...props}
        />
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="label-text font-medium">{label}</span>}
            {description && (
              <span className="label-text-alt text-base-content/60">{description}</span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';
