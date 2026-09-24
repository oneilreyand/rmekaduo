# 🗄️ Skema Database & Data Dictionary (PostgreSQL)

Dokumen ini berisi Data Definition Language (DDL) lengkap untuk PostgreSQL 15+, mapping kolom ke standar FHIR SATUSEHAT, arsitektur audit trail *immutable*, serta strategi indeks trigram (`pg_trgm`) untuk pencarian fuzzy instan.

> [!NOTE]
> Arsitektur data ini mematuhi **ADR 0004** (Multi-Branch Scoped) dan **ADR 0005 Proposed** (Security & Data Governance). Seluruh tabel domain membawa `organization_id`; seluruh tabel operasional fasilitas membawa `branch_id`. Spesifikasi DDL ini akan dieksekusi secara bertahap pada Milestone P1 setelah ADR 0005 diterima.

---

## ⚡ Ekstensi PostgreSQL yang Diperlukan

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

---

## 🏛️ Skema Relasional Inti (DDL SQL)

```sql
-- =============================================================================
-- 0. PLATFORM ORGANISASI, CABANG & IDENTITY (ADR 0004 & ADR 0005 Proposed)
-- =============================================================================

-- Organisasi Induk (Tenant Boundary Utama)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL, -- Contoh: 'ORG-001'
    name VARCHAR(200) NOT NULL,
    ihs_organization_id VARCHAR(50), -- SATUSEHAT Organization ID
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Cabang Fasilitas Pelayanan Kesehatan
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL, -- Contoh: 'BR-01'
    name VARCHAR(200) NOT NULL,
    branch_type VARCHAR(50) DEFAULT 'KLINIK_PRATAMA',
    faskes_code_bpjs VARCHAR(50), -- Kode PPK BPJS (contoh: 0123R001)
    ihs_location_id VARCHAR(50), -- SATUSEHAT Location ID
    address TEXT,
    phone VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_branches_org_code UNIQUE (organization_id, code)
);

CREATE INDEX idx_branches_org ON branches(organization_id);

-- Akun Pengguna / Kredensial Login (Terpisah dari Person/Practitioner)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(100), -- Terenkripsi
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_accounts_org_username UNIQUE (organization_id, username)
);

CREATE INDEX idx_accounts_org ON accounts(organization_id);

-- Sesi Pengguna Server-Side (Stateful Session Store)
CREATE TABLE sessions (
    id VARCHAR(128) PRIMARY KEY, -- Token sesi 256-bit terenkripsi/hash
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    active_branch_id UUID REFERENCES branches(id) ON DELETE RESTRICT,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_account ON sessions(account_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Role & Permission System (Granular RBAC)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- 'SUPER_ADMIN', 'ORG_ADMIN', 'DOKTER_CABANG', dll.
    name VARCHAR(100) NOT NULL,
    scope_type VARCHAR(20) NOT NULL, -- 'ORGANIZATION' | 'BRANCH'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_roles_org_code UNIQUE (organization_id, code)
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'patient:read', 'encounter:write', 'cross_branch:read'
    name VARCHAR(150) NOT NULL,
    module VARCHAR(50) NOT NULL, -- 'PATIENTS', 'ENCOUNTERS', 'BILLING', 'SYSTEM'
    description TEXT
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Penugasan Peran ke Akun
CREATE TABLE role_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE, -- NULL bila peran berskala Organisasi
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_role_assignment UNIQUE (account_id, role_id, branch_id)
);

CREATE INDEX idx_role_assignments_account ON role_assignments(account_id);
CREATE INDEX idx_role_assignments_branch ON role_assignments(branch_id);

-- Tenaga Medis / Practitioner Kanonik (Satu per Organisasi Induk)
CREATE TABLE practitioners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    account_id UUID UNIQUE REFERENCES accounts(id) ON DELETE SET NULL,
    nik VARCHAR(16) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(10) NOT NULL, -- 'male' | 'female'
    practitioner_type VARCHAR(50) NOT NULL, -- 'DOKTER_UMUM', 'DOKTER_SPESIALIS', 'PERAWAT', 'BIDAN'
    sip_number VARCHAR(100),
    ihs_practitioner_id VARCHAR(50),
    phone VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_practitioner_org_nik UNIQUE (organization_id, nik)
);

CREATE INDEX idx_practitioners_org ON practitioners(organization_id);

-- Penugasan Tenaga Medis ke Cabang
CREATE TABLE practitioner_branch_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    is_primary_branch BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_practitioner_branch UNIQUE (practitioner_id, branch_id)
);

CREATE INDEX idx_practitioner_branch ON practitioner_branch_assignments(branch_id, practitioner_id);

-- Unit Layanan / Poli per Cabang
CREATE TABLE polis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    code VARCHAR(30) NOT NULL, -- 'POLI_UMUM', 'POLI_GIGI', 'POLI_KIA'
    name VARCHAR(100) NOT NULL,
    bpjs_poli_code VARCHAR(30),
    satusehat_service_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_polis_branch_code UNIQUE (branch_id, code)
);

CREATE INDEX idx_polis_branch ON polis(branch_id);

-- Jadwal Praktik Tenaga Medis per Cabang dan Poli
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    poli_id UUID NOT NULL REFERENCES polis(id) ON DELETE RESTRICT,
    practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE RESTRICT,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1 = Senin, 7 = Minggu
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_quota INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schedules_branch_practitioner ON schedules(branch_id, practitioner_id);
CREATE INDEX idx_schedules_day ON schedules(branch_id, day_of_week);

-- Peninjauan Kandidat Duplikat Pasien (ADR 0005 - Anti Auto-Merge)
CREATE TYPE duplicate_candidate_status AS ENUM ('PENDING_REVIEW', 'CONFIRMED_SAME', 'CONFIRMED_DIFFERENT');

CREATE TABLE patient_duplicate_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    primary_patient_id UUID NOT NULL, -- REFERENCES patients(id)
    candidate_patient_id UUID NOT NULL, -- REFERENCES patients(id)
    confidence_score NUMERIC(5,2) NOT NULL,
    match_reasons JSONB NOT NULL,
    status duplicate_candidate_status DEFAULT 'PENDING_REVIEW',
    reviewed_by UUID REFERENCES accounts(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_duplicate_pair UNIQUE (organization_id, primary_patient_id, candidate_patient_id)
);

-- =============================================================================
-- 1. USERS & RBAC (Legacy Prototype - Menunggu Cutover ke Accounts & Roles di P1)
-- =============================================================================
CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'DOKTER',
    'PERAWAT',
    'FARMASI',
    'PENDAFTARAN',
    'REKAM_MEDIS',
    'KASIR'
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nik VARCHAR(16) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    sip_number VARCHAR(50),
    ihs_practitioner_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 2. MASTER PASIEN KANONIK (Satu per Organisasi Induk - ADR 0004 & 0005)
-- =============================================================================
CREATE TYPE patient_record_status AS ENUM ('ACTIVE', 'DUPLICATE_CANDIDATE', 'MERGED_INTO');

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    no_rm VARCHAR(20) NOT NULL, -- Nomor Rekam Medis Kanonik Organisasi
    nik VARCHAR(16) NOT NULL,
    ihs_patient_id VARCHAR(50), -- ID Pasien SATUSEHAT (misal: P01234567890)
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(10) NOT NULL, -- 'male' | 'female'
    birth_date DATE NOT NULL,
    blood_type VARCHAR(5), -- 'A', 'B', 'AB', 'O'
    bpjs_card_no VARCHAR(20),
    phone_number VARCHAR(20),
    address TEXT,
    is_registered_via_mjkn BOOLEAN DEFAULT FALSE, -- Flag pendaftaran mandiri Mobile JKN
    allergies JSONB DEFAULT '[]'::JSONB, -- [{"substance": "Amoksisilin", "severity": "severe"}]
    status patient_record_status DEFAULT 'ACTIVE',
    merged_into_patient_id UUID REFERENCES patients(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_patients_org_no_rm UNIQUE (organization_id, no_rm),
    CONSTRAINT uq_patients_org_nik UNIQUE (organization_id, nik)
);

CREATE INDEX idx_patients_org ON patients(organization_id);
CREATE INDEX idx_patients_nik ON patients(nik);
CREATE INDEX idx_patients_no_rm ON patients(no_rm);
CREATE INDEX idx_patients_ihs ON patients(ihs_patient_id);

-- =============================================================================
-- 3. KUNJUNGAN PASIEN / ENCOUNTER (Terikat pada Cabang - ADR 0004)
-- =============================================================================
CREATE TYPE booking_source_type AS ENUM ('MOBILE_JKN', 'ON_SITE', 'RUJUKAN_INTERNAL');

CREATE TYPE encounter_status AS ENUM (
    'BOOKED',        -- Terdaftar via Mobile JKN (menunggu kedatangan hari H)
    'ARRIVED',       -- Pasien datang / check-in (Task 1 & 2)
    'IN_QUEUE',      -- Menunggu poli (Task 3)
    'IN_CONSULTATION',-- Sedang diperiksa dokter (Task 4)
    'PHARMACY_QUEUE',-- Menunggu obat (Task 5)
    'COMPLETED',     -- Kunjungan selesai (Task 7)
    'CANCELLED'
);

CREATE TABLE encounters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    poli_code VARCHAR(20) NOT NULL, -- 'POLI_UMUM', 'POLI_GIGI', dll
    queue_number VARCHAR(10) NOT NULL,
    status encounter_status DEFAULT 'ARRIVED',
    
    -- Metadata Pendaftaran Mobile JKN & Antrol BPJS v2
    booking_source booking_source_type DEFAULT 'ON_SITE',
    booking_code VARCHAR(50) UNIQUE, -- Kode booking unik (misal: 'MJKN-20260921-001')
    estimated_service_time TIMESTAMPTZ, -- Estimasi waktu pelayanan BPJS Antrol
    checkin_time TIMESTAMPTZ, -- Waktu check-in peserta di faskes
    
    -- Bridging BPJS Metadata
    bpjs_sep_no VARCHAR(30),
    bpjs_current_task INT DEFAULT 1, -- 1 s/d 7
    bpjs_sync_status VARCHAR(20) DEFAULT 'PENDING',
    
    -- Bridging SATUSEHAT Metadata (HL7 FHIR R4)
    fhir_encounter_id VARCHAR(100), -- ID Encounter yang dikembalikan SATUSEHAT
    satusehat_encounter_status VARCHAR(20) DEFAULT 'planned', -- 'planned', 'arrived', 'in-progress', 'finished', 'cancelled'
    satusehat_sync_status VARCHAR(20) DEFAULT 'PENDING',
    
    arrived_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    consultation_started_at TIMESTAMPTZ,
    consultation_ended_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_encounters_patient ON encounters(patient_id);
CREATE INDEX idx_encounters_date ON encounters(arrived_at);
CREATE INDEX idx_encounters_booking_code ON encounters(booking_code);

-- =============================================================================
-- 4. CPPT / SOAP & MEDICAL RECORD LOCKING (STARKES Compliance)
-- =============================================================================
CREATE TYPE note_lock_status AS ENUM ('DRAFT', 'FINAL', 'AMENDED');

CREATE TABLE clinical_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID UNIQUE NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
    practitioner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Struktur SOAP
    subjective TEXT NOT NULL, -- Anamnesis & Keluhan Utama
    objective TEXT NOT NULL,   -- Pemeriksaan Fisik
    assessment_summary TEXT,  -- Catatan analisa klinis
    plan_instruction TEXT,    -- Rencana edukasi & instruksi
    
    -- Kepatuhan STARKES: Locking & TTE
    status note_lock_status DEFAULT 'DRAFT',
    locked_at TIMESTAMPTZ,    -- Terkunci otomatis setelah 24 jam atau setelah dokter TTE
    digital_signature_hash VARCHAR(255), -- Hash TTE (BSrE / SHA-256)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 5. CATATAN ADDENDUM (Ralat Rekam Medis Tanpa Hapus Data Asli)
-- =============================================================================
CREATE TABLE clinical_addendums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinical_note_id UUID NOT NULL REFERENCES clinical_notes(id) ON DELETE RESTRICT,
    practitioner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reason_for_change TEXT NOT NULL,
    original_snapshot JSONB NOT NULL, -- Data rekam medis sebelum addendum
    addendum_notes TEXT NOT NULL,     -- Catatan perbaikan/tambahan
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 6. TANDA-TANDA VITAL (TTV) & SKRINING (HL7 FHIR Observation)
-- =============================================================================
CREATE TABLE vital_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
    systolic INT,             -- mmHg (LOINC: 8480-6)
    diastolic INT,            -- mmHg (LOINC: 8462-4)
    heart_rate INT,           -- bpm  (LOINC: 8867-4)
    respiratory_rate INT,     -- x/menit (LOINC: 9279-1)
    temperature NUMERIC(4,1), -- °C   (LOINC: 8310-5)
    spo2 NUMERIC(4,1),        -- %    (LOINC: 59408-5)
    weight_kg NUMERIC(5,2),   -- kg
    height_cm NUMERIC(5,2),   -- cm
    pain_scale INT DEFAULT 0, -- Skala Nyeri 0-10 (NRS)
    fall_risk_score INT,      -- Skor Risiko Jatuh (Morse / Get Up & Go)
    fall_risk_level VARCHAR(20) DEFAULT 'RENDAH', -- 'RENDAH', 'SEDANG', 'TINGGI'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 7. DIAGNOSIS & TINDAKAN (ICD-10 & ICD-9-CM)
-- =============================================================================
CREATE TABLE encounter_diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
    icd10_code VARCHAR(10) NOT NULL, -- Contoh: 'J06.9'
    icd10_name VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    fhir_condition_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE encounter_procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
    icd9_code VARCHAR(10) NOT NULL, -- Contoh: '89.07'
    icd9_name VARCHAR(255) NOT NULL,
    fhir_procedure_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 8. E-RESEP & OBAT (HL7 FHIR MedicationRequest & KFA)
-- =============================================================================
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(20) DEFAULT 'SUBMITTED', -- 'DRAFT', 'SUBMITTED', 'DISPENSED'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    kfa_code VARCHAR(50), -- Kode KFA Kemenkes (Contoh: 93001019)
    medication_name VARCHAR(255) NOT NULL,
    dosage_form VARCHAR(50), -- 'TABLET', 'SIRUP', 'KAPSUL'
    signa VARCHAR(100) NOT NULL, -- '3 x 1 tablet sesudah makan'
    quantity INT NOT NULL,
    unit VARCHAR(30) NOT NULL, -- 'Tablet', 'Botol'
    is_racikan BOOLEAN DEFAULT FALSE,
    racikan_recipe JSONB, -- Komposisi jika racikan
    fhir_medication_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 9. AUDIT TRAIL LOGS IMMUTABLE (Wajib STARKES / UU PDP - ADR 0004 & 0005)
-- =============================================================================
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    user_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    correlation_id VARCHAR(100),
    action VARCHAR(50) NOT NULL, -- 'LOGIN', 'LOGOUT', 'READ', 'CREATE', 'UPDATE', 'DELETE', 'CROSS_BRANCH_ACCESS'
    entity_name VARCHAR(50) NOT NULL, -- 'patients', 'encounters', 'clinical_notes', 'prescriptions'
    entity_id VARCHAR(100) NOT NULL,
    old_values JSONB, -- Data sebelum perubahan (tanpa kredensial/rahasia)
    new_values JSONB, -- Data sesudah perubahan
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_org_time ON audit_logs(organization_id, created_at);
CREATE INDEX idx_audit_branch_time ON audit_logs(branch_id, created_at);
CREATE INDEX idx_audit_entity ON audit_logs(entity_name, entity_id);
CREATE INDEX idx_audit_user_time ON audit_logs(user_id, created_at);

-- Kepatuhan STARKES & UU PDP: Immutabilitas Audit Log (Append-Only Enforcement)
-- Mencegah UPDATE dan DELETE pada tabel audit_logs di tingkat database
CREATE OR REPLACE RULE prevent_audit_update AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE OR REPLACE RULE prevent_audit_delete AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- =============================================================================
-- 10. MASTER TERMINOLOGI & FAST FUZZY SEARCH (pg_trgm)
-- =============================================================================
CREATE TABLE master_icd10 (
    code VARCHAR(10) PRIMARY KEY,
    name_id TEXT NOT NULL,
    name_en TEXT NOT NULL,
    search_text TEXT GENERATED ALWAYS AS (code || ' ' || name_en || ' ' || name_id) STORED
);

CREATE INDEX idx_master_icd10_trgm ON master_icd10 USING gin (search_text gin_trgm_ops);

CREATE TABLE master_kfa (
    kfa_code VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    active_substance TEXT,
    dosage_form TEXT,
    search_text TEXT GENERATED ALWAYS AS (kfa_code || ' ' || name || ' ' || COALESCE(active_substance, '')) STORED
);

CREATE INDEX idx_master_kfa_trgm ON master_kfa USING gin (search_text gin_trgm_ops);
```

---

## ⚡ Query Fuzzy Search Super Cepat (< 30ms)

Dokter mengetik `ispa` atau `batuk`:

```sql
SELECT code, name_id, name_en, similarity(search_text, 'ispa') AS sim
FROM master_icd10
WHERE search_text % 'ispa'
ORDER BY sim DESC
LIMIT 10;
```
