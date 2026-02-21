import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  limit as firestoreLimit,
  type FirestoreError,
  type Unsubscribe,
} from 'firebase/firestore';
import type { KnowledgeCard, KnowledgeCardInput, CardStatus } from '@/types';
import { db } from './firebase';

const KNOWLEDGE_CARDS_COLLECTION = 'knowledge_cards';
const SEARCH_RESULTS_LIMIT = 50;

interface FirestoreKnowledgeCard {
  title?: unknown;
  description?: unknown;
  content?: unknown;
  category?: unknown;
  tags?: unknown;
  imageUrl?: unknown;
  metadata?: unknown;
  searchKeywords?: unknown;
  status?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  createdBy?: unknown;
}

function getCardsRef() {
  return collection(db, KNOWLEDGE_CARDS_COLLECTION);
}

function getCardRef(id: string) {
  return doc(db, KNOWLEDGE_CARDS_COLLECTION, id);
}

function toTimestampIso(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
  }
  return new Date().toISOString();
}

function isValidStatus(value: unknown): value is CardStatus {
  return value === 'draft' || value === 'published';
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function normalizeRecord(value: unknown): Record<string, string> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
  const record: Record<string, string> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === 'string') {
      record[k] = v;
    }
  }
  return record;
}

function normalizeCard(
  id: string,
  raw: FirestoreKnowledgeCard | null | undefined
): KnowledgeCard {
  return {
    id,
    title: typeof raw?.title === 'string' ? raw.title : '',
    description: typeof raw?.description === 'string' ? raw.description : '',
    content: typeof raw?.content === 'string' ? raw.content : '',
    category: typeof raw?.category === 'string' ? raw.category : '',
    tags: normalizeStringArray(raw?.tags),
    imageUrl: typeof raw?.imageUrl === 'string' ? raw.imageUrl : null,
    metadata: normalizeRecord(raw?.metadata),
    searchKeywords: normalizeStringArray(raw?.searchKeywords),
    status: isValidStatus(raw?.status) ? raw.status : 'draft',
    createdAt: toTimestampIso(raw?.createdAt),
    updatedAt: toTimestampIso(raw?.updatedAt),
    createdBy: typeof raw?.createdBy === 'string' ? raw.createdBy : '',
  };
}

export function generateSearchKeywords(
  title: string,
  description: string,
  tags: string[]
): string[] {
  const text = `${title} ${description} ${tags.join(' ')}`;
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 0);
  return [...new Set(words)];
}

export async function addKnowledgeCard(
  input: KnowledgeCardInput
): Promise<string> {
  const cardRef = doc(getCardsRef());
  const searchKeywords = generateSearchKeywords(
    input.title,
    input.description,
    input.tags
  );

  await setDoc(cardRef, {
    title: input.title,
    description: input.description,
    content: input.content,
    category: input.category,
    tags: input.tags,
    imageUrl: input.imageUrl,
    metadata: input.metadata,
    searchKeywords,
    status: input.status,
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return cardRef.id;
}

export async function updateKnowledgeCard(
  id: string,
  updates: Partial<KnowledgeCardInput>
): Promise<void> {
  const ref = getCardRef(id);

  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const [key, value] of Object.entries(updates)) {
    data[key] = value;
  }

  // Regenerate search keywords if relevant fields changed
  if (updates.title !== undefined || updates.description !== undefined || updates.tags !== undefined) {
    const snapshot = await getDoc(ref);
    const existing = normalizeCard(id, snapshot.data() as FirestoreKnowledgeCard);
    const title = updates.title ?? existing.title;
    const description = updates.description ?? existing.description;
    const tags = updates.tags ?? existing.tags;
    data.searchKeywords = generateSearchKeywords(title, description, tags);
  }

  await setDoc(ref, data, { merge: true });
}

export async function deleteKnowledgeCard(id: string): Promise<void> {
  await deleteDoc(getCardRef(id));
}

export async function getKnowledgeCard(
  id: string
): Promise<KnowledgeCard | null> {
  const snapshot = await getDoc(getCardRef(id));
  if (!snapshot.exists()) return null;
  return normalizeCard(id, snapshot.data() as FirestoreKnowledgeCard);
}

export function subscribeKnowledgeCards(
  onData: (cards: KnowledgeCard[]) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  const cardsQuery = query(
    getCardsRef(),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(
    cardsQuery,
    (snapshot) => {
      const cards = snapshot.docs.map((docSnapshot) =>
        normalizeCard(docSnapshot.id, docSnapshot.data() as FirestoreKnowledgeCard)
      );
      onData(cards);
    },
    onError
  );
}

export async function searchKnowledgeCards(
  keywords: string[]
): Promise<KnowledgeCard[]> {
  if (keywords.length === 0) return [];

  // Firestore only supports one array-contains per query
  // Query by first keyword, then filter client-side for remaining
  const primaryKeyword = keywords[0]!;
  const remainingKeywords = keywords.slice(1);

  const searchQuery = query(
    getCardsRef(),
    where('status', '==', 'published'),
    where('searchKeywords', 'array-contains', primaryKeyword),
    firestoreLimit(SEARCH_RESULTS_LIMIT)
  );

  const snapshot = await getDocs(searchQuery);
  let cards = snapshot.docs.map((docSnapshot) =>
    normalizeCard(docSnapshot.id, docSnapshot.data() as FirestoreKnowledgeCard)
  );

  // Client-side filtering for additional keywords
  if (remainingKeywords.length > 0) {
    cards = cards.filter((card) =>
      remainingKeywords.some((kw) => card.searchKeywords.includes(kw))
    );
  }

  return cards;
}
