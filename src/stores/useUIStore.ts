import { create } from 'zustand';

interface ModalState {
  isOpen: boolean;
  type: string | null;
  data?: unknown;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface UIStore {
  // Sidebar
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;

  // Modal
  modal: ModalState;
  openModal: (type: string, data?: unknown) => void;
  closeModal: () => void;

  // Toast
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;

  // Global Loading
  isGlobalLoading: boolean;
  globalLoadingMessage: string | null;
  setGlobalLoading: (loading: boolean, message?: string) => void;

  // Document view mode
  documentViewMode: 'list' | 'grid';
  setDocumentViewMode: (mode: 'list' | 'grid') => void;

  // Command palette
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Preview panel
  isPreviewPanelOpen: boolean;
  setPreviewPanelOpen: (open: boolean) => void;
}

let nextToastId = 0;
const toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const useUIStore = create<UIStore>((set) => ({
  // Sidebar
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  toggleSidebar: () => {
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }));
  },
  setSidebarCollapsed: (collapsed) => {
    set({ isSidebarCollapsed: collapsed });
  },
  setMobileSidebarOpen: (open) => {
    set({ isMobileSidebarOpen: open });
  },

  // Modal
  modal: { isOpen: false, type: null },
  openModal: (type, data) => {
    set({ modal: { isOpen: true, type, data } });
  },
  closeModal: () => {
    set({ modal: { isOpen: false, type: null, data: undefined } });
  },

  // Toast
  toasts: [],
  addToast: (toast) => {
    const id = String(++nextToastId);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      const timerId = setTimeout(() => {
        toastTimers.delete(id);
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
      toastTimers.set(id, timerId);
    }

    return id;
  },
  removeToast: (id) => {
    const timerId = toastTimers.get(id);
    if (timerId != null) {
      clearTimeout(timerId);
      toastTimers.delete(id);
    }
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  // Global Loading
  isGlobalLoading: false,
  globalLoadingMessage: null,
  setGlobalLoading: (loading, message) => {
    set({
      isGlobalLoading: loading,
      globalLoadingMessage: message || null,
    });
  },

  // Document view mode
  documentViewMode: 'list',
  setDocumentViewMode: (mode) => {
    set({ documentViewMode: mode });
  },

  // Command palette
  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => {
    set({ isCommandPaletteOpen: open });
  },

  // Preview panel
  isPreviewPanelOpen: false,
  setPreviewPanelOpen: (open) => {
    set({ isPreviewPanelOpen: open });
  },
}));
