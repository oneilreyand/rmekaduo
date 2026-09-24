-- =============================================================================
-- Migration: 0001_initial_platform_schema.down.sql
-- Description: Rollback platform schema (drops tables in reverse dependency order)
-- =============================================================================

DROP RULE IF EXISTS prevent_audit_delete ON audit_logs;
DROP RULE IF EXISTS prevent_audit_update ON audit_logs;

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS patient_duplicate_candidates CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS polis CASCADE;
DROP TABLE IF EXISTS practitioner_branch_assignments CASCADE;
DROP TABLE IF EXISTS practitioners CASCADE;
DROP TABLE IF EXISTS role_assignments CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
