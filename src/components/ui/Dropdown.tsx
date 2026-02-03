import { useState, useRef, useEffect, type ReactNode } from 'react';
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

const positions = {
  'bottom-start': 'dropdown-bottom dropdown-start',
  'bottom-end': 'dropdown-bottom dropdown-end',
  'top-start': 'dropdown-top dropdown-start',
  'top-end': 'dropdown-top dropdown-end',
};

export function Dropdown({
  trigger,
  items,
  position = 'bottom-end',
  closeOnSelect = true,
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    item.onClick();
    if (closeOnSelect) {
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className={cn('dropdown', positions[position], className)}>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        tabIndex={0}
        role="button"
      >
        {trigger}
      </div>
      {isOpen && (
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow-dropdown bg-base-100 rounded-lg w-52 border border-base-300"
        >
          {items.map((item) =>
            item.divider ? (
              <div key={item.id} className="my-1 h-px bg-base-300" />
            ) : (
              <li key={item.id}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(item);
                  }}
                  disabled={item.disabled}
                  className={cn(
                    'flex items-center gap-2 w-full',
                    item.danger && 'text-error hover:bg-error/10',
                    item.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
