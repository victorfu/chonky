import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { IconButton } from './IconButton';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Show close button in header */
  showCloseButton?: boolean;
  /** Maximum height as percentage of viewport */
  maxHeight?: number;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  maxHeight = 85,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Touch handlers for swipe to close
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current;

    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }

    // Close if swiped down more than 100px
    if (diff > 100) {
      onClose();
    }

    startY.current = 0;
    currentY.current = 0;
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-base-100 rounded-t-2xl shadow-xl',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{ maxHeight: `${maxHeight}vh` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-base-300 rounded-full" />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 pb-3 border-b border-base-300">
            <h3 className="text-lg font-semibold">{title}</h3>
            {showCloseButton && (
              <IconButton
                icon={<X className="w-5 h-5" />}
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close"
              />
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: `calc(${maxHeight}vh - 80px)` }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
