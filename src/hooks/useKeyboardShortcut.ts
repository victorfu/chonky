import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  preventDefault?: boolean;
}

export function useKeyboardShortcut(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Only allow Escape in inputs
        if (event.key !== 'Escape') {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        const ctrlOrMeta = shortcut.ctrlKey || shortcut.metaKey;
        const isCtrlOrMetaPressed = event.ctrlKey || event.metaKey;

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          (!ctrlOrMeta || isCtrlOrMetaPressed) &&
          (!shortcut.shiftKey || event.shiftKey) &&
          (!shortcut.altKey || event.altKey)
        ) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.callback();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Hook for a single shortcut
export function useSingleKeyboardShortcut(
  key: string,
  callback: () => void,
  options?: Omit<ShortcutConfig, 'key' | 'callback'>
) {
  useKeyboardShortcut([{ key, callback, ...options }]);
}
