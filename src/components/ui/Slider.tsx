import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/utils/cn';

interface SliderProps {
  label?: string;
  showValue?: boolean;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export function Slider({ label, showValue = true, value = 0, min = 0, max = 100, step = 1, onChange, disabled, className }: SliderProps) {
  return (
    <div className="w-full space-y-2">
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <label className="text-sm font-medium leading-none">{label}</label>}
          {showValue && <span className="text-sm text-muted-foreground">{value}</span>}
        </div>
      )}
      <SliderPrimitive.Root
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([val]) => onChange?.(val)}
        disabled={disabled}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
      </SliderPrimitive.Root>
    </div>
  );
}
