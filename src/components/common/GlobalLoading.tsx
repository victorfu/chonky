import { useUIStore } from '@/stores/useUIStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function GlobalLoading() {
  const isLoading = useUIStore((state) => state.isGlobalLoading);
  const message = useUIStore((state) => state.globalLoadingMessage);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-background rounded-lg p-6 shadow-xl flex items-center gap-3">
        <LoadingSpinner size="md" />
        <span>{message || 'Loading...'}</span>
      </div>
    </div>
  );
}
