import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/utils/cn';

interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, position = 'top', children, className }: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>
        <span className={className}>{children}</span>
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Content
        side={position}
        sideOffset={8}
        className={cn(
          'glass-floating z-50 overflow-hidden rounded-[10px] px-3 py-1.5 text-xs text-popover-foreground shadow-dropdown motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95',
        )}
      >
        {content}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  );
}
