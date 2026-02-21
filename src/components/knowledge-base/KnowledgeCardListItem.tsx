import { Edit2, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { zhTW, enUS, ja } from 'date-fns/locale';
import type { KnowledgeCard } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { useSettingsStore } from '@/stores/useSettingsStore';

interface KnowledgeCardListItemProps {
  card: KnowledgeCard;
  onEdit: (card: KnowledgeCard) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

const DATE_LOCALES = {
  'zh-TW': zhTW,
  'en-US': enUS,
  'ja-JP': ja,
} as const;

export function KnowledgeCardListItem({
  card,
  onEdit,
  onToggleStatus,
  onDelete,
}: KnowledgeCardListItemProps) {
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.settings.general.language);
  const dateLocale = DATE_LOCALES[language] || enUS;

  const timeAgo = formatDistanceToNow(new Date(card.updatedAt), {
    addSuffix: true,
    locale: dateLocale,
  });

  return (
    <div className="group flex items-center gap-4 rounded-[12px] border border-border-hairline bg-card p-4 shadow-sm transition-all motion-safe:duration-200 hover:-translate-y-0.5 hover:shadow-card">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold">{card.title}</h3>
          <Badge
            variant={card.status === 'published' ? 'success' : 'default'}
            size="sm"
          >
            {card.status === 'published'
              ? t('knowledgeBase.form.published', 'Published')
              : t('knowledgeBase.form.draft', 'Draft')}
          </Badge>
        </div>

        {card.description && (
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {card.description}
          </p>
        )}

        <div className="mt-2 flex items-center gap-2">
          {card.category && (
            <Badge variant="primary" size="sm">
              {card.category}
            </Badge>
          )}
          {card.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" size="sm">
              {tag}
            </Badge>
          ))}
          {card.tags.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{card.tags.length - 3}
            </span>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {t('common.updated', 'Updated')} {timeAgo}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <IconButton
          icon={<Edit2 className="h-4 w-4" />}
          variant="ghost"
          size="md"
          className="h-11 w-11"
          aria-label={t('common.edit', 'Edit')}
          onClick={() => onEdit(card)}
        />
        <IconButton
          icon={
            card.status === 'published' ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )
          }
          variant="ghost"
          size="md"
          className="h-11 w-11"
          aria-label={
            card.status === 'published'
              ? t('knowledgeBase.unpublish', 'Unpublish')
              : t('knowledgeBase.publish', 'Publish')
          }
          onClick={() => onToggleStatus(card.id)}
        />
        <IconButton
          icon={<Trash2 className="h-4 w-4 text-destructive" />}
          variant="ghost"
          size="md"
          className="h-11 w-11"
          aria-label={t('common.delete', 'Delete')}
          onClick={() => onDelete(card.id)}
        />
      </div>
    </div>
  );
}
