import { getGenerativeModel } from 'firebase/ai';
import { ai } from './firebase';
import type { ModelType } from '@/types';

/**
 * Options for AI generation
 */
export interface GenerateOptions {
  history?: Array<{ role: 'user' | 'model'; content: string }>;
}

/**
 * Factory function to get a GenerativeModel instance for a specific model
 */
function getModel(modelId: ModelType) {
  return getGenerativeModel(ai, { model: modelId });
}

/**
 * Generate a response using Firebase AI (Gemini)
 * Non-streaming version
 */
export async function generateResponse(
  prompt: string,
  model: ModelType,
  options?: GenerateOptions
): Promise<string> {
  try {
    const geminiModel = getModel(model);

    // Build the chat history if provided
    const history = options?.history?.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    // Start a chat session if we have history
    if (history?.length) {
      const chat = geminiModel.startChat({ history });
      const result = await chat.sendMessage(prompt);
      return result.response.text();
    }

    // Simple generation without history
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Firebase AI generation error:', error);
    const wrapped = new Error('Failed to generate AI response. Please try again.');
    (wrapped as unknown as Record<string, unknown>).cause = error;
    throw wrapped;
  }
}

/**
 * Stream a response using Firebase AI (Gemini)
 * Calls onChunk for each streamed text chunk
 */
export async function streamResponse(
  prompt: string,
  model: ModelType,
  onChunk: (chunk: string) => void,
  options?: GenerateOptions
): Promise<void> {
  try {
    const geminiModel = getModel(model);

    // Build the chat history if provided
    const history = options?.history?.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    let result;

    // Start a chat session if we have history
    if (history?.length) {
      const chat = geminiModel.startChat({ history });
      result = await chat.sendMessageStream(prompt);
    } else {
      result = await geminiModel.generateContentStream(prompt);
    }

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        onChunk(chunkText);
      }
    }
  } catch (error) {
    console.error('Firebase AI streaming error:', error);
    const wrapped = new Error('Failed to stream AI response. Please try again.');
    (wrapped as unknown as Record<string, unknown>).cause = error;
    throw wrapped;
  }
}
