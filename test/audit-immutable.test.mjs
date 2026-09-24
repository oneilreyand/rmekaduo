import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateUp } from '../scripts/migrate.mjs';
import { createTestPool, testDatabaseSkipReason } from './helpers/test-database.mjs';

test('Suite: Audit Logs Immutability (Append-Only Enforcement)', { skip: testDatabaseSkipReason }, async (t) => {
  const pool = createTestPool();

  t.before(async () => {
    await migrateUp(pool);
  });

  t.after(async () => {
    await pool.end();
  });

  await t.test('1. Insert Audit Log berhasil dicatat', async () => {
    const client = await pool.connect();
    try {
      const res = await client.query(`
        INSERT INTO audit_logs (
          correlation_id, action, entity_name, entity_id, new_values, ip_address
        ) VALUES (
          'corr-audit-test-01', 'CREATE', 'patients', 'pat-test-uuid', '{"status": "NEW"}', '127.0.0.1'
        ) RETURNING id, action, entity_name;
      `);

      assert.strictEqual(res.rowCount, 1, 'Harus berhasil mencatat audit log');
      const auditId = res.rows[0].id;

      // 2. Uji Immutabilitas: UPDATE harus diblokir oleh rule database
      await client.query(`
        UPDATE audit_logs 
        SET action = 'TAMPERED_ACTION', entity_name = 'TAMPERED_ENTITY'
        WHERE id = $1;
      `, [auditId]);

      // Periksa bahwa data tidak berubah (aturan prevent_audit_update bekerja)
      const verifyUpdate = await client.query(`
        SELECT action, entity_name FROM audit_logs WHERE id = $1;
      `, [auditId]);

      assert.strictEqual(
        verifyUpdate.rows[0].action, 
        'CREATE', 
        'Action audit log tidak boleh berubah (UPDATE harus diabaikan/dicegah)'
      );
      assert.strictEqual(
        verifyUpdate.rows[0].entity_name, 
        'patients', 
        'Entity name audit log tidak boleh berubah'
      );

      // 3. Uji Immutabilitas: DELETE harus diblokir oleh rule database
      await client.query(`
        DELETE FROM audit_logs WHERE id = $1;
      `, [auditId]);

      // Periksa bahwa record tetap ada (aturan prevent_audit_delete bekerja)
      const verifyDelete = await client.query(`
        SELECT count(*)::int as count FROM audit_logs WHERE id = $1;
      `, [auditId]);

      assert.strictEqual(
        verifyDelete.rows[0].count, 
        1, 
        'Record audit log tidak boleh terhapus (DELETE harus diabaikan/dicegah)'
      );
    } finally {
      client.release();
    }
  });
});
