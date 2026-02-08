import { getGenerativeModel } from 'firebase/ai';
import type { ChatMessage, Language, ModelType } from '@/types';
import type { AnalysisMode } from '@/types/screenshot';
import { generateResponse } from './firebaseAI';
import { ai } from './firebase';
import i18n from '@/i18n';

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

interface StreamImageReplyOptions {
  language: Language;
  model: ModelType;
}

function buildImagePrompt(
  text: string | undefined,
  mode: AnalysisMode | undefined,
  language: Language
): string {
  if (mode) {
    const instruction = i18n.t('screenshot.prompts.instruction', { lng: language });
    return i18n.t(`screenshot.prompts.${mode}`, { lng: language, instruction });
  }

  const langInstruction = LANGUAGE_INSTRUCTIONS[language];
  return `${langInstruction}\n\n${text ?? ''}`.trim();
}

export async function streamImageReply(
  imageBase64: string,
  mimeType: string,
  options: StreamImageReplyOptions,
  onChunk: (fullText: string) => void,
  text?: string,
  mode?: AnalysisMode
): Promise<string> {
  try {
    const prompt = buildImagePrompt(text, mode, options.language);
    const geminiModel = getGenerativeModel(ai, { model: options.model });

    const contentParts = [
      { text: prompt },
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ];

    const result = await geminiModel.generateContentStream(contentParts);

    let fullText = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullText += chunkText;
        onChunk(fullText);
      }
    }

    if (!fullText.trim()) {
      throw new Error(
        i18n.t('screenshot.errors.analysisFailed', { lng: options.language })
      );
    }

    return fullText;
  } catch (error) {
    console.error('Image analysis streaming error:', error);
    const wrapped = new Error(
      i18n.t('screenshot.errors.analysisFailed', { lng: options.language })
    );
    (wrapped as unknown as Record<string, unknown>).cause = error;
    throw wrapped;
  }
}
