import { SendHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
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
    const content = value.trim();
    if (!content || isSending || disabled) {
      return;
    }
    void onSubmit(content);
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (!sendWithEnter) {
            return;
          }
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
          }
        }}
        autoGrow
        rows={1}
        maxHeight={220}
        disabled={isSending || disabled}
        placeholder={t('chatHome.composer.placeholder', 'Ask anything about your work...')}
        className="pr-16"
      />

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-base-content/50">
          {sendWithEnter
            ? t('chatHome.composer.hintEnter', 'Press Enter to send, Shift+Enter for new line.')
            : t('chatHome.composer.hintClick', 'Press the send button to submit your message.')}
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          loading={isSending}
          disabled={disabled || !value.trim()}
          rightIcon={<SendHorizontal className="h-4 w-4" />}
        >
          {t('chatHome.composer.send', 'Send')}
        </Button>
      </div>
    </div>
  );
}
