import { memo } from 'react';
import { AlertCircle, Bot, Clock3, UserCircle2 } from 'lucide-react';
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

  const displayContent = streamingContent || message.content;
  const isStreaming = !!streamingContent;

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[90%] rounded-2xl border px-4 py-3 text-sm sm:max-w-[78%]',
          isUser
            ? 'border-primary/40 bg-primary text-primary-foreground'
            : 'border-border bg-background text-foreground'
        )}
      >
        <div
          className={cn(
            'mb-2 flex items-center gap-2 text-xs',
            isUser ? 'text-primary-foreground/85' : 'text-muted-foreground'
          )}
        >
          {isUser ? <UserCircle2 className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
          <span>{roleLabel}</span>
          <span aria-hidden>·</span>
          <span>{formatMessageTime(message.createdAt)}</span>
        </div>

        {/* Text content — render as markdown for assistant, plain text for user */}
        {displayContent && (
          !isUser ? (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{displayContent}</ReactMarkdown>
              {isStreaming && (
                <span className="inline-block ml-1 h-3 w-1.5 animate-pulse bg-foreground/60 rounded-sm" />
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
                  ? 'text-destructive-foreground/90'
                  : 'text-destructive'
                : isUser
                  ? 'text-primary-foreground/85'
                  : 'text-muted-foreground'
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
