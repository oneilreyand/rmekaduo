# 🏗️ Arsitektur Sistem & Tech Stack RME

Dokumen ini mendefinisikan arsitektur sistem perangkat lunak, komponen infrastruktur, pola asinkronus (queue worker), struktur direktori, dan variabel lingkungan (*environment variables*).

---

## 🏛️ Arsitektur Tingkat Tinggi (High-Level Architecture)

```mermaid
graph TB
    subgraph Client Layer
        UI_DOC["🖥️ Layar Dokter (Next.js / React)"]
        UI_ADM["🏢 Pendaftaran & Antrean"]
        UI_FAR["💊 Layar Farmasi"]
    end

    subgraph Application Server
        API["⚡ Core App Engine (Next.js / Node.js / Go)"]
        AUTH["🔐 RBAC & Session Manager"]
        AUDIT["📝 Audit Trail Logger"]
    end

    subgraph Data Layer
        DB[("🐘 PostgreSQL 15+<br/>- JSONB FHIR Resources<br/>- pg_trgm Search<br/>- Immutable Audit Logs")]
        CACHE[("🔴 Redis 7+<br/>- Session & Rate Limit<br/>- SATUSEHAT Token Cache<br/>- BullMQ Job Queue")]
    end

    subgraph Background Workers
        WORKER["⚙️ Worker Service (BullMQ)"]
        RETRY["🔄 DLQ & Retry Handler"]
    end

    subgraph External Bridging
        BPJS_API["🌐 BPJS Kesehatan<br/>(Antrean V2, P-Care / V-Claim)"]
        SATU_API["🌐 Kemenkes SATUSEHAT<br/>(HL7 FHIR R4)"]
    end

    UI_DOC --> API
    UI_ADM --> API
    UI_FAR --> API

    API --> AUTH
    API --> AUDIT
    API --> DB
    API --> CACHE
    
    API -.->|Push Sync Job| CACHE
    CACHE -.->|Poll Job| WORKER
    WORKER --> BPJS_API
    WORKER --> SATU_API
    WORKER -.->|Fail Retry| RETRY
    RETRY -.->|Update Sync Status| DB
```

---

## 🛠️ Rekomendasi Tech Stack

| Lapisan | Pilihan Utama | Alasan Pemilihan Teknis |
| :--- | :--- | :--- |
| **Frontend** | **Next.js (App Router) + Tailwind CSS + shadcn/ui** | Sangat cepat di-load, *component state* ringan, mendukung CSS variabel untuk token warna klinis, dan mudah membuat layout padat tanpa refresh halaman. |
| **Icons & UI Utility** | **Lucide Icons + Radix UI + Hotkeys hook** | Ikon clean medis, aksesibilitas keyboard tingkat tinggi, dan penanganan shortcut keyboard global (`useHotkeys`). |
| **Backend API** | **Node.js (TypeScript) / Next.js Server Actions & Route Handlers** | Type-safe end-to-end dengan Zod, efisiensi ekosistem JSON/FHIR, dan integrasi mudah dengan worker. |
| **Database** | **PostgreSQL 15+** | Dukungan kolom `JSONB` native (sangat pas untuk menyimpan payload FHIR Kemenkes) dan ekstensi `pg_trgm` untuk fuzzy search diagnosa ICD-10 < 50ms. |
| **Queue / Worker** | **BullMQ + Redis 7** | Menjamin dokter tidak pernah menunggu response lambat dari Kemenkes/BPJS. Job otomatis di-retry dengan *exponential backoff*. |
| **Validasi Skema** | **Zod** | Menjamin validasi input SOAP, TTV, NIK, dan payload bridging sebelum masuk database/API. |

---

## 📂 Struktur Direktori Proyek (Recommended Layout)

