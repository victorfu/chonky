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
        sideOffset={4}
        className={cn(
          'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
        )}
      >
        {content}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  );
}
