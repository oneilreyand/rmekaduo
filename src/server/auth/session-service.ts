import { query, withTransaction, type DatabaseExecutor } from '../db/postgres-client.ts';
import { generateSessionToken } from './crypto.ts';
import { recordAuditEvent } from '../audit/audit-service.ts';

export interface RoleInfo {
  id: string;
  code: string;
  name: string;
  scopeType: 'ORGANIZATION' | 'BRANCH';
  branchId: string | null;
}

export interface ResolvedSessionContext {
  sessionId: string;
  accountId: string;
  organizationId: string;
  organizationCode: string;
  organizationName: string;
  activeBranchId: string | null;
  activeBranchCode: string | null;
  activeBranchName: string | null;
  username: string;
  fullName: string;
  email: string | null;
  mfaEnabled: boolean;
  roles: RoleInfo[];
  permissions: string[];
  assignedBranchIds: string[];
  isOrgAdmin: boolean;
}

interface SessionRow {
  id: string;
  account_id: string;
  organization_id: string;
  active_branch_id: string | null;
  ip_address: string;
  user_agent: string | null;
  expires_at: Date;
  created_at: Date;
  last_active_at: Date;
  username: string;
  full_name: string;
  email: string | null;
  mfa_enabled: boolean;
  account_active: boolean;
  locked_until: Date | null;
  org_code: string;
  org_name: string;
  org_active: boolean;
  branch_code: string | null;
  branch_name: string | null;
}

interface RolePermRow {
  role_id: string;
  role_code: string;
  role_name: string;
  scope_type: 'ORGANIZATION' | 'BRANCH';
  branch_id: string | null;
  perm_code: string | null;
}

/**
 * Membuat sesi server-side baru di tabel sessions PostgreSQL.
 * Sesi awal berlaku selama 30 menit (idle timeout).
 */
