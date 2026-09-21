export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message?: string;
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  code: number;
  error: string;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}
