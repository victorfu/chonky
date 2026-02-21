import type { KnowledgeCard, Language, ModelType } from '@/types';
import type { SearchResult } from '@/types';
import { generateResponse } from './firebaseAI';

const LANGUAGE_INSTRUCTIONS: Record<Language, string> = {
  'zh-TW': '請使用繁體中文回覆。',
  'en-US': 'Reply in English.',
  'ja-JP': '日本語で回答してください。',
};

interface RankedCard {
  id: string;
  score: number;
  summary: string;
}

function buildRankingPrompt(
  userQuery: string,
  cards: KnowledgeCard[],
  language: Language
): string {
  const cardDescriptions = cards
    .map(
      (card, index) =>
        `[${index}] ID: ${card.id}\nTitle: ${card.title}\nDescription: ${card.description}\nCategory: ${card.category}\nTags: ${card.tags.join(', ')}`
    )
    .join('\n\n');

  return `${LANGUAGE_INSTRUCTIONS[language]}

You are a search ranking assistant. Given the user's query and a list of knowledge cards, rank the cards by relevance and provide a brief summary explaining why each card is relevant.

User Query: "${userQuery}"

Knowledge Cards:
${cardDescriptions}

Return a JSON array (and ONLY a JSON array, no other text) ranking the most relevant cards. Each element should have:
- "id": the card ID
- "score": relevance score from 0 to 1 (1 = most relevant)
- "summary": a brief explanation of why this card matches the query (in the user's language)

Only include cards that are actually relevant (score > 0.3). Sort by score descending.

Example format:
[{"id":"abc123","score":0.95,"summary":"This card directly answers the question about..."}]`;
}

function parseRankingResponse(response: string): RankedCard[] {
  // Try to extract JSON array from the response
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item): item is Record<string, unknown> =>
          typeof item === 'object' && item !== null
      )
      .map((item) => ({
        id: typeof item.id === 'string' ? item.id : '',
        score: typeof item.score === 'number' ? item.score : 0,
        summary: typeof item.summary === 'string' ? item.summary : '',
      }))
      .filter((item) => item.id && item.score > 0);
  } catch {
    return [];
  }
}

export interface RankSearchResultsOptions {
  language: Language;
  model: ModelType;
}

export async function rankSearchResults(
  userQuery: string,
  cards: KnowledgeCard[],
  options: RankSearchResultsOptions
): Promise<SearchResult[]> {
  if (cards.length === 0) return [];

  try {
    const prompt = buildRankingPrompt(userQuery, cards, options.language);
    const response = await generateResponse(prompt, options.model);
    const ranked = parseRankingResponse(response);

    if (ranked.length === 0) {
      // Fallback: return all cards with equal score
      return cards.map((card) => ({
        card,
        relevanceScore: 0.5,
        aiSummary: '',
      }));
    }

    // Map ranked results back to cards
    const cardMap = new Map(cards.map((c) => [c.id, c]));
    return ranked
      .filter((r) => cardMap.has(r.id))
      .map((r) => ({
        card: cardMap.get(r.id)!,
        relevanceScore: r.score,
        aiSummary: r.summary,
      }));
  } catch (error) {
    console.error('AI ranking failed, returning unranked results:', error);
    // Fallback: return all cards unranked
    return cards.map((card) => ({
      card,
      relevanceScore: 0.5,
      aiSummary: '',
    }));
  }
}
