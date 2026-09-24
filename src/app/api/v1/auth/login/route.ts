import { NextRequest } from 'next/server';
import { query } from '@/server/db/postgres-client';
import { verifyPassword } from '@/server/auth/crypto';
import { createSession, validateSession } from '@/server/auth/session-service';
import { recordAuditEvent } from '@/server/audit/audit-service';
import { withTransaction } from '@/server/db/postgres-client';
import {
  checkRateLimit,
  recordRateLimitAttempt,
  resetRateLimit,
} from '@/server/auth/rate-limiter';
import { successResponse, errorResponse } from '@/server/utils/response-helper';

interface AccountRow {
  id: string;
  organization_id: string;
  username: string;
  password_hash: string;
  full_name: string;
  email: string | null;
  is_active: boolean;
  mfa_enabled: boolean;
  failed_login_attempts: number;
  locked_until: Date | null;
  org_code: string;
  org_name: string;
  org_active: boolean;
}

export async function POST(req: NextRequest) {
  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || '';

  try {
    const body = await req.json();
    const { username, password, organizationCode } = body;

    if (!username || !password) {
      return errorResponse('Username dan password wajib diisi', 400, 'VALIDATION_ERROR');
    }

    const rateLimitKey = `login:${clientIp}:${username}`;
    const rateCheck = checkRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      return errorResponse(
        'Terlalu banyak percobaan login gagal. Silakan coba lagi dalam 15 menit.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    // Cari akun di database
    let sql = `
      SELECT 
        a.id,
        a.organization_id,
        a.username,
        a.password_hash,
        a.full_name,
        a.email,
        a.is_active,
        a.mfa_enabled,
        a.failed_login_attempts,
        a.locked_until,
        o.code AS org_code,
        o.name AS org_name,
        o.is_active AS org_active
      FROM accounts a
      JOIN organizations o ON a.organization_id = o.id
      WHERE a.username = $1
    `;
    const params: unknown[] = [username];

    if (organizationCode) {
      sql += ' AND o.code = $2';
      params.push(organizationCode);
    }

    const accounts = await query<AccountRow>(sql, params);
    if (accounts.length === 0 || !accounts[0]) {
      recordRateLimitAttempt(rateLimitKey);
      return errorResponse('Kredensial tidak valid', 401, 'INVALID_CREDENTIALS');
    }

    const account = accounts[0];

    if (!account.is_active || !account.org_active) {
      return errorResponse('Akun atau organisasi nonaktif', 403, 'ACCOUNT_INACTIVE');
    }

    const now = new Date();
    if (account.locked_until && new Date(account.locked_until) > now) {
      return errorResponse(
        'Akun terkunci sementara karena terlalu banyak percobaan gagal. Silakan tunggu 15 menit.',
        403,
        'ACCOUNT_LOCKED'
      );
    }

    // Verifikasi password
    const passwordMatch = await verifyPassword(password, account.password_hash);
    if (!passwordMatch) {
      const newFailed = (account.failed_login_attempts || 0) + 1;
      recordRateLimitAttempt(rateLimitKey);

      if (newFailed >= 5) {
        const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        await withTransaction(async (executor) => {
          await executor.query(
            'UPDATE accounts SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3',
            [newFailed, lockedUntil, account.id]
          );

          await recordAuditEvent({
            organizationId: account.organization_id,
            userId: account.id,
            action: 'ACCOUNT_LOCKED',
            entityName: 'accounts',
            entityId: account.id,
            newValues: { failedAttempts: newFailed, lockedUntil },
            ipAddress: clientIp,
            userAgent,
          }, executor);
        });

        return errorResponse(
          'Akun telah dikunci selama 15 menit karena 5 kali percobaan gagal.',
          403,
          'ACCOUNT_LOCKED'
        );
      }

      await withTransaction(async (executor) => {
        await executor.query(
          'UPDATE accounts SET failed_login_attempts = $1 WHERE id = $2',
          [newFailed, account.id]
        );

        await recordAuditEvent({
          organizationId: account.organization_id,
          userId: account.id,
          action: 'AUTH_LOGIN_FAILED',
          entityName: 'accounts',
          entityId: account.id,
          newValues: { failedAttempts: newFailed },
          ipAddress: clientIp,
          userAgent,
        }, executor);
      });

      return errorResponse('Kredensial tidak valid', 401, 'INVALID_CREDENTIALS');
    }

    // Cari cabang aktif awal dari penugasan server-side. Client tidak boleh
    // menentukan cabang aktif melalui branchCodeHint saat login.
    let initialBranchId: string | null = null;
    const docBranch = await query<{ branch_id: string }>(
      `
        SELECT pba.branch_id
        FROM practitioner_branch_assignments pba
        JOIN practitioners pr ON pba.practitioner_id = pr.id
        WHERE pr.account_id = $1 AND pba.is_active = TRUE
        ORDER BY pba.is_primary_branch DESC
        LIMIT 1
        `,
      [account.id]
    );
    if (docBranch.length > 0 && docBranch[0]) {
      initialBranchId = docBranch[0].branch_id;
    }

    if (!initialBranchId) {
      // Ambil cabang dari role assignment
      const roleBranch = await query<{ branch_id: string }>(
        'SELECT branch_id FROM role_assignments WHERE account_id = $1 AND branch_id IS NOT NULL AND is_active = TRUE LIMIT 1',
        [account.id]
      );
      if (roleBranch.length > 0 && roleBranch[0]) {
        initialBranchId = roleBranch[0].branch_id;
      }
    }

    if (!initialBranchId) {
      // Ambil cabang pertama organisasi jika peran tingkat organisasi
      const firstBranch = await query<{ id: string }>(
        'SELECT id FROM branches WHERE organization_id = $1 AND is_active = TRUE ORDER BY code ASC LIMIT 1',
        [account.organization_id]
      );
      if (firstBranch.length > 0 && firstBranch[0]) {
        initialBranchId = firstBranch[0].id;
      }
    }

    const sessionId = await withTransaction(async (executor) => {
      await executor.query(
        'UPDATE accounts SET failed_login_attempts = 0, locked_until = NULL, last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
        [account.id]
      );

      const createdSessionId = await createSession({
        accountId: account.id,
        organizationId: account.organization_id,
        activeBranchId: initialBranchId,
        ipAddress: clientIp,
        userAgent,
      }, executor);

      await recordAuditEvent({
        organizationId: account.organization_id,
        branchId: initialBranchId,
        userId: account.id,
        action: 'AUTH_LOGIN_SUCCESS',
        entityName: 'sessions',
        entityId: createdSessionId,
        newValues: { activeBranchId: initialBranchId },
        ipAddress: clientIp,
        userAgent,
      }, executor);

      return createdSessionId;
    });
    resetRateLimit(rateLimitKey);

    const sessionContext = await validateSession(sessionId);

    const response = successResponse(
      {
        user: {
          id: account.id,
          username: account.username,
          fullName: account.full_name,
          email: account.email,
        },
        organization: {
          id: account.organization_id,
          code: account.org_code,
          name: account.org_name,
        },
        activeBranch: sessionContext
          ? {
              id: sessionContext.activeBranchId,
              code: sessionContext.activeBranchCode,
              name: sessionContext.activeBranchName,
            }
          : null,
        roles: sessionContext?.roles || [],
        permissions: sessionContext?.permissions || [],
        assignedBranches: sessionContext?.assignedBranchIds || [],
      },
      'Login berhasil',
      200
    );

    // Set cookie sesi aman
    response.cookies.set({
      name: 'session_id',
      value: sessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 12 * 60 * 60, // 12 jam
    });

    return response;
  } catch {
    return errorResponse('Gagal memproses login', 500, 'INTERNAL_SERVER_ERROR');
  }
}
