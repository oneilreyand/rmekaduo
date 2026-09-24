-- =============================================================================
-- Migration: 0002_rls_organization_isolation.up.sql
-- Description: Row-Level Security untuk isolasi data antar organisasi
-- ADR Reference: ADR 0004 (Accepted), ADR 0005 (Proposed — prototype only)
-- Status: Prototype keamanan. Tidak production-ready sampai ADR 0005 diterima.
--
-- Mekanisme:
--   Aplikasi wajib SET LOCAL app.current_organization_id = '<uuid>' di awal
--   setiap transaksi / koneksi sebelum query ke tabel yang dilindungi.
--   Jika setting tidak ada atau kosong, policy mengembalikan FALSE sehingga
--   tidak ada baris yang dapat dibaca oleh koneksi aplikasi.
--
--   Koneksi superuser (DBA) bypass RLS secara default PostgreSQL.
--   Untuk test: gunakan role aplikasi (bukan superuser) agar RLS aktif.
-- =============================================================================

-- Helper: ambil organization_id saat ini dari konfigurasi sesi lokal.
-- Mengembalikan NULL jika belum di-set, sehingga policy menolak semua baris.
CREATE OR REPLACE FUNCTION app_current_org_id() RETURNS UUID AS $$
DECLARE
  val TEXT;
BEGIN
  val := current_setting('app.current_organization_id', true);
  IF val IS NULL OR val = '' THEN
    RETURN NULL;
  END IF;
  RETURN val::UUID;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =============================================================================
-- 1. organizations — batas tenant utama
-- =============================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Policy: hanya bisa membaca organisasi milik sendiri.
-- Org-admin yang terautentikasi men-SET local app.current_organization_id ke
-- organisation ID miliknya sebelum query.
CREATE POLICY rls_org_isolation ON organizations
  AS RESTRICTIVE
  FOR ALL
  USING (id = app_current_org_id());

-- =============================================================================
-- 2. branches
-- =============================================================================
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_branches_isolation ON branches
  AS RESTRICTIVE
  FOR ALL
  USING (organization_id = app_current_org_id());

-- =============================================================================
-- 3. accounts
-- =============================================================================
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_accounts_isolation ON accounts
  AS RESTRICTIVE
  FOR ALL
  USING (organization_id = app_current_org_id());

-- =============================================================================
-- 4. sessions
-- =============================================================================
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_sessions_isolation ON sessions
  AS RESTRICTIVE
  FOR ALL
  USING (organization_id = app_current_org_id());

-- =============================================================================
-- 5. roles
-- =============================================================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_roles_isolation ON roles
  AS RESTRICTIVE
  FOR ALL
  USING (organization_id = app_current_org_id());

-- =============================================================================
-- 6. role_assignments
-- =============================================================================
ALTER TABLE role_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_role_assignments_isolation ON role_assignments
  AS RESTRICTIVE
  FOR ALL
  USING (organization_id = app_current_org_id());

-- =============================================================================
-- 7. practitioners
-- =============================================================================
ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_practitioners_isolation ON practitioners
  AS RESTRICTIVE
  FOR ALL
  USING (organization_id = app_current_org_id());

-- =============================================================================
-- 8. practitioner_branch_assignments
-- =============================================================================
ALTER TABLE practitioner_branch_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_pba_isolation ON practitioner_branch_assignments
  AS RESTRICTIVE
  FOR ALL
  USING (organization_id = app_current_org_id());

-- =============================================================================
-- 9. polis
-- =============================================================================
ALTER TABLE polis ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_polis_isolation ON polis
  AS RESTRICTIVE
  FOR ALL
  USING (organization_id = app_current_org_id());

-- =============================================================================
-- 10. schedules
-- =============================================================================
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_schedules_isolation ON schedules
  AS RESTRICTIVE
  FOR ALL
  USING (organization_id = app_current_org_id());

-- =============================================================================
-- 11. patients
-- =============================================================================
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_patients_isolation ON patients
  AS RESTRICTIVE
  FOR ALL
  USING (organization_id = app_current_org_id());

-- =============================================================================
-- 12. patient_duplicate_candidates
-- =============================================================================
ALTER TABLE patient_duplicate_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_dup_candidates_isolation ON patient_duplicate_candidates
  AS RESTRICTIVE
  FOR ALL
  USING (organization_id = app_current_org_id());

-- =============================================================================
-- 13. audit_logs — INSERT diizinkan selalu (logging immutable); SELECT dibatasi
--     UPDATE dan DELETE sudah diblokir oleh rule prevent_audit_update/delete.
-- =============================================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- INSERT tidak membutuhkan cek org context agar audit tetap bisa dicatat
-- dari konteks mana pun (termasuk auth flow sebelum context di-set).
-- SELECT dibatasi per organisasi.
CREATE POLICY rls_audit_insert ON audit_logs
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY rls_audit_select ON audit_logs
  AS RESTRICTIVE
  FOR SELECT
  USING (
    organization_id IS NULL
    OR organization_id = app_current_org_id()
  );

-- Catat aplikasi migration ini ke audit_logs (agar audit trail lengkap)
-- app_current_org_id() akan NULL di sini, sehingga organization_id NULL diizinkan.
INSERT INTO audit_logs (
  correlation_id, action, entity_name, entity_id, new_values, ip_address
) VALUES (
  'migration-0002-rls',
  'SCHEMA_MIGRATION',
  'schema_migrations',
  '0002_rls_organization_isolation',
  '{"description": "Row-Level Security policies diterapkan pada seluruh tabel domain"}',
  '127.0.0.1'
);
