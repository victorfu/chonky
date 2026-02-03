import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'alert-success',
  error: 'alert-error',
  warning: 'alert-warning',
  info: 'alert-info',
};

export function Toast({ type, message, action, onClose }: ToastProps) {
  const Icon = icons[type];

  return (
    <div className={cn('alert shadow-lg', styles[type])}>
      <Icon className="w-5 h-5" />
      <span>{message}</span>
      <div className="flex gap-2">
        {action && (
          <button
            className="btn btn-sm btn-ghost"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )}
        <button
          className="btn btn-sm btn-ghost btn-square"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
