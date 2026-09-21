# 🗄️ Skema Database & Data Dictionary (PostgreSQL)

Dokumen ini berisi Data Definition Language (DDL) lengkap untuk PostgreSQL 15+, mapping kolom ke standar FHIR SATUSEHAT, arsitektur audit trail *immutable*, serta strategi indeks trigram (`pg_trgm`) untuk pencarian fuzzy instan.

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
-- 1. USERS & RBAC (Role-Based Access Control)
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
    sip_number VARCHAR(50), -- Surat Izin Praktik (Khusus Dokter)
    ihs_practitioner_id VARCHAR(50), -- SATUSEHAT Practitioner ID
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 2. MASTER PASIEN (Sesuai Permenkes 24/2022)
-- =============================================================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    no_rm VARCHAR(20) UNIQUE NOT NULL, -- Nomor Rekam Medis (Format: 00-00-00)
    nik VARCHAR(16) UNIQUE NOT NULL,
    ihs_patient_id VARCHAR(50) UNIQUE, -- ID Pasien SATUSEHAT (misal: P01234567890)
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(10) NOT NULL, -- 'male' | 'female'
    birth_date DATE NOT NULL,
    blood_type VARCHAR(5), -- 'A', 'B', 'AB', 'O'
    bpjs_card_no VARCHAR(20),
    phone_number VARCHAR(20),
    address TEXT,
    is_registered_via_mjkn BOOLEAN DEFAULT FALSE, -- Flag pendaftaran mandiri Mobile JKN
    allergies JSONB DEFAULT '[]'::JSONB, -- Array of strings/objects: [{"substance": "Amoksisilin", "severity": "severe"}]
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_nik ON patients(nik);
CREATE INDEX idx_patients_no_rm ON patients(no_rm);
CREATE INDEX idx_patients_ihs ON patients(ihs_patient_id);

-- =============================================================================
-- 3. KUNJUNGAN PASIEN / ENCOUNTER (HL7 FHIR Encounter)
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
-- 9. AUDIT TRAIL LOGS (Wajib STARKES / UU PDP)
-- =============================================================================
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(20) NOT NULL, -- 'LOGIN', 'LOGOUT', 'READ', 'CREATE', 'UPDATE', 'DELETE'
    entity_name VARCHAR(50) NOT NULL, -- 'patients', 'clinical_notes', 'prescriptions'
    entity_id VARCHAR(100) NOT NULL,
    old_values JSONB, -- Data sebelum perubahan
    new_values JSONB, -- Data sesudah perubahan
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_name, entity_id);
CREATE INDEX idx_audit_user_time ON audit_logs(user_id, created_at);

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
