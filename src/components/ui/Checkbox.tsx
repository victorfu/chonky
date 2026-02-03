import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, indeterminate, onChange, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          ref={(el) => {
            if (el) {
              el.indeterminate = indeterminate || false;
            }
            if (typeof ref === 'function') {
              ref(el);
            } else if (ref) {
              ref.current = el;
            }
          }}
          type="checkbox"
          className={cn('checkbox checkbox-primary', className)}
          onChange={handleChange}
          {...props}
        />
        {label && <span className="label-text">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
