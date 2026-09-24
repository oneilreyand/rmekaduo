import { validateSession, type ResolvedSessionContext } from './session-service.ts';
import { recordAuditEvent } from '../audit/audit-service.ts';

export interface AuthContextResult {
  authenticated: boolean;
  context?: ResolvedSessionContext;
  error?: string;
  code?: number;
}

export interface AuthorizeOptions {
  requiredPermissions?: string[];
  targetOrganizationId?: string;
  targetBranchId?: string;
  isCrossBranchRmeRead?: boolean;
  encounterBranchId?: string;
  encounterId?: string;
  correlationId?: string;
  ipAddress?: string;
  userAgent?: string | null;
}

export interface AuthorizeResult {
  allowed: boolean;
  error?: string;
  code?: number;
  isCrossBranch?: boolean;
}

/**
 * Meresolusi konteks autentikasi dari request (cookie atau Authorization header).
 * Menerapkan validasi ketat terhadap client hints (X-Branch-ID / X-Faskes-ID).
 */
export async function resolveRequestContext(
  headers: Headers | Record<string, string | undefined>,
  cookies?: { get: (name: string) => { value: string } | undefined } | Record<string, string>,
  clientIp = '127.0.0.1',
  userAgent = ''
): Promise<AuthContextResult> {
  let sessionId: string | null = null;

  // 1. Ekstrak dari cookie
  if (cookies) {
    if (typeof (cookies as any).get === 'function') {
      const cookieObj = (cookies as any).get('session_id');
      if (cookieObj?.value) {
        sessionId = cookieObj.value;
      }
    } else if ((cookies as Record<string, string>)['session_id']) {
      sessionId = (cookies as Record<string, string>)['session_id'];
    }
  }

  // 1b. Ekstrak dari Cookie header jika cookies helper tidak menyediakannya
  if (!sessionId && headers) {
    let cookieHeader: string | null | undefined = null;
    if (typeof (headers as any).get === 'function') {
      cookieHeader = (headers as Headers).get('cookie');
    } else {
      cookieHeader = (headers as Record<string, string | undefined>)['cookie'];
    }
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:^|;\s*)session_id=([^;]+)/);
      if (match && match[1]) {
        sessionId = match[1].trim();
      }
    }
  }

  // 2. Ekstrak dari Authorization: Bearer <token> jika cookie tidak ada
  if (!sessionId) {
    let authHeader: string | null | undefined = null;
    if (typeof (headers as any).get === 'function') {
      authHeader = (headers as Headers).get('authorization');
    } else {
      authHeader = (headers as Record<string, string | undefined>)['authorization'];
    }

    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      sessionId = authHeader.substring(7).trim();
    }
  }

  if (!sessionId) {
    return {
      authenticated: false,
      error: 'AUTH_REQUIRED',
      code: 401,
    };
  }

  const context = await validateSession(sessionId);
  if (!context) {
    return {
      authenticated: false,
      error: 'SESSION_INVALID',
      code: 401,
    };
  }

  // 3. Evaluasi Client Hints (X-Branch-ID atau X-Faskes-ID)
  // Sesuai ADR 0005, header client TIDAK PERNAH menjadi otoritas akses.
  // Bila client memberikan hint cabang yang tidak ada dalam hak akses penugasan sesi, tolak segera (403).
  let branchHint: string | null | undefined = null;
  if (typeof (headers as any).get === 'function') {
    branchHint = (headers as Headers).get('x-branch-id') || (headers as Headers).get('x-faskes-id');
  } else {
    branchHint =
      (headers as Record<string, string | undefined>)['x-branch-id'] ||
      (headers as Record<string, string | undefined>)['x-faskes-id'];
  }

  if (branchHint && branchHint.trim()) {
    const hint = branchHint.trim();
    const isHintAllowed =
      context.isOrgAdmin ||
      context.assignedBranchIds.includes(hint) ||
      context.activeBranchId === hint ||
      context.activeBranchCode === hint;

    if (!isHintAllowed) {
      // Catat percobaan manipulasi header cabang ke audit log
      await recordAuditEvent({
        organizationId: context.organizationId,
        branchId: context.activeBranchId,
        userId: context.accountId,
        action: 'AUTH_DENIED',
        entityName: 'branches',
        entityId: hint,
        newValues: {
          reason: 'MANIPULATED_BRANCH_HINT',
          hint,
          assignedBranches: context.assignedBranchIds,
        },
        ipAddress: clientIp,
        userAgent,
      });

      return {
        authenticated: false,
        error: 'BRANCH_ACCESS_DENIED',
        code: 403,
      };
    }
  }

  return {
    authenticated: true,
    context,
  };
}

/**
 * Mesin Otorisasi (Default-Deny Policy)
 * Memvalidasi hak akses tindakan terhadap organisasi, cabang, dan permissions.
 */
