import type { ImagePipelineErrorCode, Size } from './maskUtils';

export interface RemoveBackgroundWorkerConfig {
  segmentationAssetBase?: string;
}

export interface RemoveBackgroundWorkerPreloadRequest {
  id: number;
  kind: 'preload';
  config: RemoveBackgroundWorkerConfig;
}

export interface RemoveBackgroundWorkerRunRequest {
  id: number;
  kind: 'remove-background';
  imageBase64: string;
  mimeType: string;
  maxInferenceLongEdge: number;
  config: RemoveBackgroundWorkerConfig;
}

export type RemoveBackgroundWorkerRequest =
  | RemoveBackgroundWorkerPreloadRequest
  | RemoveBackgroundWorkerRunRequest;

export interface RemoveBackgroundWorkerPreloadSuccess {
  id: number;
  ok: true;
  kind: 'preload';
}

export interface RemoveBackgroundWorkerRunSuccess {
  id: number;
  ok: true;
  kind: 'remove-background';
  processedImageBuffer: ArrayBuffer;
  inferenceSize: Size;
  durationMs: number;
}

export interface RemoveBackgroundWorkerFailure {
  id: number;
  ok: false;
  kind: 'preload' | 'remove-background';
  code: ImagePipelineErrorCode;
  message?: string;
}

export type RemoveBackgroundWorkerResponse =
  | RemoveBackgroundWorkerPreloadSuccess
  | RemoveBackgroundWorkerRunSuccess
  | RemoveBackgroundWorkerFailure;
