import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MessageSquareText,
  Settings,
  Search,
} from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/cn';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export function CommandPalette() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isOpen = useUIStore((state) => state.isCommandPaletteOpen);
  const setOpen = useUIStore((state) => state.setCommandPaletteOpen);

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: 'nav-chat',
        title: t('commandPalette.goToChat', 'Go to Chat'),
        icon: <MessageSquareText className="w-4 h-4" />,
        action: () => navigate('/'),
        category: t('commandPalette.navigation'),
      },
{
        id: 'nav-settings',
        title: t('commandPalette.goToSettings'),
        icon: <Settings className="w-4 h-4" />,
        action: () => navigate('/settings'),
        category: t('commandPalette.navigation'),
      },
    ],
    [navigate, t]
  );

  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    const lower = search.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(lower) ||
        cmd.description?.toLowerCase().includes(lower)
    );
  }, [commands, search]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          setOpen(false);
        }
        break;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setOpen(false)} size="md" showCloseButton={false}>
      <div onKeyDown={handleKeyDown}>
        <Input
          leftIcon={<Search className="w-4 h-4" />}
          placeholder={t('commandPalette.placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <div className="mt-4 max-h-80 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">{t('commandPalette.noResults')}</p>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                    index === selectedIndex
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <span className={index === selectedIndex ? 'text-primary-foreground' : 'text-muted-foreground'}>
                    {cmd.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{cmd.title}</div>
                    {cmd.description && (
                      <div className={cn(
                        'text-sm truncate',
                        index === selectedIndex ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
                      )}>
                        {cmd.description}
                      </div>
                    )}
                  </div>
                  <span className={cn(
                    'text-xs',
                    index === selectedIndex ? 'text-primary-foreground/70' : 'text-muted-foreground/60'
                  )}>
                    {cmd.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
