import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, containerClassName, className, ...props }, ref) => {
    return (
      <div className={cn('form-control w-full', containerClassName)}>
        {label && (
          <label className="label">
            <span className="label-text">{label}</span>
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'input input-bordered w-full',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'input-error',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-base-content/50">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <label className="label">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
