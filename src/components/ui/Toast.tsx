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
  success: 'border-success/30 bg-success/10 text-success',
  error: 'border-destructive/30 bg-destructive/10 text-destructive',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  info: 'border-info/30 bg-info/10 text-info',
};

export function Toast({ type, message, action, onClose }: ToastProps) {
  const Icon = icons[type];
  return (
    <div className={cn('flex items-center gap-3 rounded-lg border p-4 shadow-lg', styles[type])}>
      <Icon className="w-5 h-5 shrink-0" />
      <span className="flex-1 text-sm text-foreground">{message}</span>
      <div className="flex gap-1">
        {action && (
          <button className="rounded-md px-2 py-1 text-sm font-medium hover:bg-accent transition-colors" onClick={action.onClick}>
            {action.label}
          </button>
        )}
        <button className="rounded-md p-1 hover:bg-accent transition-colors" onClick={onClose} aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
