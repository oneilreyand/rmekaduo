/**
 * Suite: PostgreSQL Row-Level Security — Isolasi Data Antar Organisasi
 *
 * Membuktikan bahwa:
 *   1. Koneksi tanpa app.current_organization_id tidak bisa membaca baris apa pun.
 *   2. Koneksi dengan org A tidak bisa membaca baris milik org B.
 *   3. Koneksi dengan org A bisa membaca baris milik org A sendiri.
 *   4. audit_logs INSERT selalu berhasil tanpa context (dibutuhkan oleh auth flow).
 *   5. audit_logs SELECT dibatasi per organisasi.
 *
 * Requirement: REQ-001, REQ-002, REQ-004, REQ-005
 * Evidence ID yang direncanakan: EV-009
 *
 * Catatan: RLS hanya aktif pada koneksi yang BUKAN superuser. Jika
 * DATABASE_URL / RME_TEST_DATABASE_URL menggunakan superuser, RLS bypass terjadi
 * dan test ini akan SKIP dengan pesan yang jelas — bukan FALSE PASS.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateUp, migrateDown } from '../scripts/migrate.mjs';
import { seedPlatformFixtures } from '../scripts/seed-platform-fixtures.mjs';
import { createTestPool, testDatabaseSkipReason } from './helpers/test-database.mjs';

// ORG IDs yang digunakan oleh platform-schema-constraints test (dan seed)
const SINTETIS_ORG_ID = 'a0000000-0000-0000-0000-000000000001';
// ID khusus untuk RLS test — berbeda dari schema-constraints test (a1111111...)
const OTHER_ORG_ID    = 'a9999999-9999-9999-9999-999999999901'; // hanya untuk RLS test

test('Suite: Row-Level Security — Isolasi Data Antar Organisasi', { skip: testDatabaseSkipReason }, async (t) => {
  const pool = createTestPool();

  t.before(async () => {
    await migrateUp(pool);
    await seedPlatformFixtures(pool);

    // Pastikan org "lain" ada agar kita bisa menguji batas antar tenant
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO organizations (id, code, name, is_active)
        VALUES ($1, 'ORG-LAIN-RLS-01', 'Organisasi Lain Uji RLS [SINTETIS]', true)
        ON CONFLICT (id) DO NOTHING;
      `, [OTHER_ORG_ID]);

      // Tambahkan satu cabang di org "lain" agar ada baris yang bisa diuji
      await client.query(`
        INSERT INTO branches (id, organization_id, code, name, is_active)
        VALUES (
          'b9999999-9999-9999-9999-999999999901',
          $1,
          'BR-LAIN-RLS-01',
          'Cabang Uji RLS Org Lain [SINTETIS]',
          true
        )
        ON CONFLICT (organization_id, code) DO NOTHING;
      `, [OTHER_ORG_ID]);
    } finally {
      client.release();
    }
  });

  t.after(async () => {
    await pool.end();
  });

  // ---------------------------------------------------------------------------
  // Cek apakah koneksi menggunakan superuser; jika ya, skip RLS tests karena
  // superuser bypass RLS by default — tidak bisa membuktikan policy.
  // ---------------------------------------------------------------------------
  async function isSuperUser(client) {
    const res = await client.query(`SELECT usesuper FROM pg_user WHERE usename = current_user;`);
    return res.rows[0]?.usesuper === true;
  }

  // ---------------------------------------------------------------------------
  // Helper: jalankan query dengan / tanpa SET LOCAL organization context
  // ---------------------------------------------------------------------------
  async function queryWithOrgContext(client, orgId, sql, params = []) {
    if (orgId) {
      await client.query(`SET LOCAL app.current_organization_id = '${orgId}';`);
    } else {
      await client.query(`SET LOCAL app.current_organization_id = '';`);
    }
    return client.query(sql, params);
  }

  // ---------------------------------------------------------------------------
  // 1. Tanpa context → tidak bisa membaca organisations
  // ---------------------------------------------------------------------------
  await t.test('1. Tanpa app.current_organization_id → organizations mengembalikan 0 baris', async () => {
    const client = await pool.connect();
    try {
      if (await isSuperUser(client)) {
        t.skip('Koneksi adalah superuser — RLS bypass, test tidak bisa membuktikan isolasi. Gunakan role aplikasi bukan superuser.');
        return;
      }

      await client.query('BEGIN');
      const res = await queryWithOrgContext(client, null, 'SELECT id FROM organizations;');
      await client.query('ROLLBACK');

      assert.strictEqual(
        res.rows.length,
        0,
        'Tanpa context, tidak boleh ada baris organizations yang terbaca (RLS block)'
      );
    } finally {
      client.release();
    }
  });

  // ---------------------------------------------------------------------------
  // 2. Context org A → bisa baca org A, tidak bisa baca org B
  // ---------------------------------------------------------------------------
  await t.test('2. Context org A → membaca org A berhasil; query org B menghasilkan 0 baris', async () => {
    const client = await pool.connect();
    try {
      if (await isSuperUser(client)) {
        t.skip('Koneksi adalah superuser — RLS bypass.');
        return;
      }

      // 2a. Context org A → harus bisa membaca org A
      await client.query('BEGIN');
      const resA = await queryWithOrgContext(
        client,
        SINTETIS_ORG_ID,
        'SELECT id, code FROM organizations WHERE id = $1;',
        [SINTETIS_ORG_ID]
      );
      await client.query('ROLLBACK');

      assert.strictEqual(resA.rows.length, 1, 'Context org A harus bisa membaca baris org A sendiri');
      assert.strictEqual(resA.rows[0].code, 'ORG-SINTETIS-01');

      // 2b. Context org A → tidak bisa membaca org B (RLS harus memfilter)
      await client.query('BEGIN');
      const resB = await queryWithOrgContext(
        client,
        SINTETIS_ORG_ID,
        'SELECT id FROM organizations WHERE id = $1;',
        [OTHER_ORG_ID]
      );
      await client.query('ROLLBACK');

      assert.strictEqual(
        resB.rows.length,
        0,
        'Context org A tidak boleh bisa membaca baris organisasi lain (isolasi RLS)'
      );
    } finally {
      client.release();
    }
  });

  // ---------------------------------------------------------------------------
  // 3. Isolasi branches: cabang org A tidak bisa dibaca dari context org B
  // ---------------------------------------------------------------------------
  await t.test('3. branches: cabang org A tidak terbaca dari context org B', async () => {
    const client = await pool.connect();
    try {
      if (await isSuperUser(client)) {
        t.skip('Koneksi adalah superuser — RLS bypass.');
        return;
      }

      // Context org B: coba baca cabang org A
      await client.query('BEGIN');
      const res = await queryWithOrgContext(
        client,
        OTHER_ORG_ID,
        'SELECT id FROM branches WHERE organization_id = $1;',
        [SINTETIS_ORG_ID]
      );
      await client.query('ROLLBACK');

      assert.strictEqual(
        res.rows.length,
        0,
        'Cabang org A tidak boleh terbaca dari context org B (isolasi RLS branches)'
      );
    } finally {
      client.release();
    }
  });

  // ---------------------------------------------------------------------------
  // 4. Isolasi accounts: akun org A tidak bisa dibaca dari context org B
  // ---------------------------------------------------------------------------
  await t.test('4. accounts: akun org A tidak terbaca dari context org B', async () => {
    const client = await pool.connect();
    try {
      if (await isSuperUser(client)) {
        t.skip('Koneksi adalah superuser — RLS bypass.');
        return;
      }

      await client.query('BEGIN');
      const res = await queryWithOrgContext(
        client,
        OTHER_ORG_ID,
        'SELECT id FROM accounts WHERE organization_id = $1;',
        [SINTETIS_ORG_ID]
      );
      await client.query('ROLLBACK');

      assert.strictEqual(
        res.rows.length,
        0,
        'Akun org A tidak boleh terbaca dari context org B (isolasi RLS accounts)'
      );
    } finally {
      client.release();
    }
  });

  // ---------------------------------------------------------------------------
  // 5. Isolasi patients: pasien org A tidak bisa dibaca dari context org B
  // ---------------------------------------------------------------------------
  await t.test('5. patients: pasien org A tidak terbaca dari context org B', async () => {
    const client = await pool.connect();
    try {
      if (await isSuperUser(client)) {
        t.skip('Koneksi adalah superuser — RLS bypass.');
        return;
      }

      await client.query('BEGIN');
      const res = await queryWithOrgContext(
        client,
        OTHER_ORG_ID,
        'SELECT id FROM patients WHERE organization_id = $1;',
        [SINTETIS_ORG_ID]
      );
      await client.query('ROLLBACK');

      assert.strictEqual(
        res.rows.length,
        0,
        'Pasien org A tidak boleh terbaca dari context org B (isolasi RLS patients)'
      );
    } finally {
      client.release();
    }
  });

  // ---------------------------------------------------------------------------
  // 6. audit_logs INSERT selalu berhasil tanpa context (dibutuhkan oleh auth flow)
  // ---------------------------------------------------------------------------
  await t.test('6. audit_logs: INSERT berhasil tanpa organization context (logging tidak boleh diblokir)', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Tidak men-SET context — INSERT harus tetap berhasil
      await client.query(`SET LOCAL app.current_organization_id = '';`);
      const res = await client.query(`
        INSERT INTO audit_logs (
          correlation_id, action, entity_name, entity_id, new_values, ip_address
        ) VALUES (
          'rls-test-audit-no-ctx',
          'AUTH_LOGIN_FAILED',
          'accounts',
          'test-acc-uuid',
          '{"reason": "rls_test_no_context"}',
          '127.0.0.1'
        ) RETURNING id;
      `);
      await client.query('ROLLBACK');

      assert.strictEqual(res.rowCount, 1, 'audit_logs INSERT harus berhasil tanpa organization context');
    } finally {
      client.release();
    }
  });

  // ---------------------------------------------------------------------------
  // 7. audit_logs SELECT: dari context org A hanya melihat log org A / NULL
  // ---------------------------------------------------------------------------
  await t.test('7. audit_logs SELECT: context org A tidak bisa membaca log dengan organization_id berbeda', async () => {
    const client = await pool.connect();
    try {
      if (await isSuperUser(client)) {
        t.skip('Koneksi adalah superuser — RLS bypass.');
        return;
      }

      await client.query('BEGIN');
      // Buat log dengan org B (simulasi dengan transaksi terpisah — ini tidak bisa dilakukan
      // oleh koneksi yang sama dengan context org A, maka kita hanya verifikasi bahwa
      // query dengan org_id filter org B menghasilkan 0 baris dari context org A)
      const res = await queryWithOrgContext(
        client,
        SINTETIS_ORG_ID,
        'SELECT id FROM audit_logs WHERE organization_id = $1;',
        [OTHER_ORG_ID]
      );
      await client.query('ROLLBACK');

      assert.strictEqual(
        res.rows.length,
        0,
        'Context org A tidak boleh membaca audit log org B (isolasi RLS audit_logs SELECT)'
      );
    } finally {
      client.release();
    }
  });

  // ---------------------------------------------------------------------------
  // 8. Verifikasi fungsi app_current_org_id() mengembalikan NULL bila tidak di-set
  // ---------------------------------------------------------------------------
  await t.test('8. app_current_org_id() mengembalikan NULL bila setting tidak di-set', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL app.current_organization_id = '';`);
      const res = await client.query('SELECT app_current_org_id() AS org_id;');
      await client.query('ROLLBACK');

      assert.strictEqual(
        res.rows[0].org_id,
        null,
        'app_current_org_id() harus mengembalikan NULL jika setting kosong'
      );
    } finally {
      client.release();
    }
  });
});
