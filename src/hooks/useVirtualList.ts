import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface UseVirtualListOptions<T> {
  items: T[];
  estimateSize: number;
  overscan?: number;
}

export function useVirtualList<T>({
  items,
  estimateSize,
  overscan = 5,
}: UseVirtualListOptions<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  return {
    parentRef,
    virtualizer,
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
  };
}

// Horizontal virtual list
interface UseHorizontalVirtualListOptions<T> {
  items: T[];
  estimateSize: number;
  overscan?: number;
}

export function useHorizontalVirtualList<T>({
  items,
  estimateSize,
  overscan = 5,
}: UseHorizontalVirtualListOptions<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    horizontal: true,
  });

  return {
    parentRef,
    virtualizer,
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
  };
}
