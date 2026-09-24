#!/usr/bin/env node

/**
 * Synthetic Test Fixture Seeder
 * Populates test database with clearly labelled synthetic data.
 * Zero real patient data, zero real credentials.
 */

import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { createPool } from './migrate.mjs';

function hashPasswordSync(password) {
  const salt = '00112233445566778899aabbccddeeff';
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

export async function seedPlatformFixtures(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Organisasi Induk Sintetis
    const orgRes = await client.query(`
      INSERT INTO organizations (id, code, name, ihs_organization_id, is_active)
      VALUES (
        'a0000000-0000-0000-0000-000000000001',
        'ORG-SINTETIS-01',
        'Klinik Pratama Sehat Sejahtera Group [SINTETIS]',
        'org-sintetis-ihs-01',
        true
      )
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `);
    const orgId = orgRes.rows[0].id;

    // 2. Cabang Sintetis
    await client.query(`
      INSERT INTO branches (id, organization_id, code, name, branch_type, faskes_code_bpjs, ihs_location_id, is_active)
      VALUES 
        ('b0000000-0000-0000-0000-000000000001', $1, 'BR-SINTETIS-01', 'Klinik Sehat Cabang Kemang [SINTETIS]', 'KLINIK_PRATAMA', '0001R001', 'loc-sintetis-01', true),
        ('b0000000-0000-0000-0000-000000000002', $1, 'BR-SINTETIS-02', 'Klinik Sehat Cabang Tebet [SINTETIS]', 'KLINIK_PRATAMA', '0001R002', 'loc-sintetis-02', true)
      ON CONFLICT (organization_id, code) DO NOTHING;
    `, [orgId]);

    // 3. Permissions
    const permissions = [
      ['perm-01', 'patient:read', 'Melihat profil pasien kanonik', 'PATIENTS'],
      ['perm-02', 'patient:write', 'Mendaftarkan / mengubah data pasien', 'PATIENTS'],
      ['perm-03', 'encounter:read', 'Melihat kunjungan di cabang aktif', 'ENCOUNTERS'],
      ['perm-04', 'encounter:write', 'Mencatat pemeriksaan dan CPPT', 'ENCOUNTERS'],
      ['perm-05', 'cross_branch:read', 'Membaca rekam medis kunjungan lintas cabang', 'ENCOUNTERS'],
      ['perm-06', 'duplicate:review', 'Meninjau dan menyelesaikan kandidat duplikat', 'PATIENTS'],
      ['perm-07', 'audit:read', 'Melihat catatan audit trail', 'SYSTEM'],
    ];

    for (const [id, code, name, module] of permissions) {
      await client.query(`
        INSERT INTO permissions (code, name, module)
        VALUES ($1, $2, $3)
        ON CONFLICT (code) DO NOTHING;
      `, [code, name, module]);
    }

    // 4. Roles
    await client.query(`
      INSERT INTO roles (id, organization_id, code, name, scope_type, description)
      VALUES 
        ('c0000000-0000-0000-0000-000000000001', $1, 'SUPER_ADMIN', 'Super Administrator [SINTETIS]', 'ORGANIZATION', 'Akses penuh platform organisasi'),
        ('c0000000-0000-0000-0000-000000000002', $1, 'ORG_ADMIN', 'Administrator Organisasi [SINTETIS]', 'ORGANIZATION', 'Kelola cabang, nakes, dan audit'),
        ('c0000000-0000-0000-0000-000000000003', $1, 'DOKTER_CABANG', 'Dokter Cabang [SINTETIS]', 'BRANCH', 'Pemeriksaan dan rekam medis cabang'),
        ('c0000000-0000-0000-0000-000000000004', $1, 'ADMISI_CABANG', 'Petugas Loket Admisi [SINTETIS]', 'BRANCH', 'Pendaftaran pasien dan antrean')
      ON CONFLICT (organization_id, code) DO NOTHING;
    `, [orgId]);

    // 4b. Role Permissions Mapping
    // SUPER_ADMIN & ORG_ADMIN get all permissions
    await client.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r, permissions p
      WHERE r.organization_id = $1 AND r.code IN ('SUPER_ADMIN', 'ORG_ADMIN')
      ON CONFLICT DO NOTHING;
    `, [orgId]);

    // DOKTER_CABANG gets patient:read, encounter:read, encounter:write, cross_branch:read
    await client.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r, permissions p
      WHERE r.organization_id = $1 AND r.code = 'DOKTER_CABANG'
        AND p.code IN ('patient:read', 'encounter:read', 'encounter:write', 'cross_branch:read')
      ON CONFLICT DO NOTHING;
    `, [orgId]);

    // ADMISI_CABANG gets patient:read, patient:write, encounter:read
    await client.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r, permissions p
      WHERE r.organization_id = $1 AND r.code = 'ADMISI_CABANG'
        AND p.code IN ('patient:read', 'patient:write', 'encounter:read')
      ON CONFLICT DO NOTHING;
    `, [orgId]);

    // 5. Akun Pengguna Sintetis (Hashed with scrypt)
    const adminHash = hashPasswordSync('AdminSintetis123!');
    const dokterHash = hashPasswordSync('DokterSintetis123!');
    const admisiHash = hashPasswordSync('AdmisiSintetis123!');

    await client.query(`
      INSERT INTO accounts (id, organization_id, username, email, password_hash, full_name, is_active, mfa_enabled)
      VALUES
        ('ac000000-0000-0000-0000-000000000001', $1, 'admin_sintetis', 'admin.sintetis@example.internal', $2, 'Admin Sintetis [SINTETIS]', true, true),
        ('ac000000-0000-0000-0000-000000000002', $1, 'dr_budi_sintetis', 'dr.budi.sintetis@example.internal', $3, 'dr. Sintetis Budi, Sp.PD [SINTETIS]', true, true),
        ('ac000000-0000-0000-0000-000000000003', $1, 'admisi_sintetis', 'admisi.sintetis@example.internal', $4, 'Staf Admisi Sintetis [SINTETIS]', true, false)
      ON CONFLICT (organization_id, username) DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        failed_login_attempts = 0,
        locked_until = NULL;
    `, [orgId, adminHash, dokterHash, admisiHash]);

    // 5b. Role Assignments
    // admin_sintetis -> ORG_ADMIN (org-scoped, branch_id null)
    await client.query(`
      INSERT INTO role_assignments (account_id, role_id, organization_id, branch_id, is_active)
      VALUES 
        ('ac000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', $1, NULL, true),
        ('ac000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', $1, 'b0000000-0000-0000-0000-000000000001', true),
        ('ac000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', $1, 'b0000000-0000-0000-0000-000000000002', true),
        ('ac000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004', $1, 'b0000000-0000-0000-0000-000000000001', true)
      ON CONFLICT (account_id, role_id, branch_id) DO NOTHING;
    `, [orgId]);

    // 6. Tenaga Medis Kanonik (dr. Budi)
    await client.query(`
      INSERT INTO practitioners (id, organization_id, account_id, nik, full_name, gender, practitioner_type, sip_number, ihs_practitioner_id, is_active)
      VALUES (
        'd0000000-0000-0000-0000-000000000001',
        $1,
        'ac000000-0000-0000-0000-000000000002',
        '0000000000000001',
        'dr. Sintetis Budi Santoso, Sp.PD [SINTETIS]',
        'male',
        'DOKTER_SPESIALIS',
        'SIP-SINTETIS-001',
        'ihs-doc-sintetis-01',
        true
      )
      ON CONFLICT (organization_id, nik) DO NOTHING;
    `, [orgId]);

    // 7. Penugasan Dokter ke Cabang 1 dan Cabang 2 (Multi-Branch Assignment)
    await client.query(`
      INSERT INTO practitioner_branch_assignments (organization_id, practitioner_id, branch_id, is_primary_branch, is_active)
      VALUES 
        ($1, 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', true, true),
        ($1, 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', false, true)
      ON CONFLICT (practitioner_id, branch_id) DO NOTHING;
    `, [orgId]);

    // 8. Poli & Jadwal
    await client.query(`
      INSERT INTO polis (id, organization_id, branch_id, code, name, bpjs_poli_code, is_active)
      VALUES 
        ('f0000000-0000-0000-0000-000000000001', $1, 'b0000000-0000-0000-0000-000000000001', 'POLI_UMUM', 'Poli Umum Cabang Kemang [SINTETIS]', '001', true),
        ('f0000000-0000-0000-0000-000000000002', $1, 'b0000000-0000-0000-0000-000000000002', 'POLI_UMUM', 'Poli Umum Cabang Tebet [SINTETIS]', '001', true)
      ON CONFLICT (branch_id, code) DO NOTHING;
    `, [orgId]);

    await client.query(`
      INSERT INTO schedules (id, organization_id, branch_id, poli_id, practitioner_id, day_of_week, start_time, end_time, max_quota)
      VALUES 
        ('fa000000-0000-0000-0000-000000000001', $1, 'b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 1, '08:00:00', '12:00:00', 30),
        ('fa000000-0000-0000-0000-000000000002', $1, 'b0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 4, '08:00:00', '12:00:00', 30)
      ON CONFLICT (id) DO NOTHING;
    `, [orgId]);

    // 9. Pasien Kanonik Sintetis
    await client.query(`
      INSERT INTO patients (id, organization_id, no_rm, nik, ihs_patient_id, full_name, gender, birth_date, blood_type, bpjs_card_no, status)
      VALUES
        ('e0000000-0000-0000-0000-000000000001', $1, '00-00-01', '1111111111111111', 'ihs-pat-sintetis-01', 'Tn. Pasien Sintetis Satu [SINTETIS]', 'male', '1985-05-10', 'O', '0000000000001', 'ACTIVE'),
        ('e0000000-0000-0000-0000-000000000002', $1, '00-00-02', '2222222222222222', 'ihs-pat-sintetis-02', 'Ny. Pasien Sintetis Dua [SINTETIS]', 'female', '1990-11-20', 'A', '0000000000002', 'ACTIVE')
      ON CONFLICT (organization_id, no_rm) DO NOTHING;
    `, [orgId]);

    // 10. Audit Log Initial
    await client.query(`
      INSERT INTO audit_logs (organization_id, branch_id, user_id, correlation_id, action, entity_name, entity_id, new_values, ip_address)
      SELECT $1, 'b0000000-0000-0000-0000-000000000001', 'ac000000-0000-0000-0000-000000000001', 'corr-bootstrap-01', 'BOOTSTRAP', 'organizations', $2, '{"message": "Seed data sintetis berhasil diinisialisasi"}', '127.0.0.1'
      WHERE NOT EXISTS (SELECT 1 FROM audit_logs WHERE correlation_id = 'corr-bootstrap-01');
    `, [orgId, String(orgId)]);

    await client.query('COMMIT');
    process.stdout.write('Synthetic platform fixtures seeded successfully.\n');
  } catch (err) {
    await client.query('ROLLBACK');
    process.stderr.write(`Failed to seed fixtures: ${err.message}\n`);
    throw err;
  } finally {
    client.release();
  }
}

// CLI handler if called directly
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  const pool = createPool();
  try {
    await seedPlatformFixtures(pool);
  } finally {
    await pool.end();
  }
}
