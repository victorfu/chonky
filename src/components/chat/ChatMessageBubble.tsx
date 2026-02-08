import { AlertCircle, Bot, Clock3, UserCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChatMessage } from '@/types';
import { cn } from '@/utils/cn';

interface ChatMessageBubbleProps {
  message: ChatMessage;
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

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const { t } = useTranslation();
  const isUser = message.role === 'user';
  const roleLabel = isUser
    ? t('chatHome.roles.user', 'You')
    : t('chatHome.roles.assistant', 'Assistant');

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

        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>

        {message.status !== 'sent' && (
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
}

