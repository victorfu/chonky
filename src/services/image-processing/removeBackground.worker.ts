import { preload, removeBackground, type Config } from '@imgly/background-removal';
import {
  HIGH_QUALITY_MAX_INFERENCE_LONG_EDGE,
  type ImagePipelineErrorCode,
  type Size,
} from './maskUtils';
import type {
  RemoveBackgroundWorkerConfig,
  RemoveBackgroundWorkerFailure,
  RemoveBackgroundWorkerRequest,
  RemoveBackgroundWorkerResponse,
  RemoveBackgroundWorkerRunRequest,
} from './removeBackground.worker.types';

const BASE_CONFIG: Config = {
  model: 'isnet',
  device: 'cpu',
  output: {
    format: 'image/png',
    quality: 1,
  },
};

let preloadState: { key: string; promise: Promise<void> } | null = null;

function toConfig(config: RemoveBackgroundWorkerConfig): Config {
  const basePath = config.segmentationAssetBase?.replace(/\/$/, '');
  if (!basePath) {
    return BASE_CONFIG;
  }

  return {
    ...BASE_CONFIG,
    publicPath: `${basePath}/imgly/`,
  };
}

async function ensureModelReady(config: RemoveBackgroundWorkerConfig): Promise<void> {
  const resolvedConfig = toConfig(config);
  const key = JSON.stringify(resolvedConfig);

  if (!preloadState || preloadState.key !== key) {
    preloadState = {
      key,
      promise: preload(resolvedConfig),
    };
  }

  try {
    await preloadState.promise;
  } catch (error) {
    preloadState = null;
    throw error;
  }
}

function getInferenceSize(originalSize: Size, maxInferenceLongEdge: number): Size {
  const maxEdge = Math.max(1, maxInferenceLongEdge || HIGH_QUALITY_MAX_INFERENCE_LONG_EDGE);
  const longEdge = Math.max(originalSize.width, originalSize.height);

  if (longEdge <= maxEdge) {
    return originalSize;
  }

  const scale = maxEdge / longEdge;
  return {
    width: Math.max(1, Math.round(originalSize.width * scale)),
    height: Math.max(1, Math.round(originalSize.height * scale)),
  };
}

function createCanvas(size: Size): OffscreenCanvas {
  if (typeof OffscreenCanvas === 'undefined') {
    throw new Error('OffscreenCanvas is not supported in this environment');
  }

  return new OffscreenCanvas(size.width, size.height);
}

async function imageBitmapToBlob(
  image: ImageBitmap,
  size: Size,
  mimeType: string
): Promise<Blob> {
  const canvas = createCanvas(size);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0, size.width, size.height);

  return canvas.convertToBlob({
    type: mimeType,
    quality: 1,
  });
}

async function blobToImageBitmap(blob: Blob): Promise<ImageBitmap> {
  return createImageBitmap(blob);
}

async function decodeInputBlob(imageBase64: string, mimeType: string): Promise<Blob> {
  const res = await fetch(`data:${mimeType};base64,${imageBase64}`);
  if (!res.ok) {
    throw new Error(`Failed to decode base64 image (status ${res.status})`);
  }
  return res.blob();
}

function buildFailure(
  request: RemoveBackgroundWorkerRequest,
  code: ImagePipelineErrorCode,
  message?: string
): RemoveBackgroundWorkerFailure {
  return {
    id: request.id,
    ok: false,
    kind: request.kind,
    code,
    message,
  };
}

async function processBackgroundRemoval(
  request: RemoveBackgroundWorkerRunRequest
): Promise<RemoveBackgroundWorkerResponse> {
  const start = performance.now();
  const inputBlob = await decodeInputBlob(request.imageBase64, request.mimeType);
  const inputBitmap = await blobToImageBitmap(inputBlob);

  let outputBitmap: ImageBitmap | null = null;

  try {
    const originalSize: Size = {
      width: inputBitmap.width,
      height: inputBitmap.height,
    };

    const inferenceSize = getInferenceSize(originalSize, request.maxInferenceLongEdge);
    const inferenceBlob =
      inferenceSize.width === originalSize.width && inferenceSize.height === originalSize.height
        ? inputBlob
        : await imageBitmapToBlob(inputBitmap, inferenceSize, request.mimeType);

    await ensureModelReady(request.config);
    const outputBlob = await removeBackground(inferenceBlob, toConfig(request.config));

    let finalBlob = outputBlob;
    if (inferenceSize.width !== originalSize.width || inferenceSize.height !== originalSize.height) {
      outputBitmap = await blobToImageBitmap(outputBlob);
      finalBlob = await imageBitmapToBlob(outputBitmap, originalSize, 'image/png');
    }

    return {
      id: request.id,
      ok: true,
      kind: 'remove-background',
      processedImageBuffer: await finalBlob.arrayBuffer(),
      inferenceSize,
      durationMs: Math.round(performance.now() - start),
    };
  } finally {
    inputBitmap.close();
    outputBitmap?.close();
  }
}

async function handleRequest(
  request: RemoveBackgroundWorkerRequest
): Promise<RemoveBackgroundWorkerResponse> {
  if (request.kind === 'preload') {
    try {
      await ensureModelReady(request.config);
      return {
        id: request.id,
        ok: true,
        kind: 'preload',
      };
    } catch (error) {
      return buildFailure(request, 'IMAGE_MODEL_LOAD_FAILED', String(error));
    }
  }

  try {
    return await processBackgroundRemoval(request);
  } catch (error) {
    const code = String(error).toLowerCase().includes('model')
      ? 'IMAGE_MODEL_LOAD_FAILED'
      : 'BACKGROUND_REMOVAL_FAILED';

    return buildFailure(request, code, String(error));
  }
}

self.addEventListener('message', (event: MessageEvent<RemoveBackgroundWorkerRequest>) => {
  void handleRequest(event.data).then((response) => {
    const transferables: Transferable[] = [];
    if (response.ok && response.kind === 'remove-background') {
      transferables.push(response.processedImageBuffer);
    }
    self.postMessage(response, { transfer: transferables });
  });
});
