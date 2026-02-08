import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChatMessage } from '@/types';
import { ChatMessageBubble } from './ChatMessageBubble';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isSending: boolean;
  isInitializing: boolean;
}

export function ChatMessageList({
  messages,
  isSending,
  isInitializing,
}: ChatMessageListProps) {
  const { t } = useTranslation();
  const tailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isSending]);

  if (isInitializing) {
    return (
      <div className="flex h-44 items-center justify-center text-sm text-base-content/60">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t('chatHome.loading', 'Loading conversation...')}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <ChatMessageBubble key={message.id} message={message} />
      ))}
      <div ref={tailRef} />
    </div>
  );
}