export async function createSession(params: {
  accountId: string;
  organizationId: string;
  activeBranchId?: string | null;
  ipAddress: string;
  userAgent?: string | null;
}, executor?: DatabaseExecutor): Promise<string> {
  const sessionId = generateSessionToken();
  const idleTimeoutMinutes = 30;
  const expiresAt = new Date(Date.now() + idleTimeoutMinutes * 60 * 1000);

  const execute = executor?.query.bind(executor) ?? query;
  await execute(
    `
    INSERT INTO sessions (
      id,
      account_id,
      organization_id,
      active_branch_id,
      ip_address,
      user_agent,
      expires_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      sessionId,
      params.accountId,
      params.organizationId,
      params.activeBranchId || null,
      params.ipAddress,
      params.userAgent || null,
      expiresAt,
    ]
  );

  return sessionId;
}

/**
 * Memvalidasi token sesi dan memperbarui sliding window idle timeout.
 * Mengembalikan ResolvedSessionContext lengkap hasil resolusi server-side,
 * atau null jika sesi tidak valid/kedaluwarsa.
 */
export async function validateSession(sessionId: string): Promise<ResolvedSessionContext | null> {
  if (!sessionId || typeof sessionId !== 'string') {
    return null;
  }

  const rows = await query<SessionRow>(
    `
    SELECT 
      s.id,
      s.account_id,
      s.organization_id,
      s.active_branch_id,
      s.ip_address,
      s.user_agent,
      s.expires_at,
      s.created_at,
      s.last_active_at,
      a.username,
      a.full_name,
      a.email,
      a.mfa_enabled,
      a.is_active AS account_active,
      a.locked_until,
      o.code AS org_code,
      o.name AS org_name,
      o.is_active AS org_active,
      b.code AS branch_code,
      b.name AS branch_name
    FROM sessions s
    JOIN accounts a ON s.account_id = a.id
    JOIN organizations o ON s.organization_id = o.id
    LEFT JOIN branches b ON s.active_branch_id = b.id
    WHERE s.id = $1
    `,
    [sessionId]
  );

  if (rows.length === 0 || !rows[0]) {
    return null;
  }

  const s = rows[0];
  const now = new Date();

  // Akun atau organisasi nonaktif
  if (!s.account_active || !s.org_active) {
    await revokeSession(sessionId);
    return null;
  }

  // Akun terkunci
  if (s.locked_until && new Date(s.locked_until) > now) {
    return null;
  }

  // Idle timeout (30 menit)
  if (new Date(s.expires_at) <= now) {
    await revokeSession(sessionId);
    return null;
  }

  // Absolute timeout (12 jam)
  const createdAt = new Date(s.created_at);
  const absoluteLimitMs = 12 * 60 * 60 * 1000;
  if (now.getTime() - createdAt.getTime() > absoluteLimitMs) {
    await revokeSession(sessionId);
    return null;
  }

  // Perpanjang sliding window: min(now + 30m, createdAt + 12h)
  const idleExpires = new Date(now.getTime() + 30 * 60 * 1000);
  const maxExpires = new Date(createdAt.getTime() + absoluteLimitMs);
  const newExpires = idleExpires < maxExpires ? idleExpires : maxExpires;

  await query(
    `
    UPDATE sessions 
    SET last_active_at = CURRENT_TIMESTAMP, expires_at = $1 
    WHERE id = $2
    `,
    [newExpires, sessionId]
  );

  // Ambil peran dan hak akses
  const rolePerms = await query<RolePermRow>(
    `
    SELECT 
      r.id AS role_id,
      r.code AS role_code,
      r.name AS role_name,
      r.scope_type,
      ra.branch_id,
      p.code AS perm_code
    FROM role_assignments ra
    JOIN roles r ON ra.role_id = r.id
    LEFT JOIN role_permissions rp ON r.id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.id
    WHERE ra.account_id = $1 
      AND ra.organization_id = $2 
      AND ra.is_active = TRUE
    `,
    [s.account_id, s.organization_id]
  );

  const rolesMap = new Map<string, RoleInfo>();
  const permissionsSet = new Set<string>();
  const assignedBranchesSet = new Set<string>();

  let isOrgAdmin = false;

  for (const row of rolePerms) {
    if (!rolesMap.has(row.role_id)) {
      rolesMap.set(row.role_id, {
        id: row.role_id,
        code: row.role_code,
        name: row.role_name,
        scopeType: row.scope_type,
        branchId: row.branch_id,
      });
    }

    if (row.scope_type === 'ORGANIZATION') {
      isOrgAdmin = true;
    }

    if (row.branch_id) {
      assignedBranchesSet.add(row.branch_id);
    }

    if (row.perm_code) {
      permissionsSet.add(row.perm_code);
    }
  }

  // Ambil juga cabang yang ditugaskan ke nakes (practitioner_branch_assignments) jika ada
  const practitionerBranches = await query<{ branch_id: string }>(
    `
    SELECT pba.branch_id
    FROM practitioner_branch_assignments pba
    JOIN practitioners pr ON pba.practitioner_id = pr.id
    WHERE pr.account_id = $1 
      AND pr.organization_id = $2 
      AND pba.is_active = TRUE
    `,
    [s.account_id, s.organization_id]
  );

  for (const pb of practitionerBranches) {
    assignedBranchesSet.add(pb.branch_id);
  }

  // Jika user adalah organization admin, masukkan seluruh cabang aktif di organisasi
  if (isOrgAdmin) {
    const allOrgBranches = await query<{ id: string }>(
      `SELECT id FROM branches WHERE organization_id = $1 AND is_active = TRUE`,
      [s.organization_id]
    );
    for (const b of allOrgBranches) {
      assignedBranchesSet.add(b.id);
    }
  }

  return {
    sessionId: s.id,
    accountId: s.account_id,
    organizationId: s.organization_id,
    organizationCode: s.org_code,
    organizationName: s.org_name,
    activeBranchId: s.active_branch_id,
    activeBranchCode: s.branch_code,
    activeBranchName: s.branch_name,
    username: s.username,
    fullName: s.full_name,
    email: s.email,
    mfaEnabled: s.mfa_enabled,
    roles: Array.from(rolesMap.values()),
    permissions: Array.from(permissionsSet),
    assignedBranchIds: Array.from(assignedBranchesSet),
    isOrgAdmin,
  };
}

/**
 * Membatalkan sesi (logout) dari PostgreSQL.
 */
export async function revokeSession(
  sessionId: string,
  executor?: DatabaseExecutor
): Promise<boolean> {
  const execute = executor?.query.bind(executor) ?? query;
  const res = await execute<{ id: string }>(
    'DELETE FROM sessions WHERE id = $1 RETURNING id',
    [sessionId]
  );
  return res.length > 0;
}

/**
 * Mengganti cabang aktif pada sesi yang sedang berjalan.
 * Memastikan cabang tujuan merupakan cabang sah yang ditugaskan kepada pengguna.
 */
export async function switchActiveBranch(
  sessionId: string,
  targetBranchId: string,
  ipAddress: string
): Promise<{ success: boolean; error?: string }> {
  const context = await validateSession(sessionId);
  if (!context) {
    return { success: false, error: 'SESSION_INVALID' };
  }

  // Verifikasi cabang tujuan termasuk dalam penugasan pengguna atau peran level organisasi
  const isBranchAllowed = context.isOrgAdmin || context.assignedBranchIds.includes(targetBranchId);
  if (!isBranchAllowed) {
    return { success: false, error: 'BRANCH_ACCESS_DENIED' };
  }

  // Verifikasi cabang ada dan aktif di organisasi yang sama
  const branchCheck = await query<{ id: string; name: string }>(
    `SELECT id, name FROM branches WHERE id = $1 AND organization_id = $2 AND is_active = TRUE`,
    [targetBranchId, context.organizationId]
  );

  if (branchCheck.length === 0) {
    return { success: false, error: 'BRANCH_NOT_FOUND' };
  }

  const oldBranchId = context.activeBranchId;
  await withTransaction(async (executor) => {
    const updated = await executor.query<{ id: string }>(
      `UPDATE sessions SET active_branch_id = $1 WHERE id = $2 RETURNING id`,
      [targetBranchId, sessionId]
    );

    if (updated.length === 0) {
      throw new Error('SESSION_INVALID');
    }

    await recordAuditEvent(
      {
        organizationId: context.organizationId,
        branchId: targetBranchId,
        userId: context.accountId,
        action: 'SESSION_SWITCH_BRANCH',
        entityName: 'sessions',
        entityId: sessionId,
        oldValues: { active_branch_id: oldBranchId },
        newValues: { active_branch_id: targetBranchId },
        ipAddress,
      },
      executor
    );
  });

  return { success: true };
}
