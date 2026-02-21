export type CardStatus = 'draft' | 'published';

export interface KnowledgeCard {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl: string | null;
  metadata: Record<string, string>;
  searchKeywords: string[];
  status: CardStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type KnowledgeCardInput = Omit<
  KnowledgeCard,
  'id' | 'searchKeywords' | 'createdAt' | 'updatedAt'
>;
