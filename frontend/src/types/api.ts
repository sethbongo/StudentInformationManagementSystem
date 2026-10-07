// Common API response envelopes and error types matching Laboratory Activity I & II

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details?: Array<{ field?: string; message: string }>;
  };
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorPayload {
  message: string;
  statusCode: number;
  errorCode?: string;
  fieldErrors?: Record<string, string[]>;
  isNetworkError?: boolean;
}
