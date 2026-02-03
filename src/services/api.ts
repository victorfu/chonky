import type { ModelType } from '@/types';
import {
  generateResponse as firebaseGenerateResponse,
  streamResponse as firebaseStreamResponse,
} from './firebaseAI';

// ============================================================================
// Types
// ============================================================================

interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

interface TextResponse {
  content: string;
}

// ============================================================================
// API Client
// ============================================================================

class ApiService {
  // ============================================================================
  // Text Generation API
  // ============================================================================

  async generateText(
    content: string,
    model: ModelType
  ): Promise<ApiResponse<TextResponse>> {
    try {
      const responseContent = await firebaseGenerateResponse(content, model);

      return {
        data: { content: responseContent },
        success: true,
      };
    } catch (error) {
      return {
        data: null as unknown as TextResponse,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async streamText(
    content: string,
    model: ModelType,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    await firebaseStreamResponse(content, model, onChunk);
  }
}

export const apiService = new ApiService();
