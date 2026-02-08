export interface KeyboardShortcut {
  id: string;
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  description: string;
  category: 'global' | 'chat';
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // Global
  {
    id: 'toggle-sidebar',
    key: 'b',
    ctrlKey: true,
    description: 'Toggle sidebar',
    category: 'global',
  },
  {
    id: 'open-settings',
    key: ',',
    ctrlKey: true,
    description: 'Open settings',
    category: 'global',
  },
  {
    id: 'search',
    key: 'k',
    ctrlKey: true,
    description: 'Open search',
    category: 'global',
  },
  {
    id: 'close-modal',
    key: 'Escape',
    description: 'Close modal/panel',
    category: 'global',
  },

  // Chat
  {
    id: 'new-chat',
    key: 'n',
    ctrlKey: true,
    description: 'New conversation',
    category: 'chat',
  },
  {
    id: 'focus-input',
    key: '/',
    description: 'Focus chat input',
    category: 'chat',
  },

];

export function getShortcutDisplay(shortcut: KeyboardShortcut): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
  const parts: string[] = [];

  if (shortcut.ctrlKey || shortcut.metaKey) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shiftKey) {
    parts.push(isMac ? '⇧' : 'Shift');
  }

  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? '' : '+');
}
