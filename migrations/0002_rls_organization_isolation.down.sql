-- =============================================================================
-- Migration: 0002_rls_organization_isolation.down.sql
-- Rollback: Hapus semua RLS policy dan nonaktifkan RLS pada tabel domain.
-- =============================================================================

-- 13. audit_logs
DROP POLICY IF EXISTS rls_audit_select ON audit_logs;
DROP POLICY IF EXISTS rls_audit_insert ON audit_logs;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- 12. patient_duplicate_candidates
DROP POLICY IF EXISTS rls_dup_candidates_isolation ON patient_duplicate_candidates;
ALTER TABLE patient_duplicate_candidates DISABLE ROW LEVEL SECURITY;

-- 11. patients
DROP POLICY IF EXISTS rls_patients_isolation ON patients;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;

-- 10. schedules
DROP POLICY IF EXISTS rls_schedules_isolation ON schedules;
ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;

-- 9. polis
DROP POLICY IF EXISTS rls_polis_isolation ON polis;
ALTER TABLE polis DISABLE ROW LEVEL SECURITY;

-- 8. practitioner_branch_assignments
DROP POLICY IF EXISTS rls_pba_isolation ON practitioner_branch_assignments;
ALTER TABLE practitioner_branch_assignments DISABLE ROW LEVEL SECURITY;

-- 7. practitioners
DROP POLICY IF EXISTS rls_practitioners_isolation ON practitioners;
ALTER TABLE practitioners DISABLE ROW LEVEL SECURITY;

-- 6. role_assignments
DROP POLICY IF EXISTS rls_role_assignments_isolation ON role_assignments;
ALTER TABLE role_assignments DISABLE ROW LEVEL SECURITY;

-- 5. roles
DROP POLICY IF EXISTS rls_roles_isolation ON roles;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;

-- 4. sessions
DROP POLICY IF EXISTS rls_sessions_isolation ON sessions;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;

-- 3. accounts
DROP POLICY IF EXISTS rls_accounts_isolation ON accounts;
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;

-- 2. branches
DROP POLICY IF EXISTS rls_branches_isolation ON branches;
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;

-- 1. organizations
DROP POLICY IF EXISTS rls_org_isolation ON organizations;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Helper function
DROP FUNCTION IF EXISTS app_current_org_id();
