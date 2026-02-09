import {
  HIGH_QUALITY_MAX_INFERENCE_LONG_EDGE,
  ImagePipelineError,
  type Size,
} from './maskUtils';
import type {
  RemoveBackgroundWorkerConfig,
  RemoveBackgroundWorkerRequest,
  RemoveBackgroundWorkerResponse,
} from './removeBackground.worker.types';

export interface RemoveBackgroundResult {
  processedImageData: string;
  inferenceSize: Size;
  durationMs: number;
}

const SEGMENTATION_ASSET_BASE = import.meta.env.VITE_SEGMENTATION_MODEL_BASE_URL?.replace(/\/$/, '');
const PRELOAD_TIMEOUT_MS = 60_000;
const BG_REMOVAL_TIMEOUT_MS = 120_000;

let workerInstance: Worker | null = null;
let requestId = 0;
let preloadPromise: Promise<void> | null = null;

type PendingRequest = {
  resolve: (response: RemoveBackgroundWorkerResponse) => void;
  reject: (error: unknown) => void;
  timeoutId: ReturnType<typeof setTimeout>;
};

type WorkerCallPayload = {
  request: RemoveBackgroundWorkerRequest;
  transferables?: Transferable[];
};

const pendingRequests = new Map<number, PendingRequest>();

function getWorkerConfig(): RemoveBackgroundWorkerConfig {
  if (!SEGMENTATION_ASSET_BASE) {
    return {};
  }

  return {
    segmentationAssetBase: SEGMENTATION_ASSET_BASE,
  };
}

function rejectAllPendingRequests(error: unknown) {
  pendingRequests.forEach(({ reject, timeoutId }) => {
    clearTimeout(timeoutId);
    reject(error);
  });
  pendingRequests.clear();
}

function resetWorker(error: unknown) {
  rejectAllPendingRequests(error);
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
  }
  preloadPromise = null;
}

function createWorker(): Worker {
  const worker = new Worker(new URL('./removeBackground.worker.ts', import.meta.url), {
    type: 'module',
  });

  worker.addEventListener('message', (event: MessageEvent<RemoveBackgroundWorkerResponse>) => {
    const response = event.data;
    const pending = pendingRequests.get(response.id);
    if (!pending) {
      return;
    }

    clearTimeout(pending.timeoutId);
    pendingRequests.delete(response.id);
    pending.resolve(response);
  });

  worker.addEventListener('error', (event) => {
    const workerError = event.error ?? new Error(event.message || 'Background removal worker failed');
    console.error('[removeBackground] Worker error:', workerError);
    resetWorker(workerError);
  });

  worker.addEventListener('messageerror', (event) => {
    const workerError = new Error('Background removal worker message channel error');
    console.error('[removeBackground] Worker messageerror:', workerError, event);
    resetWorker(workerError);
  });

  return worker;
}

function getWorker(): Worker {
  if (!workerInstance) {
    workerInstance = createWorker();
  }

  return workerInstance;
}

function callWorker(
  buildRequest: (id: number, config: RemoveBackgroundWorkerConfig) => WorkerCallPayload,
  timeoutMs: number
): Promise<RemoveBackgroundWorkerResponse> {
  const id = ++requestId;
  const config = getWorkerConfig();
  const { request, transferables = [] } = buildRequest(id, config);

  return new Promise<RemoveBackgroundWorkerResponse>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      const pending = pendingRequests.get(id);
      if (!pending) return;

      pendingRequests.delete(id);
      clearTimeout(pending.timeoutId);

      console.error(`[removeBackground] Worker timed out after ${timeoutMs}ms for request ${id}`);
      pending.reject(new Error(`Background removal worker timed out after ${timeoutMs}ms`));

      resetWorker(new Error('Worker terminated due to timeout'));
    }, timeoutMs);

    pendingRequests.set(id, { resolve, reject, timeoutId });

    try {
      if (transferables.length > 0) {
        getWorker().postMessage(request, transferables);
      } else {
        getWorker().postMessage(request);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      pendingRequests.delete(id);
      reject(error);
      resetWorker(error);
    }
  });
}

function toPipelineError(response: Extract<RemoveBackgroundWorkerResponse, { ok: false }>): ImagePipelineError {
  const fallbackCode = response.kind === 'preload' ? 'IMAGE_MODEL_LOAD_FAILED' : 'BACKGROUND_REMOVAL_FAILED';
  return new ImagePipelineError(response.code ?? fallbackCode, response.message);
}

export async function preloadBackgroundRemovalModel(): Promise<void> {
  if (!preloadPromise) {
    preloadPromise = callWorker(
      (id, config) => ({
        request: {
          id,
          kind: 'preload',
          config,
        },
      }),
      PRELOAD_TIMEOUT_MS
    )
      .then((response) => {
        if (!response.ok) {
          throw toPipelineError(response);
        }
      })
      .catch((error) => {
        preloadPromise = null;
        if (error instanceof ImagePipelineError) {
          throw error;
        }
        throw new ImagePipelineError('IMAGE_MODEL_LOAD_FAILED', undefined, error);
      });
  }

  return preloadPromise;
}

export async function removeImageBackground(
  imageBlob: Blob,
  mimeType: string,
  maxInferenceLongEdge = HIGH_QUALITY_MAX_INFERENCE_LONG_EDGE
): Promise<RemoveBackgroundResult> {
  try {
    const imageBuffer = await imageBlob.arrayBuffer();
    const response = await callWorker(
      (id, config) => ({
        request: {
          id,
          kind: 'remove-background',
          imageBuffer,
          mimeType,
          maxInferenceLongEdge,
          config,
        },
        transferables: [imageBuffer],
      }),
      BG_REMOVAL_TIMEOUT_MS
    );

    if (!response.ok) {
      throw toPipelineError(response);
    }
    if (response.kind !== 'remove-background') {
      throw new ImagePipelineError('BACKGROUND_REMOVAL_FAILED', 'Invalid background removal worker response');
    }

    if (!response.processedImageBuffer?.byteLength) {
      throw new ImagePipelineError('BACKGROUND_REMOVAL_FAILED', 'Worker returned an empty image buffer');
    }

    const blob = new Blob([response.processedImageBuffer], { type: 'image/png' });
    return {
      processedImageData: URL.createObjectURL(blob),
      inferenceSize: response.inferenceSize,
      durationMs: response.durationMs,
    };
  } catch (error) {
    if (error instanceof ImagePipelineError) {
      throw error;
    }

    throw new ImagePipelineError('BACKGROUND_REMOVAL_FAILED', undefined, error);
  }
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    resetWorker(new Error('Background removal worker disposed'));
  });
}
