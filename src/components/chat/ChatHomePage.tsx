import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChatComposer } from './ChatComposer';
import { ChatMessageList } from './ChatMessageList';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore, isAuthRequiredError } from '@/stores/useChatStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

export function ChatHomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const sendWithEnter = useSettingsStore((state) => state.settings.chat.sendWithEnter);

  const messages = useChatStore((s) => s.messages);
  const draftInput = useChatStore((s) => s.draftInput);
  const streamingContent = useChatStore((s) => s.streamingContent);
  const isInitializing = useChatStore((s) => s.isInitializing);
  const isSending = useChatStore((s) => s.isSending);
  const error = useChatStore((s) => s.error);
  const setDraftInput = useChatStore((s) => s.setDraftInput);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const clearConversation = useChatStore((s) => s.clearConversation);

  const hasMessages = messages.length > 0;

  const redirectToLogin = () => {
    navigate('/login', {
      state: { from: location, pendingChat: true },
    });
  };

  const handleSend = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (sendError) {
      if (isAuthRequiredError(sendError)) {
        redirectToLogin();
      }
    }
  };

  const handleClearConversation = async () => {
    try {
      await clearConversation();
    } catch {
      // Error state is already handled in the store.
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center px-4 py-10 sm:px-6">
        {!hasMessages && (
          <h1 className="mb-6 text-2xl font-semibold">Chonky</h1>
        )}

        {/* Composer — always visible, centered */}
        <div className="w-full">
          <ChatComposer
            value={draftInput}
            onChange={setDraftInput}
            onSubmit={handleSend}
            isSending={isSending}
            disabled={isInitializing}
            sendWithEnter={sendWithEnter}
          />
          {error && (
            <p className="mt-2 text-sm text-destructive">
              {t('chatHome.errorPrefix', 'Error')}: {error}
            </p>
          )}
        </div>

        {/* Response area — compact, only shown when there are messages */}
        {hasMessages && (
          <section className="mt-4 flex w-full flex-col overflow-hidden rounded-xl border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('chatHome.threadLabel', 'Result')}
              </h2>
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearConversation}
                  disabled={isSending}
                  leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                >
                  {t('chatHome.clearConversation', 'Clear')}
                </Button>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto p-4">
              <ChatMessageList
                messages={messages}
                isSending={isSending}
                isInitializing={isInitializing}
                streamingContent={streamingContent}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
