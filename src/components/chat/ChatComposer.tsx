import { useCallback, useRef } from 'react';
import { SendHorizontal, Paperclip, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChatMessageAttachment } from '@/types';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/utils/cn';

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => Promise<void>;
  isSending: boolean;
  disabled?: boolean;
  sendWithEnter: boolean;
  attachment: ChatMessageAttachment | null;
  onAttach: (attachment: ChatMessageAttachment) => void;
  onRemoveAttachment: () => void;
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  isSending,
  disabled = false,
  sendWithEnter,
  attachment,
  onAttach,
  onRemoveAttachment,
}: ChatComposerProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (isSending || disabled) return;
    // Allow send with just an image (no text)
    if (!value.trim() && !attachment) return;
    void onSubmit(value.trim());
  };

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > MAX_IMAGE_SIZE) {
        console.warn('[ChatComposer] Image too large:', file.size);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onAttach({ type: 'image', url: dataUrl, mimeType: file.type });
      };
      reader.onerror = () => {
        console.error('[ChatComposer] Failed to read file:', reader.error);
      };
      reader.readAsDataURL(file);
    },
    [onAttach]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) processFile(file);
          return;
        }
      }
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const canSend = !!(value.trim() || attachment);

  return (
    <div
      className="space-y-2"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {attachment && (
        <div className="flex items-center gap-3 rounded-lg border border-base-300 bg-base-200/50 px-3 py-2">
          <img
            src={attachment.url}
            alt="Attachment preview"
            className="h-12 w-12 rounded object-cover"
          />
          <span className="flex-1 truncate text-xs text-base-content/70">
            {t('chatHome.imageAttachment.attached', 'Image attached')}
          </span>
          <button
            type="button"
            onClick={onRemoveAttachment}
            disabled={isSending}
            className={cn(
              'rounded-full p-1 text-base-content/50 transition-colors',
              'hover:bg-base-300 hover:text-base-content'
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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
        onPaste={handlePaste}
        autoGrow
        rows={1}
        maxHeight={220}
        disabled={isSending || disabled}
        placeholder={
          attachment
            ? t('chatHome.imageAttachment.placeholder', 'Ask anything about this image...')
            : t('chatHome.composer.placeholder', 'Ask anything about your work...')
        }
        className="pr-16"
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || disabled}
            title={t('chatHome.imageAttachment.attachImage', 'Attach image')}
            className={cn(
              'rounded-lg p-1.5 text-base-content/50 transition-colors',
              'hover:bg-base-200 hover:text-base-content',
              'disabled:opacity-50 disabled:pointer-events-none'
            )}
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <p className="text-xs text-base-content/50">
            {sendWithEnter
              ? t('chatHome.composer.hintEnter', 'Press Enter to send, Shift+Enter for new line.')
              : t('chatHome.composer.hintClick', 'Press the send button to submit your message.')}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          loading={isSending}
          disabled={disabled || !canSend}
          rightIcon={<SendHorizontal className="h-4 w-4" />}
        >
          {t('chatHome.composer.send', 'Send')}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
        className="hidden"
      />
    </div>
  );
}
