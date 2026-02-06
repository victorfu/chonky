export interface Size {
  width: number;
  height: number;
}

export type ImagePipelineErrorCode =
  | 'IMAGE_MODEL_LOAD_FAILED'
  | 'BACKGROUND_REMOVAL_FAILED';

export class ImagePipelineError extends Error {
  readonly code: ImagePipelineErrorCode;
  readonly cause?: unknown;

  constructor(code: ImagePipelineErrorCode, message?: string, cause?: unknown) {
    super(message ?? code);
    this.name = 'ImagePipelineError';
    this.code = code;
    this.cause = cause;
  }
}

export const HIGH_QUALITY_MAX_INFERENCE_LONG_EDGE = 2048;
