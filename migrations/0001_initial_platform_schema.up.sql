-- =============================================================================
-- Migration: 0001_initial_platform_schema.up.sql
-- Description: Platform Organisasi, Multi-Cabang, Identity, RBAC, Master Nakes/Pasien, dan Audit Immutable
-- ADR Reference: ADR 0004 & ADR 0005
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- -----------------------------------------------------------------------------
-- 1. Organisasi Induk (Tenant Boundary Utama)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    ihs_organization_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_organizations_code ON organizations(code);

-- -----------------------------------------------------------------------------
-- 2. Cabang Fasilitas Pelayanan Kesehatan
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    branch_type VARCHAR(50) DEFAULT 'KLINIK_PRATAMA',
    faskes_code_bpjs VARCHAR(50),
    ihs_location_id VARCHAR(50),
    address TEXT,
    phone VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_branches_org_code UNIQUE (organization_id, code)
);

CREATE INDEX IF NOT EXISTS idx_branches_org ON branches(organization_id);
CREATE INDEX IF NOT EXISTS idx_branches_code ON branches(code);

-- -----------------------------------------------------------------------------
-- 3. Akun Pengguna / Kredensial Login
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(100),
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_accounts_org_username UNIQUE (organization_id, username)
);

CREATE INDEX IF NOT EXISTS idx_accounts_org ON accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_accounts_username ON accounts(username);

-- -----------------------------------------------------------------------------
-- 4. Sesi Pengguna Server-Side (Stateful Session Store)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(128) PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    active_branch_id UUID REFERENCES branches(id) ON DELETE RESTRICT,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_account ON sessions(account_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- -----------------------------------------------------------------------------
-- 5. Role & Permission System (Granular RBAC)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    scope_type VARCHAR(20) NOT NULL, -- 'ORGANIZATION' | 'BRANCH'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_roles_org_code UNIQUE (organization_id, code)
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- -----------------------------------------------------------------------------
-- 6. Penugasan Peran ke Akun (Role Assignments)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_role_assignment UNIQUE (account_id, role_id, branch_id)
);

CREATE INDEX IF NOT EXISTS idx_role_assignments_account ON role_assignments(account_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_branch ON role_assignments(branch_id);

-- -----------------------------------------------------------------------------
-- 7. Tenaga Medis / Practitioner Kanonik (Satu per Organisasi Induk)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS practitioners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    account_id UUID UNIQUE REFERENCES accounts(id) ON DELETE SET NULL,
    nik VARCHAR(16) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    practitioner_type VARCHAR(50) NOT NULL,
    sip_number VARCHAR(100),
    ihs_practitioner_id VARCHAR(50),
    phone VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_practitioner_org_nik UNIQUE (organization_id, nik)
);

CREATE INDEX IF NOT EXISTS idx_practitioners_org ON practitioners(organization_id);
CREATE INDEX IF NOT EXISTS idx_practitioners_nik ON practitioners(nik);

-- -----------------------------------------------------------------------------
-- 8. Penugasan Tenaga Medis ke Cabang
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS practitioner_branch_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    is_primary_branch BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_practitioner_branch UNIQUE (practitioner_id, branch_id)
);

CREATE INDEX IF NOT EXISTS idx_practitioner_branch ON practitioner_branch_assignments(branch_id, practitioner_id);

-- -----------------------------------------------------------------------------
-- 9. Unit Layanan / Poli per Cabang
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS polis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    code VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    bpjs_poli_code VARCHAR(30),
    satusehat_service_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_polis_branch_code UNIQUE (branch_id, code)
);

CREATE INDEX IF NOT EXISTS idx_polis_branch ON polis(branch_id);

-- -----------------------------------------------------------------------------
-- 10. Jadwal Praktik Tenaga Medis per Cabang dan Poli
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    poli_id UUID NOT NULL REFERENCES polis(id) ON DELETE RESTRICT,
    practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE RESTRICT,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_quota INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schedules_branch_practitioner ON schedules(branch_id, practitioner_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day ON schedules(branch_id, day_of_week);

-- -----------------------------------------------------------------------------
-- 11. Master Pasien Kanonik (Satu per Organisasi Induk)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    no_rm VARCHAR(20) NOT NULL,
    nik VARCHAR(16) NOT NULL,
    ihs_patient_id VARCHAR(50),
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    birth_date DATE NOT NULL,
    blood_type VARCHAR(5),
    bpjs_card_no VARCHAR(20),
    phone_number VARCHAR(20),
    address TEXT,
    is_registered_via_mjkn BOOLEAN DEFAULT FALSE,
    allergies JSONB DEFAULT '[]'::JSONB,
    status VARCHAR(30) DEFAULT 'ACTIVE', -- 'ACTIVE', 'DUPLICATE_CANDIDATE', 'MERGED_INTO'
    merged_into_patient_id UUID REFERENCES patients(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_patients_org_no_rm UNIQUE (organization_id, no_rm),
    CONSTRAINT uq_patients_org_nik UNIQUE (organization_id, nik)
);

CREATE INDEX IF NOT EXISTS idx_patients_org ON patients(organization_id);
CREATE INDEX IF NOT EXISTS idx_patients_nik ON patients(nik);
CREATE INDEX IF NOT EXISTS idx_patients_no_rm ON patients(no_rm);
CREATE INDEX IF NOT EXISTS idx_patients_ihs ON patients(ihs_patient_id);

-- -----------------------------------------------------------------------------
-- 12. Kandidat Duplikat Pasien (ADR 0005 - Anti Auto-Merge)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patient_duplicate_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    primary_patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    candidate_patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    confidence_score NUMERIC(5,2) NOT NULL,
    match_reasons JSONB NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING_REVIEW', -- 'PENDING_REVIEW', 'CONFIRMED_SAME', 'CONFIRMED_DIFFERENT'
    reviewed_by UUID REFERENCES accounts(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_duplicate_pair UNIQUE (organization_id, primary_patient_id, candidate_patient_id)
);

CREATE INDEX IF NOT EXISTS idx_duplicate_candidates_org ON patient_duplicate_candidates(organization_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_candidates_status ON patient_duplicate_candidates(status);

-- -----------------------------------------------------------------------------
-- 13. Audit Trail Logs Immutable (Append-Only - ADR 0004 & ADR 0005)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    user_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    correlation_id VARCHAR(100),
    action VARCHAR(50) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_org_time ON audit_logs(organization_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_branch_time ON audit_logs(branch_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_name, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user_time ON audit_logs(user_id, created_at);

-- Immutability rules
CREATE OR REPLACE RULE prevent_audit_update AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE OR REPLACE RULE prevent_audit_delete AS ON DELETE TO audit_logs DO INSTEAD NOTHING;
