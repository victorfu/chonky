import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useUIStore } from '@/stores/useUIStore';

export function KeyboardShortcuts() {
  const navigate = useNavigate();
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setCommandPaletteOpen = useUIStore((state) => state.setCommandPaletteOpen);
  const closeModal = useUIStore((state) => state.closeModal);
  const setPreviewPanelOpen = useUIStore((state) => state.setPreviewPanelOpen);

  useKeyboardShortcut([
    // Toggle sidebar (Cmd/Ctrl + B)
    {
      key: 'b',
      ctrlKey: true,
      callback: toggleSidebar,
    },
    // Open command palette (Cmd/Ctrl + K)
    {
      key: 'k',
      ctrlKey: true,
      callback: () => setCommandPaletteOpen(true),
    },
    // Open settings (Cmd/Ctrl + ,)
    {
      key: ',',
      ctrlKey: true,
      callback: () => navigate('/settings'),
    },
    // Close modal/panel (Escape)
    {
      key: 'Escape',
      callback: () => {
        closeModal();
        setPreviewPanelOpen(false);
        setCommandPaletteOpen(false);
      },
    },
  ]);

  return null;
}
