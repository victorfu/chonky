import { forwardRef, type TextareaHTMLAttributes, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  autoGrow?: boolean;
  maxHeight?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, autoGrow = false, maxHeight = 200, className, onChange, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    const adjustHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea && autoGrow) {
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, maxHeight);
        textarea.style.height = `${newHeight}px`;
      }
    }, [autoGrow, maxHeight, textareaRef]);

    useEffect(() => {
      adjustHeight();
    }, [adjustHeight, props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e);
      if (autoGrow) {
        adjustHeight();
      }
    };

    return (
      <div className="form-control w-full">
        {label && (
          <label className="label">
            <span className="label-text">{label}</span>
          </label>
        )}
        <textarea
          ref={textareaRef}
          className={cn(
            'textarea textarea-bordered w-full resize-none',
            error && 'textarea-error',
            className
          )}
          onChange={handleChange}
          {...props}
        />
        {error && (
          <label className="label">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
