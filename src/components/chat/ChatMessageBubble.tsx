import { memo } from 'react';
import { AlertCircle, Bot, Clock3, Download, UserCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import type { ChatMessage } from '@/types';
import { cn } from '@/utils/cn';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  streamingContent?: string;
}

function formatMessageTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export const ChatMessageBubble = memo(function ChatMessageBubble({ message, streamingContent }: ChatMessageBubbleProps) {
  const { t } = useTranslation();
  const isUser = message.role === 'user';
  const roleLabel = isUser
    ? t('chatHome.roles.user', 'You')
    : t('chatHome.roles.assistant', 'Assistant');

  const isImageResult = message.resultType === 'image' && message.processedImageData;
  const displayContent = streamingContent || message.content;
  const isStreaming = !!streamingContent;

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[90%] rounded-2xl border px-4 py-3 text-sm sm:max-w-[78%]',
          isUser
            ? 'border-primary/40 bg-primary text-primary-content'
            : 'border-base-300 bg-base-100 text-base-content'
        )}
      >
        <div
          className={cn(
            'mb-2 flex items-center gap-2 text-xs',
            isUser ? 'text-primary-content/85' : 'text-base-content/60'
          )}
        >
          {isUser ? <UserCircle2 className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
          <span>{roleLabel}</span>
          <span aria-hidden>·</span>
          <span>{formatMessageTime(message.createdAt)}</span>
        </div>

        {/* User message image attachment */}
        {isUser && message.attachment && (
          <img
            src={message.attachment.url}
            alt="Attached image"
            className="mb-2 max-h-[200px] rounded-lg object-contain"
          />
        )}

        {/* Assistant image result (e.g. remove-bg) */}
        {!isUser && isImageResult && (
          <div className="mb-2">
            <div className="relative inline-block">
              <div
                className="absolute inset-0 rounded-lg bg-repeat"
                style={{
                  backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%),
                    linear-gradient(-45deg, #ccc 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #ccc 75%),
                    linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                }}
              />
              <img
                src={message.processedImageData}
                alt="Processed result"
                className="relative max-h-64 rounded-lg"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (!message.processedImageData) return;
                const link = document.createElement('a');
                link.href = message.processedImageData;
                link.download = `processed-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="mt-2 flex items-center gap-1 text-xs opacity-70 hover:opacity-100 transition-opacity"
            >
              <Download className="h-3 w-3" />
              {t('common.download', 'Download')}
            </button>
          </div>
        )}

        {/* Text content — render as markdown for assistant, plain text for user */}
        {displayContent && (
          !isUser ? (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{displayContent}</ReactMarkdown>
              {isStreaming && (
                <span className="inline-block ml-1 h-3 w-1.5 animate-pulse bg-base-content/60 rounded-sm" />
              )}
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
          )
        )}

        {/* Status indicator */}
        {message.status !== 'sent' && !isStreaming && (
          <div
            className={cn(
              'mt-2 inline-flex items-center gap-1 text-xs',
              message.status === 'error'
                ? isUser
                  ? 'text-error-content/90'
                  : 'text-error'
                : isUser
                  ? 'text-primary-content/85'
                  : 'text-base-content/60'
            )}
          >
            {message.status === 'error' ? (
              <AlertCircle className="h-3.5 w-3.5" />
            ) : (
              <Clock3 className="h-3.5 w-3.5" />
            )}
            <span>
              {message.status === 'error'
                ? t('chatHome.status.error', 'Failed')
                : t('chatHome.status.pending', 'Sending...')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});
