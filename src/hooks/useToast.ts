import { useCallback } from 'react';
import { useUIStore } from '@/stores/useUIStore';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  const addToast = useUIStore((state) => state.addToast);
  const removeToast = useUIStore((state) => state.removeToast);

  const toast = useCallback(
    (message: string, type: ToastType = 'info', options?: ToastOptions) => {
      return addToast({
        message,
        type,
        duration: options?.duration,
        action: options?.action,
      });
    },
    [addToast]
  );

  const success = useCallback(
    (message: string, options?: ToastOptions) => toast(message, 'success', options),
    [toast]
  );

  const error = useCallback(
    (message: string, options?: ToastOptions) => toast(message, 'error', options),
    [toast]
  );

  const warning = useCallback(
    (message: string, options?: ToastOptions) => toast(message, 'warning', options),
    [toast]
  );

  const info = useCallback(
    (message: string, options?: ToastOptions) => toast(message, 'info', options),
    [toast]
  );

  return {
    toast,
    success,
    error,
    warning,
    info,
    remove: removeToast,
  };
}
