import { NextRequest, NextResponse } from 'next/server';
import { resolveRequestContext, authorizeAction } from './auth-engine.ts';
import { errorResponse } from '../utils/response-helper.ts';
import type { ResolvedSessionContext } from './session-service.ts';

export interface RouteAuthOptions {
  requiredPermissions?: string[];
  allowCrossBranchRead?: boolean;
}

export type AuthenticatedRouteHandler = (
  req: NextRequest,
  context: ResolvedSessionContext,
  params?: Record<string, string | string[]>
) => Promise<NextResponse>;

/**
 * Higher-Order Function untuk memproteksi Route Handler Next.js.
 * Memverifikasi sesi server-side dan menerapkan default-deny RBAC.
 */
export function withAuth(
  handler: AuthenticatedRouteHandler,
  options: RouteAuthOptions = {}
) {
  return async (
    req: NextRequest,
    routeProps: { params: Promise<Record<string, string | string[]>> }
  ) => {
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || '';

    const authResult = await resolveRequestContext(
      req.headers,
      req.cookies,
      clientIp,
      userAgent
    );

    if (!authResult.authenticated || !authResult.context) {
      return errorResponse(
        authResult.error === 'SESSION_INVALID'
          ? 'Sesi telah kedaluwarsa atau tidak valid'
          : authResult.error === 'BRANCH_ACCESS_DENIED'
          ? 'Akses cabang ditolak'
          : 'Autentikasi diperlukan',
        authResult.code || 401,
        authResult.error || 'UNAUTHORIZED'
      );
    }

    const { context } = authResult;

    if (options.requiredPermissions && options.requiredPermissions.length > 0) {
      const authz = await authorizeAction(context, {
        requiredPermissions: options.requiredPermissions,
        ipAddress: clientIp,
        userAgent,
      });

      if (!authz.allowed) {
        return errorResponse(
          'Akses ditolak: izin tidak mencukupi',
          authz.code || 403,
          authz.error || 'FORBIDDEN'
        );
      }
    }

    const resolvedParams = await routeProps.params;
    return handler(req, context, resolvedParams);
  };
}
