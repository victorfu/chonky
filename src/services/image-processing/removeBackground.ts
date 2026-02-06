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

let workerInstance: Worker | null = null;
let requestId = 0;
let preloadPromise: Promise<void> | null = null;

type PendingRequest = {
  resolve: (response: RemoveBackgroundWorkerResponse) => void;
  reject: (error: unknown) => void;
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
  pendingRequests.forEach(({ reject }) => reject(error));
  pendingRequests.clear();
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

    pendingRequests.delete(response.id);
    pending.resolve(response);
  });

  worker.addEventListener('error', (event) => {
    const workerError = event.error ?? new Error(event.message || 'Background removal worker failed');
    rejectAllPendingRequests(workerError);
    worker.terminate();
    workerInstance = null;
    preloadPromise = null;
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
  buildRequest: (id: number, config: RemoveBackgroundWorkerConfig) => RemoveBackgroundWorkerRequest
): Promise<RemoveBackgroundWorkerResponse> {
  const id = ++requestId;
  const config = getWorkerConfig();
  const request = buildRequest(id, config);

  return new Promise<RemoveBackgroundWorkerResponse>((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject });
    getWorker().postMessage(request);
  });
}

function toPipelineError(response: Extract<RemoveBackgroundWorkerResponse, { ok: false }>): ImagePipelineError {
  const fallbackCode = response.kind === 'preload' ? 'IMAGE_MODEL_LOAD_FAILED' : 'BACKGROUND_REMOVAL_FAILED';
  return new ImagePipelineError(response.code ?? fallbackCode, response.message);
}

export async function preloadBackgroundRemovalModel(): Promise<void> {
  if (!preloadPromise) {
    preloadPromise = callWorker((id, config) => ({
      id,
      kind: 'preload',
      config,
    }))
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
  imageBase64: string,
  mimeType: string,
  maxInferenceLongEdge = HIGH_QUALITY_MAX_INFERENCE_LONG_EDGE
): Promise<RemoveBackgroundResult> {
  try {
    const response = await callWorker((id, config) => ({
      id,
      kind: 'remove-background',
      imageBase64,
      mimeType,
      maxInferenceLongEdge,
      config,
    }));

    if (!response.ok) {
      throw toPipelineError(response);
    }
    if (response.kind !== 'remove-background') {
      throw new ImagePipelineError('BACKGROUND_REMOVAL_FAILED', 'Invalid background removal worker response');
    }

    return {
      processedImageData: response.processedImageBase64,
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
    if (workerInstance) {
      workerInstance.terminate();
      workerInstance = null;
    }
    rejectAllPendingRequests(new Error('Background removal worker disposed'));
    preloadPromise = null;
  });
}