export async function authorizeAction(
  context: ResolvedSessionContext,
  options: AuthorizeOptions
): Promise<AuthorizeResult> {
  const ipAddress = options.ipAddress || '127.0.0.1';
  const userAgent = options.userAgent || null;
  const correlationId = options.correlationId || null;

  // 1. Batas Organisasi Induk (Strict Multi-Tenant Boundary)
  if (options.targetOrganizationId && options.targetOrganizationId !== context.organizationId) {
    await recordAuditEvent({
      organizationId: context.organizationId,
      branchId: context.activeBranchId,
      userId: context.accountId,
      correlationId,
      action: 'AUTH_DENIED',
      entityName: 'organizations',
      entityId: options.targetOrganizationId,
      newValues: {
        reason: 'ORGANIZATION_MISMATCH',
        targetOrg: options.targetOrganizationId,
        userOrg: context.organizationId,
      },
      ipAddress,
      userAgent,
    });

    return {
      allowed: false,
      error: 'ORGANIZATION_MISMATCH',
      code: 403,
    };
  }

  // 2. Evaluasi Permissions (Granular RBAC)
  if (options.requiredPermissions && options.requiredPermissions.length > 0) {
    const missingPermissions = options.requiredPermissions.filter(
      (perm) => !context.permissions.includes(perm)
    );

    if (missingPermissions.length > 0) {
      await recordAuditEvent({
        organizationId: context.organizationId,
        branchId: context.activeBranchId,
        userId: context.accountId,
        correlationId,
        action: 'AUTH_DENIED',
        entityName: 'permissions',
        entityId: missingPermissions.join(','),
        newValues: {
          reason: 'PERMISSION_DENIED',
          missingPermissions,
          userPermissions: context.permissions,
        },
        ipAddress,
        userAgent,
      });

      return {
        allowed: false,
        error: 'PERMISSION_DENIED',
        code: 403,
      };
    }
  }

  // 3. Evaluasi Akses Rekam Medis Lintas Cabang (Cross-Branch RME Visibility - ADR 0005)
  if (options.isCrossBranchRmeRead && options.encounterBranchId) {
    // Jika encounter berasal dari cabang yang berbeda dari cabang aktif user
    if (options.encounterBranchId !== context.activeBranchId) {
      const hasCrossBranchPermission =
        context.permissions.includes('cross_branch:read') || context.isOrgAdmin;

      if (!hasCrossBranchPermission) {
        await recordAuditEvent({
          organizationId: context.organizationId,
          branchId: context.activeBranchId,
          userId: context.accountId,
          correlationId,
          action: 'AUTH_DENIED',
          entityName: 'encounters',
          entityId: options.encounterId || options.encounterBranchId,
          newValues: {
            reason: 'CROSS_BRANCH_PERMISSION_MISSING',
            encounterBranch: options.encounterBranchId,
            userActiveBranch: context.activeBranchId,
          },
          ipAddress,
          userAgent,
        });

        return {
          allowed: false,
          error: 'BRANCH_ACCESS_DENIED',
          code: 403,
        };
      }

      // Akses diizinkan; catat secara otomatis ke audit trail immutable
      await recordAuditEvent({
        organizationId: context.organizationId,
        branchId: context.activeBranchId,
        userId: context.accountId,
        correlationId,
        action: 'CROSS_BRANCH_ACCESS',
        entityName: 'encounters',
        entityId: options.encounterId || options.encounterBranchId,
        newValues: {
          encounter_branch: options.encounterBranchId,
          reader_branch: context.activeBranchId,
          encounter_id: options.encounterId,
          reason: 'internal_referral_continuity',
        },
        ipAddress,
        userAgent,
      });

      return {
        allowed: true,
        isCrossBranch: true,
      };
    }
  }

  // 4. Batas Cabang Standar (Operasional Loket, Periksa, Kasir, Farmasi)
  if (options.targetBranchId) {
    const isBranchAllowed =
      context.isOrgAdmin ||
      context.activeBranchId === options.targetBranchId ||
      context.assignedBranchIds.includes(options.targetBranchId);

    if (!isBranchAllowed) {
      await recordAuditEvent({
        organizationId: context.organizationId,
        branchId: context.activeBranchId,
        userId: context.accountId,
        correlationId,
        action: 'AUTH_DENIED',
        entityName: 'branches',
        entityId: options.targetBranchId,
        newValues: {
          reason: 'UNAUTHORIZED_BRANCH_OPERATION',
          targetBranch: options.targetBranchId,
          userActiveBranch: context.activeBranchId,
          assignedBranches: context.assignedBranchIds,
        },
        ipAddress,
        userAgent,
      });

      return {
        allowed: false,
        error: 'BRANCH_ACCESS_DENIED',
        code: 403,
      };
    }
  }

  return { allowed: true };
}
