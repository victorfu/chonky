export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
