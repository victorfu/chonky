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
  showCloseButton?: boolean;
  maxHeight?: number;
}

export function BottomSheet({ isOpen, onClose, title, children, showCloseButton = true, maxHeight = 85 }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => { startY.current = e.touches[0].clientY; };
  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    if (diff > 0 && sheetRef.current) sheetRef.current.style.transform = `translateY(${diff}px)`;
  };
  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current;
    if (sheetRef.current) sheetRef.current.style.transform = '';
    if (diff > 100) onClose();
    startY.current = 0; currentY.current = 0;
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className={cn('absolute inset-0 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300', isOpen ? 'opacity-100' : 'opacity-0')} onClick={onClose} />
      <div
        ref={sheetRef}
        className={cn('glass-floating absolute bottom-0 left-0 right-0 rounded-t-2xl border-x border-t border-border-hairline shadow-floating transform transition-transform duration-300 ease-out', isOpen ? 'translate-y-0' : 'translate-y-full')}
        style={{ maxHeight: `${maxHeight}vh` }}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/35" />
        </div>
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b border-border-hairline px-4 pb-3">
            <h3 className="text-base font-semibold">{title}</h3>
            {showCloseButton && (
              <IconButton icon={<X className="w-5 h-5" />} variant="ghost" size="sm" onClick={onClose} aria-label="Close" />
            )}
          </div>
        )}
        <div className="overflow-y-auto" style={{ maxHeight: `calc(${maxHeight}vh - 80px)` }}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
