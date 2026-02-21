import { useState, useEffect } from 'react';
import { ImagePlus, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { KnowledgeCard, KnowledgeCardInput, CardStatus } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Badge } from '@/components/ui/Badge';

interface KnowledgeCardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: Omit<KnowledgeCardInput, 'createdBy'>) => Promise<void>;
  card?: KnowledgeCard | null;
}

const EMPTY_FORM = {
  title: '',
  description: '',
  content: '',
  category: '',
  tags: [] as string[],
  imageUrl: null as string | null,
  metadata: {} as Record<string, string>,
  status: 'draft' as CardStatus,
};

export function KnowledgeCardForm({
  isOpen,
  onClose,
  onSave,
  card,
}: KnowledgeCardFormProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [tagInput, setTagInput] = useState('');
  const [metaKey, setMetaKey] = useState('');
  const [metaValue, setMetaValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!card;

  useEffect(() => {
    if (card) {
      setForm({
        title: card.title,
        description: card.description,
        content: card.content,
        category: card.category,
        tags: [...card.tags],
        imageUrl: card.imageUrl,
        metadata: { ...card.metadata },
        status: card.status,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setTagInput('');
    setMetaKey('');
    setMetaValue('');
  }, [card, isOpen]);

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const handleAddMeta = () => {
    const key = metaKey.trim();
    const value = metaValue.trim();
    if (key && value) {
      setForm({ ...form, metadata: { ...form.metadata, [key]: value } });
      setMetaKey('');
      setMetaValue('');
    }
  };

  const handleRemoveMeta = (key: string) => {
    const nextMetadata = { ...form.metadata };
    delete nextMetadata[key];
    setForm({ ...form, metadata: nextMetadata });
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setIsSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (error) {
      console.error('Failed to save card:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditing
          ? t('knowledgeBase.editCard', 'Edit Card')
          : t('knowledgeBase.addCard', 'Add Card')
      }
      size="lg"
      className="max-h-[85vh] overflow-y-auto"
    >
      <div className="space-y-4">
        <Input
          label={t('knowledgeBase.form.title', 'Title')}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder={t('knowledgeBase.form.title', 'Title')}
        />

        <Textarea
          label={t('knowledgeBase.form.description', 'Description')}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder={t('knowledgeBase.form.description', 'Description')}
          rows={2}
        />

        <Textarea
          label={t('knowledgeBase.form.content', 'Content')}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder={t('knowledgeBase.form.content', 'Content')}
          rows={6}
        />

        <Input
          label={t('knowledgeBase.form.category', 'Category')}
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder={t('knowledgeBase.form.category', 'Category')}
        />

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t('knowledgeBase.form.tags', 'Tags')}
          </label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder={t(
                'knowledgeBase.form.tagsPlaceholder',
                'Add a tag and press Enter'
              )}
              containerClassName="flex-1"
            />
            <Button variant="secondary" size="icon" onClick={handleAddTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map((tag) => (
                <Badge key={tag} removable onRemove={() => handleRemoveTag(tag)}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Image URL */}
        <Input
          label={t('knowledgeBase.form.image', 'Image URL')}
          value={form.imageUrl || ''}
          onChange={(e) =>
            setForm({ ...form, imageUrl: e.target.value || null })
          }
          placeholder="https://..."
          leftIcon={<ImagePlus className="h-4 w-4" />}
        />

        {/* Metadata */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t('knowledgeBase.form.metadata', 'Metadata')}
          </label>
          <div className="flex gap-2">
            <Input
              value={metaKey}
              onChange={(e) => setMetaKey(e.target.value)}
              placeholder="Key"
              containerClassName="flex-1"
            />
            <Input
              value={metaValue}
              onChange={(e) => setMetaValue(e.target.value)}
              placeholder="Value"
              containerClassName="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMeta();
                }
              }}
            />
            <Button variant="secondary" size="icon" onClick={handleAddMeta}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {Object.entries(form.metadata).length > 0 && (
            <div className="space-y-1">
              {Object.entries(form.metadata).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5 text-sm"
                >
                  <span className="font-medium">{key}:</span>
                  <span className="flex-1 text-muted-foreground">{value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMeta(key)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <Toggle
          label={t('knowledgeBase.form.published', 'Published')}
          description={
            form.status === 'published'
              ? t('knowledgeBase.form.publishedDesc', 'Visible in search results')
              : t('knowledgeBase.form.draftDesc', 'Hidden from search results')
          }
          checked={form.status === 'published'}
          onChange={(checked) =>
            setForm({ ...form, status: checked ? 'published' : 'draft' })
          }
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isSaving}
            disabled={!form.title.trim()}
          >
            {t('common.save', 'Save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
