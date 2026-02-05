import { ArrowRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Textarea } from '@/components/ui/Textarea';

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => Promise<void>;
  isSending: boolean;
  disabled?: boolean;
  sendWithEnter: boolean;
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  isSending,
  disabled = false,
  sendWithEnter,
}: ChatComposerProps) {
  const { t } = useTranslation();

  const handleSubmit = () => {
    if (isSending || disabled) return;
    if (!value.trim()) return;
    void onSubmit(value.trim());
  };

  const canSend = !!value.trim();

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow focus-within:shadow-md focus-within:border-primary/40">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (!sendWithEnter) return;
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
          }
        }}
        autoGrow
        rows={3}
        maxHeight={160}
        disabled={isSending || disabled}
        placeholder={t('chatHome.composer.placeholder', 'Ask a question...')}
        className="border-0 bg-transparent px-4 pt-4 pb-2 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <div className="flex items-center justify-end px-3 pb-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !canSend || isSending}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-30"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
