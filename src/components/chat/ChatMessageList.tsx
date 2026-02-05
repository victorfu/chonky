import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChatMessage } from '@/types';
import { ChatMessageBubble } from './ChatMessageBubble';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isSending: boolean;
  isInitializing: boolean;
  streamingContent: string;
}

export function ChatMessageList({
  messages,
  isSending,
  isInitializing,
  streamingContent,
}: ChatMessageListProps) {
  const { t } = useTranslation();
  const tailRef = useRef<HTMLDivElement>(null);

  const isStreaming = !!streamingContent;

  useEffect(() => {
    tailRef.current?.scrollIntoView({ behavior: isStreaming ? 'auto' : 'smooth', block: 'end' });
  }, [messages.length, isSending, isStreaming]);

  if (isInitializing) {
    return (
      <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t('chatHome.loading', 'Loading conversation...')}
      </div>
    );
  }

  // The streaming target is the last message if it's a pending assistant message
  const lastMessage = messages[messages.length - 1];
  const lastPendingAssistantId =
    lastMessage?.role === 'assistant' && lastMessage.status === 'pending'
      ? lastMessage.id
      : null;

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <ChatMessageBubble
          key={message.id}
          message={message}
          streamingContent={
            streamingContent && message.id === lastPendingAssistantId
              ? streamingContent
              : undefined
          }
        />
      ))}
      <div ref={tailRef} />
    </div>
  );
}