```
RME/
├── docs/                             # Developer Hub & Panduan Teknis
├── prisma/ atau src/db/              # Schema database, migrasi, dan seeders (ICD-10 & KFA)
│   ├── schema.prisma
│   └── seeds/
│       ├── icd10_indonesia.json
│       └── kfa_common_drugs.json
├── public/                           # Aset publik statis
├── src/
│   ├── app/                          # Next.js App Router (Pages & Layouts)
│   │   ├── (auth)/login/
│   │   ├── (dashboard)/
│   │   │   ├── pendaftaran/          # Admisi & Antrean Pasien
│   │   │   ├── rawat-jalan/
│   │   │   │   └── periksa/[id]/     # ⭐ Single-Screen Layar Kerja Dokter
│   │   │   ├── farmasi/              # E-Resep & Dispensing
│   │   │   └── laporan/              # Indikator Mutu (INM) & 10 Besar Penyakit
│   │   └── api/                      # Route Handlers / REST Endpoints
│   │       ├── bridging/bpjs/
│   │       ├── bridging/satusehat/
│   │       └── search/               # ICD-10 & KFA autocomplete API
│   ├── components/                   # Komponen Reusable UI (shadcn/ui)
│   │   ├── ui/                       # Button, Badge, Dialog, Input, Card
│   │   └── clinical/                 # Komponen Spesifik Medis:
│   │       ├── patient-header.tsx    # Banner Pasien + Alert Alergi/Jatuh
│   │       ├── soap-editor.tsx       # Editor SOAP + Macro Button
│   │       ├── vital-signs-card.tsx  # Input & Widget TTV
│   │       ├── prescription-form.tsx # Form E-Resep & Pengecekan Interaksi
│   │       └── hotkey-provider.tsx   # Listener Shortcut Keyboard
│   ├── lib/                          # Modul Inti & Logic
│   │   ├── db.ts                     # Database connection pool
│   │   ├── redis.ts                  # Redis client instance
│   │   ├── bpjs/                     # BPJS Bridging Helper
│   │   │   ├── signature.ts          # HMAC-SHA256 generator
│   │   │   ├── crypto.ts             # AES-256-CBC decryptor + LZString
│   │   │   └── antrean.ts            # Task 1-7 dispatcher
│   │   ├── satusehat/                # SATUSEHAT FHIR R4 Engine
│   │   │   ├── oauth.ts              # OAuth2 Token Manager & Redis Caching
│   │   │   ├── patient.ts            # IHS Patient query by NIK
│   │   │   └── bundle-builder.ts     # FHIR Bundle generator (Enc, Cond, Obs, Med)
│   │   └── audit/                    # Audit Trail Middleware & Logger
│   ├── queue/                        # BullMQ Workers & Job Processors
│   │   ├── bpjs-queue.ts
│   │   └── satusehat-queue.ts
│   └── types/                        # TypeScript Interfaces & Zod Schemas
│       ├── clinical.ts
│       ├── fhir.ts
│       └── bpjs.ts
├── .env.example
├── package.json
└── tailwind.config.ts
```

---

## ⚙️ Spesifikasi Environment Variables (`.env.example`)

```env
# ==============================================================================
# APP CORE CONFIG
# ==============================================================================
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000
APP_SECRET=your_super_secret_jwt_key_at_least_32_characters

# ==============================================================================
# DATABASE (POSTGRESQL) & CACHE (REDIS)
# ==============================================================================
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rme_db?schema=public"
REDIS_URL="redis://localhost:6379"

# ==============================================================================
# BPJS KESEHATAN BRIDGING CONFIG
# ==============================================================================
BPJS_CONS_ID="12345"
BPJS_SECRET_KEY="abcde12345"
BPJS_USER_KEY="user_key_generated_by_bpjs"
BPJS_BASE_URL="https://apijkn-dev.bpjs-kesehatan.go.id/vclaim-rest-dev"
BPJS_ANTREAN_URL="https://apijkn-dev.bpjs-kesehatan.go.id/antreanrs_dev"
BPJS_PPK_CODE="0123R001" # Kode Faskes BPJS

# ==============================================================================
# KEMENKES SATUSEHAT (HL7 FHIR R4)
# ==============================================================================
SATUSEHAT_ENV="staging" # staging | production
SATUSEHAT_AUTH_URL="https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1"
SATUSEHAT_FHIR_URL="https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1"
SATUSEHAT_CLIENT_ID="your_satusehat_client_id"
SATUSEHAT_CLIENT_SECRET="your_satusehat_client_secret"
SATUSEHAT_ORGANIZATION_ID="10000004" # ID Faskes dari DTO Kemenkes

# ==============================================================================
# CLINICAL SETTINGS & MEDICAL RECORD LOCKING
# ==============================================================================
MR_LOCK_AFTER_HOURS=24 # Waktu otomatis terkunci (jam)
ENABLE_TTE_SIGNING=false # True jika menggunakan BSrE / Privy
```

---

## ⚡ Pola Asynchronous Background Worker

Pola pengiriman data ke pihak ketiga (BPJS & SATUSEHAT):

1. **Simpan Cepat di Database Lokal:**
   * Saat dokter klik `[Selesai & Simpan]`, data pasien, status kunjungan, SOAP, TTV, dan resep langsung di-*commit* ke PostgreSQL lokal dalam **1 transaksi ACID**.
   * Respon HTTP `200 OK` langsung dikembalikan ke browser dokter (`< 250ms`).
2. **Push Job ke Queue:**
   * Bersamaan dengan itu, job dikirim ke Redis Queue: `queue:satusehat-sync` dan `queue:bpjs-sync`.
3. **Worker Processing:**
   * Worker memproses antrean secara terisolasi.
   * Jika sukses, field `sync_satusehat_status` diupdate menjadi `SUCCESS` beserta `satusehat_encounter_id`.
4. **Retry & Failover (DLQ):**
   * Jika API Kemenkes/BPJS *timeout* atau mengembalikan status `500/503`, BullMQ melakukan *exponential retry* (1m, 5m, 15m, 1 jam).
   * Petugas IT dapat memantau antrean gagal melalui dashboard BullMQ UI / Admin Monitor.
