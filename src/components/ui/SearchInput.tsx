import { Search, X } from 'lucide-react';
import { Input } from './Input';
import { cn } from '@/utils/cn';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
  autoFocus?: boolean;
}

export function SearchInput({ value, onChange, placeholder = 'Search...', onClear, className, autoFocus }: SearchInputProps) {
  const handleClear = () => { onChange(''); onClear?.(); };
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      leftIcon={<Search className="w-4 h-4" />}
      rightIcon={
        value ? (
          <button type="button" onClick={handleClear} className="p-1 hover:bg-muted rounded transition-colors" aria-label="Clear search">
            <X className="w-3 h-3" />
          </button>
        ) : undefined
      }
      className={cn('pr-8', className)}
      autoFocus={autoFocus}
    />
  );
}
