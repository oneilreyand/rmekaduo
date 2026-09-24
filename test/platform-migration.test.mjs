import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateUp, migrateDown } from '../scripts/migrate.mjs';
import { seedPlatformFixtures } from '../scripts/seed-platform-fixtures.mjs';
import { performBackup, performRestore, getTableCounts } from '../scripts/backup-restore.mjs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unlinkSync, existsSync } from 'node:fs';
import { createTestPool, getTestDatabaseUrl, testDatabaseSkipReason } from './helpers/test-database.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

test('Suite: Database Migrations, Rollback & Backup/Restore', { skip: testDatabaseSkipReason }, async (t) => {
  const pool = createTestPool();

  t.after(async () => {
    await pool.end();
  });

  await t.test('1. Migration Rollback (Clean state test)', async () => {
    // Rollback semua migration yang terpasang (ada 2: 0002 RLS dan 0001 schema)
    // migrateDown rollback satu per satu dari yang terbaru
    let rolled = await migrateDown(pool);
    while (rolled !== null) {
      rolled = await migrateDown(pool);
    }

    const client = await pool.connect();
    try {
      const res = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN ('organizations', 'branches', 'patients', 'practitioners', 'audit_logs');
      `);
      assert.strictEqual(res.rows.length, 0, 'Semua tabel platform harus terhapus saat rollback');
    } finally {
      client.release();
    }
  });

  await t.test('2. Migration Up (Schema creation test)', async () => {
    const appliedCount = await migrateUp(pool);
    assert.ok(appliedCount >= 1, 'Harus ada migrasi yang terpasang');

    const client = await pool.connect();
    try {
      const res = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN (
            'organizations', 'branches', 'accounts', 'sessions', 
            'roles', 'permissions', 'role_permissions', 'role_assignments', 
            'practitioners', 'practitioner_branch_assignments', 
            'polis', 'schedules', 'patients', 'patient_duplicate_candidates', 
            'audit_logs'
          );
      `);
      assert.strictEqual(res.rows.length, 15, 'Seluruh 15 tabel platform harus terbentuk');
    } finally {
      client.release();
    }
  });

  await t.test('3. Migration Idempotence (Re-running up should do nothing)', async () => {
    const appliedCount = await migrateUp(pool);
    assert.strictEqual(appliedCount, 0, 'Migrasi ulang tidak boleh menjalankan file yang sudah applied');
  });

  await t.test('4. Seed Synthetic Fixtures & Verify Counts', async () => {
    await seedPlatformFixtures(pool);
    const counts = await getTableCounts(pool);

    assert.ok(counts.organizations >= 1, 'Organisasi harus terisi');
    assert.ok(counts.branches >= 2, 'Minimal 2 cabang sintetis terisi');
    assert.ok(counts.accounts >= 3, 'Akun staf sintetis terisi');
    assert.ok(counts.practitioners >= 1, 'Tenaga medis sintetis terisi');
    assert.ok(counts.patients >= 2, 'Pasien kanonik sintetis terisi');
    assert.ok(counts.audit_logs >= 1, 'Audit log awal terisi');
  });

  await t.test('5. Backup and Restore Integrity Test', async () => {
    const countsBefore = await getTableCounts(pool);
    const tempBackupFile = join(__dirname, '../backups/test_backup_temp.sql');

    // Buat backup
    performBackup(tempBackupFile, getTestDatabaseUrl());
    assert.ok(existsSync(tempBackupFile), 'File backup harus terbentuk');

    // Lakukan restore ke database test
    performRestore(tempBackupFile, getTestDatabaseUrl(), { allowRestore: true });
    const countsAfter = await getTableCounts(pool);

    // Bandingkan sebelum dan sesudah
    assert.deepStrictEqual(countsAfter, countsBefore, 'Jumlah baris sebelum dan sesudah restore harus identik (zero data loss)');

    // Bersihkan file sementara
    if (existsSync(tempBackupFile)) {
      unlinkSync(tempBackupFile);
    }
  });
});
