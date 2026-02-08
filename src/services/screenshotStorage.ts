import { get, set, del } from 'idb-keyval';
import type { ModelType } from '@/types';
import { SUPPORTED_MODELS } from '@/types';
import type { AnalysisMode } from '@/types/screenshot';
import { ANALYSIS_MODES } from '@/types/screenshot';

// ── IndexedDB keys ────────────────────────────────────────────
const IDB_DRAFT_IMAGE_KEY = 'screenshot:draft-image';
const IDB_PENDING_IMAGE_KEY = 'screenshot:pending-image';

// ── sessionStorage key (metadata only, ~100 bytes) ────────────
const SS_PENDING_META_KEY = 'pending-analysis-meta';

// ── Legacy keys to clean up ───────────────────────────────────
const LEGACY_PENDING_KEY = 'pending-analysis';
const LEGACY_DRAFT_KEY = 'draft-image';

// ── Types ─────────────────────────────────────────────────────
type PendingAnalysisMeta = {
  mode: AnalysisMode;
  model: ModelType;
  pendingAnalyze: boolean;
};

export type PendingAnalysis = PendingAnalysisMeta & {
  image: string | null;
};

export type LoadResult<T> = { data: T | null; failed: boolean };

// ── Draft Image ───────────────────────────────────────────────

export async function saveDraftImage(image: string | null): Promise<boolean> {
  try {
    if (image) {
      await set(IDB_DRAFT_IMAGE_KEY, image);
    } else {
      await del(IDB_DRAFT_IMAGE_KEY);
    }
    return true;
  } catch (err) {
    console.error('[screenshotStorage] saveDraftImage failed:', err);
    return false;
  }
}

export async function loadDraftImage(): Promise<LoadResult<string>> {
  try {
    return { data: (await get<string>(IDB_DRAFT_IMAGE_KEY)) ?? null, failed: false };
  } catch (err) {
    console.error('[screenshotStorage] loadDraftImage failed:', err);
    return { data: null, failed: true };
  }
}

// ── Pending Analysis ──────────────────────────────────────────

export async function savePendingAnalysis(payload: PendingAnalysis): Promise<boolean> {
  try {
    const { image, ...meta } = payload;
    if (image) {
      await set(IDB_PENDING_IMAGE_KEY, image);
    } else {
      await del(IDB_PENDING_IMAGE_KEY);
    }
    try {
      sessionStorage.setItem(SS_PENDING_META_KEY, JSON.stringify(meta));
    } catch (metaErr) {
      // Rollback the IDB write to avoid orphaned data
      await del(IDB_PENDING_IMAGE_KEY).catch((rollbackErr) => {
        console.error('[screenshotStorage] savePendingAnalysis rollback failed — orphaned IDB entry may remain:', rollbackErr);
      });
      throw metaErr;
    }
    return true;
  } catch (err) {
    console.error('[screenshotStorage] savePendingAnalysis failed:', err);
    return false;
  }
}

function isValidPendingMeta(value: unknown): value is PendingAnalysisMeta {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.mode === 'string' &&
    (ANALYSIS_MODES as readonly string[]).includes(obj.mode) &&
    typeof obj.model === 'string' &&
    (SUPPORTED_MODELS as readonly string[]).includes(obj.model) &&
    typeof obj.pendingAnalyze === 'boolean'
  );
}

export async function loadPendingAnalysis(): Promise<LoadResult<PendingAnalysis>> {
  try {
    const raw = sessionStorage.getItem(SS_PENDING_META_KEY);
    if (!raw) return { data: null, failed: false };

    const parsed: unknown = JSON.parse(raw);
    if (!isValidPendingMeta(parsed)) {
      console.error('[screenshotStorage] Invalid pending analysis metadata, discarding:', parsed);
      sessionStorage.removeItem(SS_PENDING_META_KEY);
      return { data: null, failed: false };
    }

    const image = (await get<string>(IDB_PENDING_IMAGE_KEY)) ?? null;
    return { data: { ...parsed, image }, failed: false };
  } catch (err) {
    console.error('[screenshotStorage] loadPendingAnalysis failed:', err);
    return { data: null, failed: true };
  }
}

export async function clearPendingAnalysis(): Promise<boolean> {
  let success = true;
  try {
    sessionStorage.removeItem(SS_PENDING_META_KEY);
  } catch (err) {
    console.error('[screenshotStorage] clearPendingAnalysis (sessionStorage) failed:', err);
    success = false;
  }
  try {
    await del(IDB_PENDING_IMAGE_KEY);
  } catch (err) {
    console.error('[screenshotStorage] clearPendingAnalysis (IndexedDB) failed:', err);
    success = false;
  }
  return success;
}

// ── Migration ─────────────────────────────────────────────────

// Intentionally discards old sessionStorage drafts rather than migrating them to IDB.
// The old keys stored full base64 images which may be stale or oversized. A clean
// break avoids complexity and the one-time data loss is acceptable for this upgrade.
export function migrateLegacyKeys(): void {
  try {
    sessionStorage.removeItem(LEGACY_PENDING_KEY);
    sessionStorage.removeItem(LEGACY_DRAFT_KEY);
  } catch (err) {
    console.warn('[screenshotStorage] migrateLegacyKeys failed:', err);
  }
}
