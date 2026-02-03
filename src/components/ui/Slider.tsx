import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  showValue?: boolean;
  onChange?: (value: number) => void;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ label, showValue = true, onChange, className, value, min = 0, max = 100, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(Number(e.target.value));
    };

    return (
      <div className="form-control w-full">
        {(label || showValue) && (
          <label className="label">
            {label && <span className="label-text">{label}</span>}
            {showValue && <span className="label-text-alt">{value}</span>}
          </label>
        )}
        <input
          ref={ref}
          type="range"
          className={cn('range range-primary', className)}
          value={value}
          min={min}
          max={max}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';
