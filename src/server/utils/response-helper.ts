import { NextResponse } from 'next/server';

export interface StandardApiResponse<T> {
  success: boolean;
  code: number;
  message?: string;
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
  };
}

export interface StandardApiError {
  success: false;
  code: number;
  error: string;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export function successResponse<T>(data: T, message = 'Operasi berhasil', code = 200) {
  const payload: StandardApiResponse<T> = {
    success: true,
    code,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: `req-${Math.random().toString(36).substring(2, 11)}`,
    },
  };
  return NextResponse.json(payload, { status: code });
}

export function errorResponse(
  message: string,
  code = 400,
  error = 'BAD_REQUEST',
  errors?: Array<{ field: string; message: string }>
) {
  const payload: StandardApiError = {
    success: false,
    code,
    error,
    message,
    errors,
  };
  return NextResponse.json(payload, { status: code });
}
