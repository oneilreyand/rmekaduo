import { query, type DatabaseExecutor } from '../db/postgres-client.ts';

/**
 * Service Audit Trail Immutable
 * Mencatat seluruh event keamanan dan akses sensitif ke tabel audit_logs.
 * Sesuai ADR 0004 & ADR 0005, audit log bersifat append-only dan dilindungi
 * rule database prevent_audit_update dan prevent_audit_delete.
 */

export interface AuditEventParams {
  organizationId?: string | null;
  branchId?: string | null;
  userId?: string | null;
  correlationId?: string | null;
  action: string;
  entityName: string;
  entityId: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress: string;
  userAgent?: string | null;
}

export async function recordAuditEvent(
  params: AuditEventParams,
  executor?: DatabaseExecutor
): Promise<void> {
  const {
    organizationId = null,
    branchId = null,
    userId = null,
    correlationId = null,
    action,
    entityName,
    entityId,
    oldValues = null,
    newValues = null,
    ipAddress,
    userAgent = null,
  } = params;

  try {
    const execute = executor?.query.bind(executor) ?? query;
    await execute(
      `
      INSERT INTO audit_logs (
        organization_id,
        branch_id,
        user_id,
        correlation_id,
        action,
        entity_name,
        entity_id,
        old_values,
        new_values,
        ip_address,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `,
      [
        organizationId,
        branchId,
        userId,
        correlationId,
        action,
        entityName,
        entityId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipAddress,
        userAgent,
      ]
    );
  } catch (err) {
    // Audit failure tidak boleh membocorkan rahasia ke luar, tapi harus tercatat di stdout/stderr server
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[CRITICAL AUDIT FAILURE] Gagal menulis audit log: ${message}`, {
      action,
      entityName,
      entityId,
    });
    throw err;
  }
}
