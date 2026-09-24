import { NextRequest } from 'next/server';
import { resolveRequestContext } from '@/server/auth/auth-engine';
import { switchActiveBranch, validateSession } from '@/server/auth/session-service';
import { successResponse, errorResponse } from '@/server/utils/response-helper';

export async function POST(req: NextRequest) {
  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || '';

  const authResult = await resolveRequestContext(req.headers, req.cookies, clientIp, userAgent);

  if (!authResult.authenticated || !authResult.context) {
    return errorResponse(
      authResult.error === 'SESSION_INVALID'
        ? 'Sesi telah kedaluwarsa atau tidak valid'
        : 'Autentikasi diperlukan',
      authResult.code || 401,
      authResult.error || 'UNAUTHORIZED'
    );
  }

  const { context } = authResult;

  try {
    const body = await req.json();
    const { branchId } = body;

    if (!branchId || typeof branchId !== 'string') {
      return errorResponse('branchId wajib disertakan', 400, 'VALIDATION_ERROR');
    }

    const switchResult = await switchActiveBranch(context.sessionId, branchId, clientIp);
    if (!switchResult.success) {
      if (switchResult.error === 'BRANCH_ACCESS_DENIED') {
        return errorResponse(
          'Akses ditolak: Anda tidak ditugaskan pada cabang ini',
          403,
          'BRANCH_ACCESS_DENIED'
        );
      }
      return errorResponse(
        'Cabang tidak ditemukan atau tidak aktif',
        404,
        'BRANCH_NOT_FOUND'
      );
    }

    const updatedContext = await validateSession(context.sessionId);

    return successResponse(
      {
        activeBranch: {
          id: updatedContext?.activeBranchId,
          code: updatedContext?.activeBranchCode,
          name: updatedContext?.activeBranchName,
        },
      },
      'Cabang aktif berhasil diubah',
      200
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse(`Gagal beralih cabang: ${message}`, 500, 'INTERNAL_SERVER_ERROR');
  }
}
