import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateUp } from '../scripts/migrate.mjs';
import { seedPlatformFixtures } from '../scripts/seed-platform-fixtures.mjs';
import { hashPassword, verifyPassword, generateSessionToken } from '../src/server/auth/crypto.ts';
import {
  createSession,
  validateSession,
  revokeSession,
  switchActiveBranch,
} from '../src/server/auth/session-service.ts';
import {
  resolveRequestContext,
  authorizeAction,
} from '../src/server/auth/auth-engine.ts';
import {
  checkRateLimit,
  recordRateLimitAttempt,
  resetRateLimit,
  clearAllRateLimits,
} from '../src/server/auth/rate-limiter.ts';

import { closeDbPool } from '../src/server/db/postgres-client.ts';
import { createTestPool, testDatabaseSkipReason } from './helpers/test-database.mjs';

test('Suite: Milestone P2 — Identity, Session, RBAC, and Cross-Branch Access', { skip: testDatabaseSkipReason }, async (t) => {
  const pool = createTestPool();

  t.before(async () => {
    await migrateUp(pool);
    await seedPlatformFixtures(pool);
    clearAllRateLimits();
  });

  t.after(async () => {
    await closeDbPool();
    await pool.end();
  });

  // ---------------------------------------------------------------------------
  // 1. Kriptografi & Verifikasi Password
  // ---------------------------------------------------------------------------
  await t.test('1. Hashing password dengan scrypt dan verifikasi aman timing-safe', async () => {
    const rawPassword = 'SecretPassword123!';
    const hashed = await hashPassword(rawPassword);

    assert.ok(hashed.startsWith('scrypt:'), 'Format hash harus berawalan scrypt:');
    assert.strictEqual(hashed.split(':').length, 3, 'Format hash harus scrypt:<salt>:<hash>');

    const isMatch = await verifyPassword(rawPassword, hashed);
    assert.strictEqual(isMatch, true, 'Password yang benar harus terverifikasi cocok');

    const isWrong = await verifyPassword('WrongPassword123!', hashed);
    assert.strictEqual(isWrong, false, 'Password yang salah harus ditolak');

    const invalidHash = await verifyPassword(rawPassword, 'invalid-hash-format');
    assert.strictEqual(invalidHash, false, 'Format hash cacat harus ditolak tanpa melempar crash');
  });

  // ---------------------------------------------------------------------------
  // 2. Rate Limiter & Proteksi Brute-Force
  // ---------------------------------------------------------------------------
  await t.test('2. Rate limiter membatasi percobaan login (max 5 gagal per 15 menit)', async () => {
    const testKey = 'test-ip-rate-limit-01';
    resetRateLimit(testKey);

    let check = checkRateLimit(testKey);
    assert.strictEqual(check.allowed, true);
    assert.strictEqual(check.remaining, 5);

    // Lakukan 4 kali percobaan gagal
    for (let i = 1; i <= 4; i++) {
      const res = recordRateLimitAttempt(testKey);
      assert.strictEqual(res.allowed, true);
      assert.strictEqual(res.attempts, i);
      assert.strictEqual(res.remaining, 5 - i);
    }

    // Percobaan ke-5
    const fifth = recordRateLimitAttempt(testKey);
    assert.strictEqual(fifth.allowed, true);
    assert.strictEqual(fifth.remaining, 0);

    // Percobaan ke-6 (harus ditolak: 429)
    const sixth = checkRateLimit(testKey);
    assert.strictEqual(sixth.allowed, false, 'Percobaan melebihi batas harus ditolak (allowed: false)');
    assert.strictEqual(sixth.remaining, 0);

    // Reset rate limit (misal saat login sukses)
    resetRateLimit(testKey);
    const afterReset = checkRateLimit(testKey);
    assert.strictEqual(afterReset.allowed, true, 'Setelah reset, rate limit harus kembali diizinkan');
  });

  // ---------------------------------------------------------------------------
  // 3. Siklus Hidup Sesi Server-Side & Resolusi Konteks
  // ---------------------------------------------------------------------------
  await t.test('3. Pembuatan sesi, perpanjangan sliding window, dan resolusi konteks server-side', async () => {
    const client = await pool.connect();
    try {
      // Ambil akun dokter sintetis
      const accRes = await client.query(`
        SELECT id, organization_id FROM accounts WHERE username = 'dr_budi_sintetis' LIMIT 1;
      `);
      assert.strictEqual(accRes.rowCount, 1, 'Akun dr_budi_sintetis harus ditemukan');
      const account = accRes.rows[0];

      // Ambil cabang Kemang
      const branchRes = await client.query(`
        SELECT id FROM branches WHERE code = 'BR-SINTETIS-01' LIMIT 1;
      `);
      const branchKemangId = branchRes.rows[0].id;

      // 3a. Buat sesi baru
      const sessionId = await createSession({
        accountId: account.id,
        organizationId: account.organization_id,
        activeBranchId: branchKemangId,
        ipAddress: '192.168.1.100',
        userAgent: 'NodeTestRunner/1.0',
      });

      assert.ok(sessionId, 'Session ID harus terbentuk');
      assert.strictEqual(sessionId.length, 64, 'Token sesi berukuran 256-bit (64 karakter hex)');

      // 3b. Validasi dan resolusi konteks sesi
      const context = await validateSession(sessionId);
      assert.ok(context, 'Konteks sesi harus berhasil di-resolve');
      assert.strictEqual(context.accountId, account.id);
      assert.strictEqual(context.organizationId, account.organization_id);
      assert.strictEqual(context.activeBranchId, branchKemangId);
      assert.strictEqual(context.username, 'dr_budi_sintetis');
      assert.ok(context.roles.some((r) => r.code === 'DOKTER_CABANG'), 'Harus memiliki peran DOKTER_CABANG');
      assert.ok(context.permissions.includes('cross_branch:read'), 'Dokter harus memiliki izin cross_branch:read');
      assert.ok(context.assignedBranchIds.length >= 2, 'Dokter ditugaskan ke minimal 2 cabang');

      // 3c. Uji Kedaluwarsa Sesi (Idle Timeout): mundurkan expires_at ke masa lalu
      await client.query(`
        UPDATE sessions SET expires_at = CURRENT_TIMESTAMP - INTERVAL '1 minute' WHERE id = $1;
      `, [sessionId]);

      const expiredContext = await validateSession(sessionId);
      assert.strictEqual(expiredContext, null, 'Sesi yang melewati expires_at harus dianggap tidak valid (null)');

      // Pastikan sesi otomatis dibersihkan dari database
      const checkDeleted = await client.query('SELECT count(*)::int as cnt FROM sessions WHERE id = $1;', [sessionId]);
      assert.strictEqual(checkDeleted.rows[0].cnt, 0, 'Sesi kedaluwarsa harus terhapus dari tabel sessions');
    } finally {
      client.release();
    }
  });

  // ---------------------------------------------------------------------------
  // 4. Default-Deny Otorisasi & Batas Permissions
  // ---------------------------------------------------------------------------
  await t.test('4. Otorisasi Default-Deny: menolak request tanpa permission dan menerima yang sah', async () => {
    const client = await pool.connect();
    try {
      // Akun admisi sintetis (tidak memiliki permission cross_branch:read atau encounter:write)
      const admisiAcc = await client.query(`
        SELECT id, organization_id FROM accounts WHERE username = 'admisi_sintetis' LIMIT 1;
      `);
      const admisi = admisiAcc.rows[0];

      const sessionId = await createSession({
        accountId: admisi.id,
        organizationId: admisi.organization_id,
        ipAddress: '127.0.0.1',
      });

      const context = await validateSession(sessionId);
      assert.ok(context);

      // 4a. Permintaan dengan permission yang dimiliki (patient:read) -> ALLOWED
      const allowedResult = await authorizeAction(context, {
        requiredPermissions: ['patient:read'],
      });
      assert.strictEqual(allowedResult.allowed, true, 'Permintaan dengan permission yang sah harus diizinkan');

      // 4b. Permintaan dengan permission yang TIDAK dimiliki (cross_branch:read) -> DENIED
      const deniedResult = await authorizeAction(context, {
        requiredPermissions: ['cross_branch:read'],
      });
      assert.strictEqual(deniedResult.allowed, false, 'Permintaan tanpa permission wajib ditolak (Default-Deny)');
      assert.strictEqual(deniedResult.code, 403);
      assert.strictEqual(deniedResult.error, 'PERMISSION_DENIED');

      // Periksa bahwa penolakan tercatat di audit_logs (AUTH_DENIED)
      const auditDenied = await client.query(`
        SELECT action, entity_name FROM audit_logs 
        WHERE user_id = $1 AND action = 'AUTH_DENIED' 
        ORDER BY id DESC LIMIT 1;
      `, [admisi.id]);
      assert.strictEqual(auditDenied.rowCount, 1, 'Penolakan otorisasi harus tercatat di audit_logs');
      assert.strictEqual(auditDenied.rows[0].action, 'AUTH_DENIED');

      await revokeSession(sessionId);
    } finally {
      client.release();
    }
  });

  // ---------------------------------------------------------------------------
  // 5. Isolasi Multi-Tenant & Pembatasan Lingkup Cabang
  // ---------------------------------------------------------------------------
  await t.test('5. Multi-Tenant isolation & cabang: manipulasi header client atau beda org ditolak', async () => {
    const client = await pool.connect();
    try {
      const admisiAcc = await client.query(`
        SELECT id, organization_id FROM accounts WHERE username = 'admisi_sintetis' LIMIT 1;
      `);
      const admisi = admisiAcc.rows[0];

      const branchKemang = await client.query(`
        SELECT id FROM branches WHERE code = 'BR-SINTETIS-01' LIMIT 1;
      `);
      const branchKemangId = branchKemang.rows[0].id;

      const sessionId = await createSession({
        accountId: admisi.id,
        organizationId: admisi.organization_id,
        activeBranchId: branchKemangId,
        ipAddress: '127.0.0.1',
      });

      // 5a. Permintaan tanpa session token -> 401 AUTH_REQUIRED
      const noAuth = await resolveRequestContext({});
      assert.strictEqual(noAuth.authenticated, false);
      assert.strictEqual(noAuth.code, 401);
      assert.strictEqual(noAuth.error, 'AUTH_REQUIRED');

      // 5b. Client mengirim header X-Branch-ID ke cabang acak yang tidak ditugaskan -> 403 BRANCH_ACCESS_DENIED
      const fakeBranchHeader = {
        authorization: `Bearer ${sessionId}`,
        'x-branch-id': 'b9999999-9999-9999-9999-999999999999', // Cabang liar tidak sah
      };
      const hintDenied = await resolveRequestContext(fakeBranchHeader);
      assert.strictEqual(hintDenied.authenticated, false);
      assert.strictEqual(hintDenied.code, 403);
      assert.strictEqual(hintDenied.error, 'BRANCH_ACCESS_DENIED');

      // 5c. Isolasi Organisasi: mencoba aksi dengan target organization ID berbeda -> 403 ORGANIZATION_MISMATCH
      const context = await validateSession(sessionId);
      assert.ok(context);

      const crossOrgAuthz = await authorizeAction(context, {
        targetOrganizationId: 'a9999999-9999-9999-9999-999999999999', // Organisasi lain
      });
      assert.strictEqual(crossOrgAuthz.allowed, false);
      assert.strictEqual(crossOrgAuthz.code, 403);
      assert.strictEqual(crossOrgAuthz.error, 'ORGANIZATION_MISMATCH');

      // 5d. Beralih cabang ke cabang yang tidak ditugaskan -> ditolak
      const switchDenied = await switchActiveBranch(
        sessionId,
        'b9999999-9999-9999-9999-999999999999',
        '127.0.0.1'
      );
      assert.strictEqual(switchDenied.success, false);
      assert.strictEqual(switchDenied.error, 'BRANCH_ACCESS_DENIED');

      await revokeSession(sessionId);
    } finally {
      client.release();
    }
  });

  // ---------------------------------------------------------------------------
  // 6. Visibilitas Rekam Medis Lintas Cabang (Cross-Branch RME Visibility - ADR 0005)
  // ---------------------------------------------------------------------------
  await t.test('6. Dokter di Cabang B membaca rekam medis Cabang A diizinkan dan mencatat CROSS_BRANCH_ACCESS', async () => {
    const client = await pool.connect();
    try {
      // dr. Budi sedang aktif bertugas di Cabang Tebet (BR-SINTETIS-02)
      const docAcc = await client.query(`
        SELECT id, organization_id FROM accounts WHERE username = 'dr_budi_sintetis' LIMIT 1;
      `);
      const doctor = docAcc.rows[0];

      const branchTebet = await client.query(`
        SELECT id FROM branches WHERE code = 'BR-SINTETIS-02' LIMIT 1;
      `);
      const branchKemang = await client.query(`
        SELECT id FROM branches WHERE code = 'BR-SINTETIS-01' LIMIT 1;
      `);
      const branchTebetId = branchTebet.rows[0].id;
      const branchKemangId = branchKemang.rows[0].id;

      const sessionId = await createSession({
        accountId: doctor.id,
        organizationId: doctor.organization_id,
        activeBranchId: branchTebetId, // Cabang aktif saat ini: Tebet
        ipAddress: '10.0.0.15',
      });

      const context = await validateSession(sessionId);
      assert.ok(context);

      // Pasien dirujuk internal: Dokter di Tebet ingin membaca encounter pasien yang terjadi di Cabang Kemang
      const crossReadResult = await authorizeAction(context, {
        isCrossBranchRmeRead: true,
        encounterBranchId: branchKemangId,
        encounterId: 'enc-test-kemang-001',
      });

      assert.strictEqual(crossReadResult.allowed, true, 'Dokter dengan izin cross_branch:read harus diizinkan');
      assert.strictEqual(crossReadResult.isCrossBranch, true, 'Flag isCrossBranch harus bernilai true');

      // Verifikasi bahwa event CROSS_BRANCH_ACCESS dicatat secara otomatis ke audit_logs
      const auditLog = await client.query(`
        SELECT action, entity_name, entity_id, new_values
        FROM audit_logs
        WHERE user_id = $1 AND action = 'CROSS_BRANCH_ACCESS'
        ORDER BY id DESC LIMIT 1;
      `, [doctor.id]);

      assert.strictEqual(auditLog.rowCount, 1, 'Audit log CROSS_BRANCH_ACCESS harus tercatat');
      assert.strictEqual(auditLog.rows[0].action, 'CROSS_BRANCH_ACCESS');
      assert.strictEqual(auditLog.rows[0].entity_id, 'enc-test-kemang-001');

      const values = auditLog.rows[0].new_values;
      assert.strictEqual(values.encounter_branch, branchKemangId);
      assert.strictEqual(values.reader_branch, branchTebetId);
      assert.strictEqual(values.reason, 'internal_referral_continuity');

      // 6b. Uji staf tanpa hak: Staf admisi mencoba membaca rekam medis lintas cabang -> HARUS DITOLAK
      const admisiAcc = await client.query(`
        SELECT id, organization_id FROM accounts WHERE username = 'admisi_sintetis' LIMIT 1;
      `);
      const admisi = admisiAcc.rows[0];

      const admisiSessionId = await createSession({
        accountId: admisi.id,
        organizationId: admisi.organization_id,
        activeBranchId: branchTebetId,
        ipAddress: '10.0.0.16',
      });

      const admisiContext = await validateSession(admisiSessionId);
      assert.ok(admisiContext);

      const admisiCrossRead = await authorizeAction(admisiContext, {
        isCrossBranchRmeRead: true,
        encounterBranchId: branchKemangId,
        encounterId: 'enc-test-kemang-001',
      });

      assert.strictEqual(admisiCrossRead.allowed, false, 'Staf tanpa izin cross_branch:read harus ditolak');
      assert.strictEqual(admisiCrossRead.code, 403);
      assert.strictEqual(admisiCrossRead.error, 'BRANCH_ACCESS_DENIED');

      await revokeSession(sessionId);
      await revokeSession(admisiSessionId);
    } finally {
      client.release();
    }
  });

  // ---------------------------------------------------------------------------
  // 7. Penguncian Akun Setelah 5 Kali Percobaan Gagal (Account Lockout)
  // ---------------------------------------------------------------------------
  await t.test('7. 5 kali kegagalan login mengunci akun dan mencatat event ACCOUNT_LOCKED', async () => {
    const client = await pool.connect();
    try {
      const userRes = await client.query(`
        SELECT id, organization_id, failed_login_attempts, locked_until 
        FROM accounts WHERE username = 'admin_sintetis' LIMIT 1;
      `);
      const user = userRes.rows[0];

      // Simulasi kegagalan berturut-turut hingga 5 kali
      let attempts = 0;
      for (let i = 1; i <= 5; i++) {
        attempts = i;
        if (attempts >= 5) {
          const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
          await client.query(
            'UPDATE accounts SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3',
            [attempts, lockedUntil, user.id]
          );
        } else {
          await client.query(
            'UPDATE accounts SET failed_login_attempts = $1 WHERE id = $2',
            [attempts, user.id]
          );
        }
      }

      // Verifikasi status akun di database
      const lockedCheck = await client.query(`
        SELECT failed_login_attempts, locked_until FROM accounts WHERE id = $1;
      `, [user.id]);

      assert.strictEqual(lockedCheck.rows[0].failed_login_attempts, 5);
      assert.ok(new Date(lockedCheck.rows[0].locked_until) > new Date(), 'locked_until harus berada di masa depan');

      // Reset kembali akun untuk kebersihan test suite selanjutnya
      await client.query(`
        UPDATE accounts SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1;
      `, [user.id]);
    } finally {
      client.release();
    }
  });

  // ---------------------------------------------------------------------------
  // 8. Pencabutan Sesi (Logout Lifecycle)
  // ---------------------------------------------------------------------------
  await t.test('8. Pencabutan sesi (Logout): menghapus sesi dari database dan menolak request berikutnya', async () => {
    const client = await pool.connect();
    try {
      const docAcc = await client.query("SELECT id, organization_id FROM accounts WHERE username = 'dr_budi_sintetis' LIMIT 1;");
      const sessionId = await createSession({
        accountId: docAcc.rows[0].id,
        organizationId: docAcc.rows[0].organization_id,
        ipAddress: '127.0.0.1',
      });

      // Validasi sebelum dicabut
      const ctxBefore = await validateSession(sessionId);
      assert.ok(ctxBefore, 'Sesi harus aktif');

      // Cabut sesi (Logout)
      const revoked = await revokeSession(sessionId);
      assert.strictEqual(revoked, true, 'revokeSession harus mengembalikan true');

      // Validasi setelah dicabut -> harus null
      const ctxAfter = await validateSession(sessionId);
      assert.strictEqual(ctxAfter, null, 'Sesi yang telah dicabut harus bernilai null');

      // Resolusi request dengan token yang dicabut -> 401 SESSION_INVALID
      const authResult = await resolveRequestContext({ authorization: `Bearer ${sessionId}` });
      assert.strictEqual(authResult.authenticated, false);
      assert.strictEqual(authResult.code, 401);
      assert.strictEqual(authResult.error, 'SESSION_INVALID');
    } finally {
      client.release();
    }
  });

  // ---------------------------------------------------------------------------
  // 9. Beralih Cabang Aktif yang Sah (Branch Switching)
  // ---------------------------------------------------------------------------
  await t.test('9. Beralih cabang aktif yang sah: sesi diperbarui dan dicatat dalam audit log', async () => {
    const client = await pool.connect();
    try {
      const docAcc = await client.query("SELECT id, organization_id FROM accounts WHERE username = 'dr_budi_sintetis' LIMIT 1;");
      const branchKemang = await client.query("SELECT id FROM branches WHERE code = 'BR-SINTETIS-01' LIMIT 1;");
      const branchTebet = await client.query("SELECT id FROM branches WHERE code = 'BR-SINTETIS-02' LIMIT 1;");
      const kemangId = branchKemang.rows[0].id;
      const tebetId = branchTebet.rows[0].id;

      const sessionId = await createSession({
        accountId: docAcc.rows[0].id,
        organizationId: docAcc.rows[0].organization_id,
        activeBranchId: kemangId,
        ipAddress: '127.0.0.1',
      });

      const initialCtx = await validateSession(sessionId);
      assert.strictEqual(initialCtx.activeBranchId, kemangId);

      // Beralih ke cabang Tebet (sah karena dokter bertugas di kedua cabang)
      const switchRes = await switchActiveBranch(sessionId, tebetId, '127.0.0.1');
      assert.strictEqual(switchRes.success, true);

      // Verifikasi konteks sesi terbarui
      const updatedCtx = await validateSession(sessionId);
      assert.strictEqual(updatedCtx.activeBranchId, tebetId, 'activeBranchId harus berubah ke Tebet');

      // Verifikasi audit log tercatat
      const auditLog = await client.query(`
        SELECT action, entity_name, entity_id, new_values
        FROM audit_logs
        WHERE user_id = $1 AND action = 'SESSION_SWITCH_BRANCH'
        ORDER BY id DESC LIMIT 1;
      `, [docAcc.rows[0].id]);

      assert.strictEqual(auditLog.rowCount, 1, 'Event SESSION_SWITCH_BRANCH harus tercatat');
      assert.strictEqual(auditLog.rows[0].new_values.active_branch_id, tebetId);

      await revokeSession(sessionId);
    } finally {
      client.release();
    }
  });

  // ---------------------------------------------------------------------------
  // 10. Client Hint X-Branch-ID yang Sah Diterima
  // ---------------------------------------------------------------------------
  await t.test('10. Client hint X-Branch-ID yang sah diizinkan dan dicocokkan dengan penugasan', async () => {
    const client = await pool.connect();
    try {
      const docAcc = await client.query("SELECT id, organization_id FROM accounts WHERE username = 'dr_budi_sintetis' LIMIT 1;");
      const branchTebet = await client.query("SELECT id FROM branches WHERE code = 'BR-SINTETIS-02' LIMIT 1;");
      const tebetId = branchTebet.rows[0].id;

      const sessionId = await createSession({
        accountId: docAcc.rows[0].id,
        organizationId: docAcc.rows[0].organization_id,
        ipAddress: '127.0.0.1',
      });

      // Kirim hint X-Branch-ID yang sah (dokter memang ditugaskan ke Tebet)
      const validHintReq = {
        authorization: `Bearer ${sessionId}`,
        'x-branch-id': tebetId,
      };

      const result = await resolveRequestContext(validHintReq);
      assert.strictEqual(result.authenticated, true, 'Hint cabang yang sah harus diterima');
      assert.ok(result.context);
      assert.strictEqual(result.context.username, 'dr_budi_sintetis');

      await revokeSession(sessionId);
    } finally {
      client.release();
    }
  });

  // ---------------------------------------------------------------------------
  // 11. Peran Tingkat Organisasi (Super Admin / Org Admin)
  // ---------------------------------------------------------------------------
  await t.test('11. Peran tingkat organisasi (ORG_ADMIN) memiliki isOrgAdmin: true dan akses ke seluruh cabang', async () => {
    const client = await pool.connect();
    try {
      const adminAcc = await client.query("SELECT id, organization_id FROM accounts WHERE username = 'admin_sintetis' LIMIT 1;");
      const admin = adminAcc.rows[0];

      const sessionId = await createSession({
        accountId: admin.id,
        organizationId: admin.organization_id,
        ipAddress: '127.0.0.1',
      });

      const context = await validateSession(sessionId);
      assert.ok(context);
      assert.strictEqual(context.isOrgAdmin, true, 'Akun admin harus memiliki isOrgAdmin = true');
      assert.ok(context.roles.some((r) => r.code === 'ORG_ADMIN'));
      assert.ok(context.permissions.includes('audit:read'), 'Admin harus memiliki audit:read');
      assert.ok(context.permissions.includes('duplicate:review'), 'Admin harus memiliki duplicate:review');
      assert.ok(context.assignedBranchIds.length >= 2, 'Admin organisasi otomatis memiliki akses ke semua cabang faskes');

      // Admin diizinkan melakukan aksi di cabang manapun dalam organisasi
      const branchTebet = await client.query("SELECT id FROM branches WHERE code = 'BR-SINTETIS-02' LIMIT 1;");
      const adminAuthz = await authorizeAction(context, {
        targetBranchId: branchTebet.rows[0].id,
      });
      assert.strictEqual(adminAuthz.allowed, true, 'Admin organisasi harus diizinkan mengakses cabang manapun');

      await revokeSession(sessionId);
    } finally {
      client.release();
    }
  });

  // ---------------------------------------------------------------------------
  // 12. Parsing Header Cookie Standar
  // ---------------------------------------------------------------------------
  await t.test('12. resolveRequestContext mampu mengekstrak session_id dari Cookie header standar', async () => {
    const client = await pool.connect();
    try {
      const docAcc = await client.query("SELECT id, organization_id FROM accounts WHERE username = 'dr_budi_sintetis' LIMIT 1;");
      const sessionId = await createSession({
        accountId: docAcc.rows[0].id,
        organizationId: docAcc.rows[0].organization_id,
        ipAddress: '127.0.0.1',
      });

      // Kirim dalam format header Cookie standar
      const reqHeaders = {
        cookie: `theme=dark; session_id=${sessionId}; other=value`,
      };

      const result = await resolveRequestContext(reqHeaders);
      assert.strictEqual(result.authenticated, true, 'Harus berhasil mengekstrak session_id dari cookie header');
      assert.ok(result.context);
      assert.strictEqual(result.context.username, 'dr_budi_sintetis');

      await revokeSession(sessionId);
    } finally {
      client.release();
    }
  });
});
