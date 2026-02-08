import { MessageSquareText, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AnalysisMode } from '@/types/screenshot';
import type { ChatMessageAttachment } from '@/types';
import { ChatComposer } from './ChatComposer';
import { ChatMessageList } from './ChatMessageList';
import { ChatQuickActions } from './ChatQuickActions';
import { ChatStarterPrompts } from './ChatStarterPrompts';
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
  const draftAttachment = useChatStore((s) => s.draftAttachment);
  const streamingContent = useChatStore((s) => s.streamingContent);
  const isInitializing = useChatStore((s) => s.isInitializing);
  const isSending = useChatStore((s) => s.isSending);
  const error = useChatStore((s) => s.error);
  const setDraftInput = useChatStore((s) => s.setDraftInput);
  const setDraftAttachment = useChatStore((s) => s.setDraftAttachment);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const sendMessageWithImage = useChatStore((s) => s.sendMessageWithImage);
  const clearConversation = useChatStore((s) => s.clearConversation);

  const redirectToLogin = () => {
    navigate('/login', {
      state: { from: location, pendingChat: true },
    });
  };

  const handleSend = async (content: string) => {
    try {
      if (draftAttachment) {
        // If image attached but no text, default to "explain" mode
        const mode: AnalysisMode | undefined = content ? undefined : 'explain';
        await sendMessageWithImage(content, draftAttachment, mode);
      } else {
        await sendMessage(content);
      }
    } catch (sendError) {
      if (isAuthRequiredError(sendError)) {
        redirectToLogin();
      }
    }
  };

  const handleQuickAction = async (mode: AnalysisMode) => {
    if (!draftAttachment) return;
    try {
      await sendMessageWithImage('', draftAttachment, mode);
    } catch (sendError) {
      if (isAuthRequiredError(sendError)) {
        redirectToLogin();
      }
    }
  };

  const handleAttach = (attachment: ChatMessageAttachment) => {
    setDraftAttachment(attachment);
  };

  const handleRemoveAttachment = () => {
    setDraftAttachment(null);
  };

  const handleClearConversation = async () => {
    try {
      await clearConversation();
    } catch {
      // Error state is already handled in the store.
    }
  };

  const showQuickActions = !!draftAttachment && !draftInput.trim();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex min-h-full max-w-5xl flex-col gap-4 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <section className="flex min-h-[560px] flex-1 flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100">
          <div className="flex items-start justify-between border-b border-base-300 px-4 py-3 sm:px-6">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/60">
                {t('chatHome.threadLabel', 'Conversation')}
              </h2>
              <p className="mt-1 text-sm text-base-content/60">
                {t('chatHome.threadHint', 'Messages sync across your signed-in devices.')}
              </p>
            </div>

            {isAuthenticated && messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearConversation}
                disabled={isSending}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                {t('chatHome.clearConversation', 'Clear')}
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {messages.length === 0 ? (
              <div className="mx-auto flex h-full w-full max-w-3xl flex-col justify-center gap-6">
                <div className="text-center">
                  <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MessageSquareText className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    {t('chatHome.emptyTitle', 'Start a new conversation')}
                  </h3>
                  <p className="mt-2 text-sm text-base-content/60">
                    {t(
                      'chatHome.emptySubtitle',
                      'Ask for planning help, implementation ideas, or review feedback.'
                    )}
                  </p>
                </div>
                <ChatStarterPrompts
                  onSelect={setDraftInput}
                  disabled={isInitializing || isSending}
                />
              </div>
            ) : (
              <ChatMessageList
                messages={messages}
                isSending={isSending}
                isInitializing={isInitializing}
                streamingContent={streamingContent}
              />
            )}
          </div>

          <div className="border-t border-base-300 px-4 py-4 sm:px-6 sm:py-5">
            <div className="space-y-3">
              <ChatComposer
                value={draftInput}
                onChange={setDraftInput}
                onSubmit={handleSend}
                isSending={isSending}
                disabled={isInitializing}
                sendWithEnter={sendWithEnter}
                attachment={draftAttachment}
                onAttach={handleAttach}
                onRemoveAttachment={handleRemoveAttachment}
              />
              {showQuickActions && (
                <ChatQuickActions
                  onQuickAction={handleQuickAction}
                  disabled={isSending || isInitializing}
                />
              )}
            </div>
            {!isAuthenticated && (
              <p className="mt-3 text-xs text-base-content/55">
                {t(
                  'chatHome.authHint',
                  'You can draft a message now. Sign-in is only required when you send.'
                )}
              </p>
            )}
            {error && (
              <p className="mt-3 text-sm text-error">
                {t('chatHome.errorPrefix', 'Error')}: {error}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
