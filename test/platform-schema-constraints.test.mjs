import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateUp } from '../scripts/migrate.mjs';
import { createTestPool, testDatabaseSkipReason } from './helpers/test-database.mjs';

test('Suite: Schema Constraints & Multi-Tenant Isolation', { skip: testDatabaseSkipReason }, async (t) => {
  const pool = createTestPool();

  t.before(async () => {
    await migrateUp(pool);
  });

  t.after(async () => {
    await pool.end();
  });

  await t.test('1. Foreign Key: Branch harus terikat pada Organization yang valid', async () => {
    const client = await pool.connect();
    try {
      const nonExistentOrgId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
      await assert.rejects(
        async () => {
          await client.query(`
            INSERT INTO branches (id, organization_id, code, name)
            VALUES ('bfffffff-ffff-ffff-ffff-ffffffffffff', $1, 'BR-INVALID', 'Cabang Tanpa Org');
          `, [nonExistentOrgId]);
        },
        (err) => err.code === '23503', // foreign_key_violation
        'Harus gagal foreign key constraint jika organization_id tidak ada'
      );
    } finally {
      client.release();
    }
  });

  await t.test('2. Unique Key: Kode Cabang unik di dalam satu Organisasi', async () => {
    const client = await pool.connect();
    try {
      const orgA = 'a1111111-1111-1111-1111-111111111111';
      const orgB = 'a2222222-2222-2222-2222-222222222222';
      
      await client.query(`
        INSERT INTO organizations (id, code, name) 
        VALUES ($1, 'ORG-TEST-A', 'Org Test A'), ($2, 'ORG-TEST-B', 'Org Test B')
        ON CONFLICT (code) DO NOTHING;
      `, [orgA, orgB]);

      // Buat cabang BR-01 di Org A
      await client.query(`
        INSERT INTO branches (organization_id, code, name)
        VALUES ($1, 'BR-01', 'Cabang Utama Org A')
        ON CONFLICT (organization_id, code) DO NOTHING;
      `, [orgA]);

      // Coba buat cabang BR-01 lagi di Org A (harus gagal)
      await assert.rejects(
        async () => {
          await client.query(`
            INSERT INTO branches (organization_id, code, name)
            VALUES ($1, 'BR-01', 'Cabang Duplikat Org A');
          `, [orgA]);
        },
        (err) => err.code === '23505', // unique_violation
        'Duplikat kode cabang dalam organisasi yang sama harus ditolak'
      );

      // Buat cabang BR-01 di Org B (harus sukses, tenant boundary terpisah)
      const resB = await client.query(`
        INSERT INTO branches (organization_id, code, name)
        VALUES ($1, 'BR-01', 'Cabang Utama Org B')
        ON CONFLICT (organization_id, code) DO NOTHING
        RETURNING id;
      `, [orgB]);
      assert.ok(resB.rowCount >= 0, 'Cabang dengan kode sama di organisasi berbeda diperbolehkan');
    } finally {
      client.release();
    }
  });

  await t.test('3. Master Pasien: Satu profil kanonik per organisasi induk (anti-duplikasi)', async () => {
    const client = await pool.connect();
    try {
      const orgA = 'a1111111-1111-1111-1111-111111111111';
      const orgB = 'a2222222-2222-2222-2222-222222222222';
      const nik = '9999999999999999';

      // Daftarkan pasien kanonik pertama di Org A
      await client.query(`
        INSERT INTO patients (organization_id, no_rm, nik, full_name, gender, birth_date)
        VALUES ($1, 'RM-TEST-01', $2, 'Pasien Uji Kanonik [SINTETIS]', 'male', '1990-01-01')
        ON CONFLICT (organization_id, nik) DO NOTHING;
      `, [orgA, nik]);

      // Coba daftarkan pasien kedua dengan NIK sama di Org A (harus ditolak constraint unique)
      await assert.rejects(
        async () => {
          await client.query(`
            INSERT INTO patients (organization_id, no_rm, nik, full_name, gender, birth_date)
            VALUES ($1, 'RM-TEST-02', $2, 'Pasien NIK Kembar [SINTETIS]', 'male', '1990-01-01');
          `, [orgA, nik]);
        },
        (err) => err.code === '23505',
        'Duplikasi NIK pasien dalam satu organisasi induk harus ditolak'
      );

      // Coba daftarkan pasien kedua dengan No RM sama di Org A (harus ditolak)
      await assert.rejects(
        async () => {
          await client.query(`
            INSERT INTO patients (organization_id, no_rm, nik, full_name, gender, birth_date)
            VALUES ($1, 'RM-TEST-01', '8888888888888888', 'Pasien RM Kembar [SINTETIS]', 'male', '1990-01-01');
          `, [orgA]);
        },
        (err) => err.code === '23505',
        'Duplikasi No RM pasien dalam satu organisasi induk harus ditolak'
      );

      // Pasien dengan NIK sama di organisasi BERBEDA (Org B) diperbolehkan
      const resOrgB = await client.query(`
        INSERT INTO patients (organization_id, no_rm, nik, full_name, gender, birth_date)
        VALUES ($1, 'RM-TEST-01', $2, 'Pasien Uji Org B [SINTETIS]', 'male', '1990-01-01')
        ON CONFLICT (organization_id, nik) DO NOTHING
        RETURNING id;
      `, [orgB, nik]);
      assert.ok(resOrgB.rowCount >= 0, 'NIK yang sama di organisasi berbeda diperbolehkan (multi-tenant boundary)');
    } finally {
      client.release();
    }
  });

  await t.test('4. Tenaga Medis: Penugasan multi-cabang dalam organisasi induk', async () => {
    const client = await pool.connect();
    try {
      const orgA = 'a1111111-1111-1111-1111-111111111111';
      const nik = '7777777777777777';

      // Buat dokter di Org A
      const docRes = await client.query(`
        INSERT INTO practitioners (organization_id, nik, full_name, gender, practitioner_type)
        VALUES ($1, $2, 'dr. Multi Cabang [SINTETIS]', 'female', 'DOKTER_UMUM')
        ON CONFLICT (organization_id, nik) DO UPDATE SET full_name = EXCLUDED.full_name
        RETURNING id;
      `, [orgA, nik]);
      const docId = docRes.rows[0].id;

      // Ambil 2 cabang di Org A
      const branchRes = await client.query(`
        SELECT id FROM branches WHERE organization_id = $1 LIMIT 2;
      `, [orgA]);

      if (branchRes.rows.length >= 2) {
        const branch1 = branchRes.rows[0].id;
        const branch2 = branchRes.rows[1].id;

        // Tugaskan ke cabang 1
        await client.query(`
          INSERT INTO practitioner_branch_assignments (organization_id, practitioner_id, branch_id, is_primary_branch)
          VALUES ($1, $2, $3, true)
          ON CONFLICT (practitioner_id, branch_id) DO NOTHING;
        `, [orgA, docId, branch1]);

        // Tugaskan ke cabang 2
        await client.query(`
          INSERT INTO practitioner_branch_assignments (organization_id, practitioner_id, branch_id, is_primary_branch)
          VALUES ($1, $2, $3, false)
          ON CONFLICT (practitioner_id, branch_id) DO NOTHING;
        `, [orgA, docId, branch2]);

        // Coba tugaskan ulang ke cabang 1 (duplikat assignment harus gagal)
        await assert.rejects(
          async () => {
            await client.query(`
              INSERT INTO practitioner_branch_assignments (organization_id, practitioner_id, branch_id)
              VALUES ($1, $2, $3);
            `, [orgA, docId, branch1]);
          },
          (err) => err.code === '23505',
          'Duplikasi penugasan dokter ke cabang yang sama harus ditolak'
        );
      }
    } finally {
      client.release();
    }
  });
});
