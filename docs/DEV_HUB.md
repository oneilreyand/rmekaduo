# 🩺 Developer Hub (Dev Hub) - Sistem Rekam Medis Elektronik (RME)

Selamat datang di **Developer Hub RME**. Dokumentasi ini dirancang sebagai panduan komprehensif bagi software engineer, UI/UX designer, DevOps, dan AI agent dalam mengembangkan, memelihara, serta mengintegrasikan sistem RME sesuai regulasi medis Indonesia.

---

## 🗺️ Peta Navigasi Dokumentasi

```
docs/
├── DEV_HUB.md                     <-- (Anda di sini) Indeks Utama & Roadmap
├── GOVERNANCE.md                  <-- Aturan kerja, evidence, ADR, dan quality gate agen
├── FEATURE_WORKFLOW.md            <-- Satu alur DRD, TODO FE/BE, status, dan evidence ledger
├── CODE_STANDARDS.md              <-- Aturan penulisan kode dan update dokumentasi
├── SDLC_KNOWLEDGE_MAP.md          <-- Peta sumber, jalur baca per peran, dan traceability delivery
├── SDLC_GAP_ASSESSMENT.md         <-- Perbandingan SDLC RME–Qlickhub dan gap yang belum diputuskan
├── SDLC_WORKFLOW_AND_ROLES.md     <-- Tanggung jawab delivery, handoff, dan keputusan rilis
├── QA_TRACEABILITY.md             <-- Test case, defect/retest, dan tautan evidence DRD
├── DEPLOYMENT_AND_ENVIRONMENTS.md <-- Environment, release preflight, dan recovery record
├── INCIDENT_AND_HOTFIX.md         <-- Triage insiden, hotfix, dan follow-up aman
├── POLICY_REGISTRY.md             <-- ID policy yang menunjuk sumber kanonik
├── features/                      <-- Satu folder per fitur (DRD.md + fe/TODO.md + be/TODO.md)
├── API_CONTRACT.md                <-- Kontrak RESTful API Resmi FE & BE (OpenAPI Ready)
├── ARCHITECTURE_AND_STACK.md      <-- Blueprint Arsitektur, Async Queue, & Struktur Folder
├── UI_UX_DESIGN_SYSTEM.md         <-- Design Tokens, Clinical Layout, & Keyboard Hotkeys
├── DATABASE_SCHEMA.md             <-- PostgreSQL DDL, JSONB FHIR, Audit Trail, & pg_trgm
├── BPJS_BRIDGING.md               <-- HMAC-SHA256, AES-256-CBC, LZ-String, & Antrean V2
├── BPJS_ANTROL_MJKN_INTEGRATION.md <-- Webhook MJKN, Auto-Matching Pasien, & 4-Way Multi-Sistem Sync
├── SATUSEHAT_FHIR.md              <-- OAuth2 Kemenkes, IHS Lookup, & FHIR R4 Bundles
└── STARKES_COMPLIANCE.md          <-- 1x24h Locking, Addendum, Audit Log, & Skrining Pasien
```

## Cara memulai pekerjaan fitur

Sebelum mengubah kode, buka [Peta Pengetahuan SDLC](SDLC_KNOWLEDGE_MAP.md), lalu [Sistem Kerja Fitur](FEATURE_WORKFLOW.md). Pilih atau buat folder di [Registry Fitur](features/README.md), lalu lengkapi `DRD.md` sampai status `READY`. Gunakan `fe/TODO.md` dan `be/TODO.md` untuk membagi pekerjaan tanpa memecah kebutuhan atau bukti. Bukti aktual selalu dicatat pada Evidence ledger di DRD.

Untuk QA/release, ikuti [Delivery Workflow and Roles](SDLC_WORKFLOW_AND_ROLES.md), [QA Traceability](QA_TRACEABILITY.md), serta [Deployment and Environments](DEPLOYMENT_AND_ENVIRONMENTS.md). Untuk insiden atau hotfix, mulai dari [Incident and Hotfix](INCIDENT_AND_HOTFIX.md). [Audit Kesenjangan SDLC](SDLC_GAP_ASSESSMENT.md) tetap mencatat batas operasional yang belum dapat diklaim.

---

## 🎯 Standar Regulasi & Sertifikasi

| Regulasi / Standar | Instansi / Acuan | Komponen yang Terdampak |
| :--- | :--- | :--- |
| **Permenkes No. 24 Th 2022** | Kementerian Kesehatan RI | Kewajiban RME seluruh faskes, rekam medis terstandar, TTE, dan pelepasan data. |
| **HL7 FHIR Release 4** | Kemenkes SATUSEHAT | Interoperabilitas data klinis nasional (`Encounter`, `Condition`, `Observation`, dll). |
| **P-Care / V-Claim v2.0** | BPJS Kesehatan | Verifikasi kepesertaan, pembuatan SEP/kunjungan, dan rujukan antar faskes. |
| **Antrean Online BPJS v2** | BPJS Kesehatan | Task ID 1 sampai 7 (sinkronisasi waktu layanan dari pendaftaran hingga obat). |
| **STARKES / LPA FKTP** | Kemenkes / Lembaga Akreditasi | Keselamatan pasien (skrining jatuh/nyeri/alergi), audit trail, dan *medical record locking*. |
| **UU No. 27 Th 2022 (UU PDP)** | Pemerintah RI / Kominfo | Perlindungan data pribadi medis, enkripsi at rest/in transit, server lokal di NKRI. |

