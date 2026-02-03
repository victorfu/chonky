import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'warning';
  loading?: boolean;
}

const icons = {
  default: Info,
  danger: AlertCircle,
  warning: AlertTriangle,
};

const iconStyles = {
  default: 'text-info',
  danger: 'text-error',
  warning: 'text-warning',
};

const confirmVariants = {
  default: 'primary' as const,
  danger: 'danger' as const,
  warning: 'primary' as const,
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const Icon = icons[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${iconStyles[variant]} bg-base-200`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-base-content/70 mb-6">{message}</p>
        <div className="flex gap-2 w-full">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariants[variant]}
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
