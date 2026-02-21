import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/utils/cn';

interface ToggleProps {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const switchSizes = {
  sm: { root: 'h-4 w-7', thumb: 'h-3 w-3 data-[state=checked]:translate-x-3' },
  md: { root: 'h-6 w-10', thumb: 'h-5 w-5 data-[state=checked]:translate-x-4' },
  lg: { root: 'h-7 w-12', thumb: 'h-6 w-6 data-[state=checked]:translate-x-5' },
};

export function Toggle({ label, description, size = 'md', checked, onChange, disabled, className }: ToggleProps) {
  const sizeStyle = switchSizes[size];

  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <SwitchPrimitive.Root
        className={cn(
          'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors motion-safe:duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-success data-[state=unchecked]:bg-muted shadow-inner',
          sizeStyle.root,
          className
        )}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'pointer-events-none block rounded-full bg-white shadow-sm ring-0 transition-transform data-[state=unchecked]:translate-x-0',
            sizeStyle.thumb
          )}
        />
      </SwitchPrimitive.Root>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-sm font-medium leading-none">{label}</span>}
          {description && <span className="text-sm text-muted-foreground">{description}</span>}
        </div>
      )}
    </label>
  );
}