---

## 📋 Glosarium Istilah Medis & Teknis

* **CPPT:** *Catatan Perkembangan Pasien Terintegrasi* — lembar rekam medis format SOAP yang diisi oleh dokter, perawat, apoteker, dan nakes lain secara kolaboratif.
* **SOAP:** Format standar pengkajian klinis:
  * **S (Subjective):** Keluhan utama, riwayat penyakit sekarang (RPS), riwayat alergi.
  * **O (Objective):** Pemeriksaan fisik, tanda vital (TTV), status lokalis, hasil lab/penunjang.
  * **A (Assessment):** Diagnosa kerja / banding (kode ICD-10).
  * **P (Plan):** Rencana terapi, e-resep, tindakan medis (ICD-9-CM), edukasi pasien, atau rujukan.
* **IHS (Indonesia Health Services):** Nomor pengenal tunggal yang diterbitkan SATUSEHAT untuk Pasien (*IHS Patient*), Dokter/Nakes (*IHS Practitioner*), dan Organisasi Faskes (*Organization ID*).
* **KFA (Kamus Farmasi & Alat Kesehatan):** Standar master data obat dan alkes nasional yang dikelola oleh Kemenkes RI.
* **SEP (Surat Eligibilitas Peserta):** Surat izin penjaminan klaim perawatan yang diterbitkan oleh sistem BPJS Kesehatan.
* **Addendum:** Catatan pembetulan resmi pada rekam medis yang telah terkunci, tanpa mengubah/menghapus rekam data sebelumnya.
* **Cons-ID & User-Key:** Kredensial autentikasi API Bridging yang diberikan oleh BPJS Kesehatan untuk setiap faskes.

---

## 🚀 Alur Kerja Pasien (Patient Journey Lifecycle)

```mermaid
sequenceDiagram
    autonumber
    actor P as Pasien
    participant ADM as Admisi / Pendaftaran
    participant BPJS as BPJS Kesehatan
    participant POLI as Ruang Periksa (Dokter)
    participant Q as Redis Queue / Worker
    participant SATU as Kemenkes SATUSEHAT
    participant FAR as Farmasi / Kasir

    P->>ADM: Datang / Check-in Mandiri (Antrean)
    ADM->>BPJS: Update Task 1 & 2 + Validasi NIK/Kartu
    ADM->>POLI: Pasien Menuju Ruang Tunggu Poli (Task 3)
    
    POLI->>POLI: Dokter Panggil Pasien (Task 4 Dimulai)
    Note over POLI: Dokter Input SOAP, TTV, ICD-10, E-Resep (Single-Screen)
    POLI->>POLI: Dokter Klik "Selesai Periksa" (Task 4 Selesai)
    
    POLI->>Q: Dispatch Async Sync Job (Non-blocking)
    par Simpan & Resep
        POLI->>FAR: Notifikasi Resep Masuk (Task 5)
    and Background Worker
        Q->>BPJS: Kirim Kunjungan & Update Task 4
        Q->>SATU: Kirim FHIR Bundle (Encounter, Obs, Cond, Med)
    end

    FAR->>FAR: Penyiapan & Peracikan Obat (Task 6)
    FAR->>P: Penyerahan Obat & Edukasi (Task 7)
    FAR->>BPJS: Update Task 7 (Pelayanan Selesai)
```

---

## 🛠️ Checklist Developer Sebelum Go-Live

- [ ] **Kriptografi BPJS:** Unit test formula signature HMAC-SHA256 dan dekripsi AES-256-CBC lulus 100%.
- [ ] **SATUSEHAT Token Cache:** Token OAuth2 di-cache di Redis/memory dengan TTL 3500 detik (tidak request token baru di setiap transaksi).
- [ ] **Asynchronous Processing:** Tidak ada panggilan API luar (BPJS/SATUSEHAT) yang memblokir render UI dokter (latensi klik simpan `< 300ms`).
- [ ] **Audit Trail:** Trigger database atau middleware berhasil mencatat user, IP, action, timestamp, dan perubahan data.
- [ ] **Medical Record Locking:** Cron job / status check mengunci berkas SOAP yang telah berumur `> 24 jam`.
- [ ] **Fuzzy Search Index:** Ekstensi `pg_trgm` aktif pada tabel ICD-10 dan KFA dengan indeks GIN.
