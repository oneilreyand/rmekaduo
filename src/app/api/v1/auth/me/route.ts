import { NextRequest } from 'next/server';
import { resolveRequestContext } from '@/server/auth/auth-engine';
import { successResponse, errorResponse } from '@/server/utils/response-helper';

export async function GET(req: NextRequest) {
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

  return successResponse(
    {
      user: {
        id: context.accountId,
        username: context.username,
        fullName: context.fullName,
        email: context.email,
        mfaEnabled: context.mfaEnabled,
      },
      organization: {
        id: context.organizationId,
        code: context.organizationCode,
        name: context.organizationName,
      },
      activeBranch: {
        id: context.activeBranchId,
        code: context.activeBranchCode,
        name: context.activeBranchName,
      },
      roles: context.roles,
      permissions: context.permissions,
      assignedBranches: context.assignedBranchIds,
      isOrgAdmin: context.isOrgAdmin,
    },
    'Konteks sesi berhasil dimuat',
    200
  );
}
