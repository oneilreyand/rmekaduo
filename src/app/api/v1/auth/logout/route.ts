import { NextRequest } from 'next/server';
import { revokeSession, validateSession } from '@/server/auth/session-service';
import { recordAuditEvent } from '@/server/audit/audit-service';
import { withTransaction } from '@/server/db/postgres-client';
import { successResponse } from '@/server/utils/response-helper';

export async function POST(req: NextRequest) {
  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || '';

  const cookieSession = req.cookies.get('session_id')?.value;
  let authHeader = req.headers.get('authorization');
  let bearerSession: string | null = null;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    bearerSession = authHeader.substring(7).trim();
  }

  const sessionId = cookieSession || bearerSession;

  if (sessionId) {
    const context = await validateSession(sessionId);
    if (context) {
      await withTransaction(async (executor) => {
        await recordAuditEvent({
          organizationId: context.organizationId,
          branchId: context.activeBranchId,
          userId: context.accountId,
          action: 'AUTH_LOGOUT',
          entityName: 'sessions',
          entityId: sessionId,
          ipAddress: clientIp,
          userAgent,
        }, executor);
        await revokeSession(sessionId, executor);
      });
    } else {
      await revokeSession(sessionId);
    }
  }

  const response = successResponse({ loggedOut: true }, 'Logout berhasil', 200);

  // Bersihkan cookie sesi
  response.cookies.delete('session_id');

  return response;
}
