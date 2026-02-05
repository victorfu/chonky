import { type ReactNode } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/utils/cn';

interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  position?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  closeOnSelect?: boolean;
  className?: string;
}

const alignMap: Record<string, 'start' | 'end'> = {
  'bottom-start': 'start', 'bottom-end': 'end', 'top-start': 'start', 'top-end': 'end',
};
const sideMap: Record<string, 'bottom' | 'top'> = {
  'bottom-start': 'bottom', 'bottom-end': 'bottom', 'top-start': 'top', 'top-end': 'top',
};

export function Dropdown({ trigger, items, position = 'bottom-end', className }: DropdownProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        {trigger}
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          side={sideMap[position]}
          align={alignMap[position]}
          sideOffset={4}
          className={cn(
            'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-dropdown animate-in fade-in-0 zoom-in-95',
            className
          )}
        >
          {items.map((item) =>
            item.divider ? (
              <DropdownMenuPrimitive.Separator key={item.id} className="my-1 h-px bg-border" />
            ) : (
              <DropdownMenuPrimitive.Item
                key={item.id}
                disabled={item.disabled}
                onSelect={item.onClick}
                className={cn(
                  'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                  item.danger && 'text-destructive focus:bg-destructive/10 focus:text-destructive'
                )}
              >
                {item.icon}
                {item.label}
              </DropdownMenuPrimitive.Item>
            )
          )}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
