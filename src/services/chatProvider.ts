import type { ChatMessage, Language, ModelType } from '@/types';
import { generateResponse } from './firebaseAI';

const MAX_HISTORY_MESSAGES = 20;

type FirebaseChatRole = 'user' | 'model';

interface GenerateAssistantReplyOptions {
  language: Language;
  model: ModelType;
  messages?: ChatMessage[];
}

const LANGUAGE_INSTRUCTIONS: Record<Language, string> = {
  'zh-TW':
    '請使用繁體中文回覆，內容清楚、可執行，優先提供具體步驟。',
  'en-US':
    'Reply in concise, actionable English with clear next steps.',
  'ja-JP':
    '日本語で簡潔かつ実行可能な提案を返してください。',
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

  const promptedInput = `${LANGUAGE_INSTRUCTIONS[options.language]}\n\n${content}`;

  const reply = await generateResponse(promptedInput, options.model, {
    history: toConversationHistory(options.messages),
  });

  return reply.trim();
}
