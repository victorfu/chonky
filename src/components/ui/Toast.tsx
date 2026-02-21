import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  action?: { label: string; onClick: () => void };
  onClose: () => void;
}

const icons = { success: CheckCircle, error: AlertCircle, warning: AlertTriangle, info: Info };
const styles = {
  success: 'border-success/35 bg-success/12 text-success',
  error: 'border-destructive/35 bg-destructive/12 text-destructive',
  warning: 'border-warning/35 bg-warning/14 text-warning',
  info: 'border-info/35 bg-info/14 text-info',
};

export function Toast({ type, message, action, onClose }: ToastProps) {
  const Icon = icons[type];
  return (
    <div className={cn('glass-floating flex items-center gap-3 rounded-xl border p-4 shadow-floating motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2', styles[type])}>
      <Icon className="w-5 h-5 shrink-0" />
      <span className="flex-1 text-sm text-foreground">{message}</span>
      <div className="flex gap-1">
        {action && (
          <button className="rounded-md px-2 py-1 text-sm font-medium transition-colors motion-safe:duration-200 hover:bg-accent/15" onClick={action.onClick}>
            {action.label}
          </button>
        )}
        <button className="rounded-md p-1 transition-colors motion-safe:duration-200 hover:bg-accent/15" onClick={onClose} aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
