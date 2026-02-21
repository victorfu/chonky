import { useState, useMemo } from 'react';
import { Database, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { KnowledgeCard, KnowledgeCardInput } from '@/types';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { KnowledgeCardForm } from './KnowledgeCardForm';
import { KnowledgeCardListItem } from './KnowledgeCardListItem';
import { useKnowledgeStore } from '@/stores/useKnowledgeStore';
import { useToast } from '@/hooks/useToast';

export function KnowledgeBasePage() {
  const { t } = useTranslation();
  const toast = useToast();

  const cards = useKnowledgeStore((s) => s.cards);
  const isLoading = useKnowledgeStore((s) => s.isLoading);
  const editingCard = useKnowledgeStore((s) => s.editingCard);
  const setEditingCard = useKnowledgeStore((s) => s.setEditingCard);
  const addCard = useKnowledgeStore((s) => s.addCard);
  const updateCard = useKnowledgeStore((s) => s.updateCard);
  const deleteCard = useKnowledgeStore((s) => s.deleteCard);
  const toggleStatus = useKnowledgeStore((s) => s.toggleStatus);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredCards = useMemo(() => {
    if (!filterText.trim()) return cards;
    const lower = filterText.toLowerCase();
    return cards.filter(
      (card) =>
        card.title.toLowerCase().includes(lower) ||
        card.description.toLowerCase().includes(lower) ||
        card.category.toLowerCase().includes(lower) ||
        card.tags.some((tag) => tag.toLowerCase().includes(lower))
    );
  }, [cards, filterText]);

  const handleOpenCreate = () => {
    setEditingCard(null);
    setIsFormOpen(true);
  };

  const handleEdit = (card: KnowledgeCard) => {
    setEditingCard(card);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCard(null);
  };

  const handleSave = async (
    input: Omit<KnowledgeCardInput, 'createdBy'>
  ) => {
    try {
      if (editingCard) {
        await updateCard(editingCard.id, input);
      } else {
        await addCard(input);
      }
      toast.success(t('knowledgeBase.saveSuccess', 'Card saved successfully'));
    } catch {
      toast.error(t('knowledgeBase.saveError', 'Failed to save card'));
      throw new Error('save failed');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCard(deleteTarget);
      toast.success(
        t('knowledgeBase.deleteSuccess', 'Card deleted successfully')
      );
    } catch {
      toast.error(t('knowledgeBase.deleteError', 'Failed to delete card'));
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Page controls */}
      <div className="glass-regular rounded-2xl p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={filterText}
            onChange={setFilterText}
            placeholder={t('common.search', 'Search...')}
            className="w-full sm:max-w-xs"
          />
          <Button
            onClick={handleOpenCreate}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            {t('knowledgeBase.addCard', 'Add Card')}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-border-hairline/80 bg-background-elevated/65 p-4 shadow-card sm:p-6">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredCards.length === 0 ? (
          <EmptyState
            icon={<Database className="h-10 w-10" />}
            title={t('knowledgeBase.emptyState.title', 'No cards yet')}
            description={t(
              'knowledgeBase.emptyState.description',
              'Create your first knowledge card to get started.'
            )}
            action={
              <Button
                onClick={handleOpenCreate}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                {t('knowledgeBase.addCard', 'Add Card')}
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredCards.map((card) => (
              <KnowledgeCardListItem
                key={card.id}
                card={card}
                onEdit={handleEdit}
                onToggleStatus={(id) => void toggleStatus(id)}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form modal */}
      <KnowledgeCardForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        card={editingCard}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
        title={t('knowledgeBase.deleteConfirm.title', 'Delete Card')}
        message={t(
          'knowledgeBase.deleteConfirm.message',
          'Are you sure you want to delete this card? This action cannot be undone.'
        )}
        confirmText={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}
