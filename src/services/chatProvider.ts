import type { ChatMessage, Language, ModelType } from '@/types';
import { generateResponse } from './firebaseAI';

const MAX_HISTORY_MESSAGES = 20;

type FirebaseChatRole = 'user' | 'model';

interface GenerateAssistantReplyOptions {
  language: Language;
  model: ModelType;
  messages?: ChatMessage[];
}

const SYSTEM_PROMPTS: Record<Language, string> = {
  'zh-TW':
    '你是一位專業且務實的 AI 助手。請使用繁體中文回覆，內容清楚、可執行，優先提供具體步驟。',
  'en-US':
    'You are a pragmatic AI assistant. Reply in concise, actionable English with clear next steps.',
  'ja-JP':
    'あなたは実務的な AI アシスタントです。日本語で簡潔かつ実行可能な提案を返してください。',
};

function mapToFirebaseRole(role: ChatMessage['role']): FirebaseChatRole {
  return role === 'assistant' ? 'model' : 'user';
}

function toConversationHistory(
  messages: ChatMessage[] | undefined
): Array<{ role: FirebaseChatRole; content: string }> {
  if (!messages?.length) {
    return [];
  }

  return messages
    .filter((message) => message.status === 'sent' && message.content.trim().length > 0)
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({
      role: mapToFirebaseRole(message.role),
      content: message.content.trim(),
    }));
}

export async function generateAssistantReply(
  input: string,
  options: GenerateAssistantReplyOptions
): Promise<string> {
  const content = input.trim();
  if (!content) {
    throw new Error('Message content cannot be empty');
  }

  const reply = await generateResponse(content, options.model, {
    systemPrompt: SYSTEM_PROMPTS[options.language],
    history: toConversationHistory(options.messages),
  });

  return reply.trim();
}

