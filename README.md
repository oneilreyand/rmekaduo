# Sistem Rekam Medis Elektronik (RME) Terintegrasi

[![Standard: Permenkes 24/2022](https://img.shields.io/badge/Kemenkes-Permenkes%2024%2F2022-blue.svg)](https://kemkes.go.id)
[![Interoperability: SATUSEHAT HL7 FHIR R4](https://img.shields.io/badge/SATUSEHAT-HL7%20FHIR%20R4-emerald.svg)](https://satusehat.kemkes.go.id/platform)
[![Bridging: BPJS Kesehatan v2.0](https://img.shields.io/badge/BPJS-P--Care%20%7C%20V--Claim%20%7C%20Antrean%20v2-green.svg)](https://dvlp.bpjs-kesehatan.go.id)
[![Akreditasi: STARKES & LPA FKTP](https://img.shields.io/badge/Akreditasi-STARKES%20%7C%20LPA-orange.svg)](https://kemkes.go.id)

Sistem Rekam Medis Elektronik (RME) modern yang dirancang khusus untuk fasilitas pelayanan kesehatan (Klinik Pratama/Utama, Puskesmas, dan Rumah Sakit) di Indonesia. Berfokus pada kecepatan input klinis (*Low-Click & Keyboard-Driven UX*), keandalan proses latar belakang (*Asynchronous Background Sync*), dan kepatuhan mutlak terhadap regulasi nasional.

---

## 📸 Preview Layar Kerja Dokter (Single-Screen Consultation)

Layar terpadu tanpa popup bertumpuk, memungkinkan dokter menyelesaikan pemeriksaan 1 pasien dalam waktu < 2 menit:

![Layar Kerja Dokter](docs/assets/doctor_consultation_screen.jpg)

* **Sticky Patient Banner:** Ringkasan identitas pasien, status BPJS aktif, serta alert keselamatan pasien mencolok (**🔴 Alergi** dan **🟡 Risiko Jatuh**).
* **Panel Kiri (60%):** 1-Click Quick Macro template SOAP (ISPA, Hipertensi, Dispepsia), formulir CPPT, dan autocomplete ICD-10 & ICD-9-CM.
* **Panel Kanan (40%):** Tanda-tanda vital (TTV), skrining nyeri & jatuh, e-resep terintegrasi KFA dengan alert interaksi obat, serta riwayat kunjungan terdahulu.
* **Bottom Action Bar:** Status koneksi bridging BPJS & SATUSEHAT, panduan hotkeys keyboard (`Ctrl+S`, `Alt+R`), dan tombol aksi utama *Selesai & Simpan*.

---

## 📚 Developer Hub (Dev Hub)

Seluruh dokumentasi teknis, formula kriptografi BPJS, mapping FHIR SATUSEHAT, skema database, dan standar akreditasi telah dirangkum lengkap di direktori [`docs/`](./docs):

| Modul Dev Hub | Deskripsi |
| :--- | :--- |
| 📖 [**Dev Hub Portal**](./docs/DEV_HUB.md) | Pintu gerbang dokumentasi, daftar istilah, dan checklist rilis. |
| 📑 [**Kontrak API Backend (REST)**](./docs/API_CONTRACT.md) | Spesifikasi OpenAPI / REST resmi FE & BE untuk integrasi mandiri. |
| 🧩 [**Arsitektur Frontend**](./docs/FRONTEND_ARCHITECTURE.md) | Struktur Atomic Design, batas komponen, dan routing satu halaman. |
| 🤖 [**Alur Kerja AI**](./docs/AI_WORKFLOW.md) | Standar evidence-based untuk agen yang mengubah proyek. |
| 🏗️ [**Arsitektur & Tech Stack**](./docs/ARCHITECTURE_AND_STACK.md) | Blueprint sistem, alur async queue, struktur folder, & env vars. |
| 🎨 [**UI/UX Design System**](./docs/UI_UX_DESIGN_SYSTEM.md) | Standar klinis, palet warna keselamatan pasien, grid layout, & hotkeys. |
| 🗄️ [**Skema Database & DDL**](./docs/DATABASE_SCHEMA.md) | PostgreSQL DDL, JSONB FHIR, audit trail immutable, & pg_trgm search. |
| 🛡️ [**Bridging BPJS Kesehatan**](./docs/BPJS_BRIDGING.md) | Formula HMAC-SHA256 signature, decrypt AES-256-CBC + LZ-String, & Antrean V2 Task 1–7. |
| 🏥 [**Bridging SATUSEHAT (FHIR R4)**](./docs/SATUSEHAT_FHIR.md) | OAuth2 Kemenkes, lookup IHS NIK, dan bundle transformer FHIR R4. |
| ⚖️ [**Kepatuhan Akreditasi (STARKES)**](./docs/STARKES_COMPLIANCE.md) | Medical record locking (1x24 jam), sistem addendum, audit log, & skrining risiko. |

---

## ⚡ Fitur Utama

1. **Ergonomi Klinis Berkecepatan Tinggi:**
   * Single-Screen Consultation: Mengeliminasi *click fatigue* dokter.
   * Macro & Template SOAP cerdas per diagnosis keluhan umum.
   * Full keyboard navigation & hotkeys (`Ctrl+S`, `Alt+R`, `Tab`/`Enter` flow).
   * Fuzzy search ICD-10 dan KFA Kemenkes dengan latensi < 50ms.
2. **Kepatuhan Regulasi & Interoperabilitas:**
   * **Permenkes 24/2022:** Pencatatan CPPT terstruktur, tanda tangan elektronik (TTE), dan resume medis.
   * **Kemenkes SATUSEHAT:** Standar HL7 FHIR R4 (`Encounter`, `Condition`, `Observation`, `Procedure`, `MedicationRequest`).
   * **BPJS Kesehatan:** P-Care / V-Claim bridging, cek kepesertaan, serta Antrean Online V2.
   * **Standar Akreditasi (STARKES / LPA):** Penguncian otomatis 1x24 jam, sistem catatan ralat (Addendum), dan log audit jejak digital lengkap.
3. **Resilience & Background Jobs:**
   * UI dokter tidak pernah diblokir saat pengiriman data ke Kemenkes/BPJS (menggunakan queue Redis/BullMQ).
   * *Graceful degradation* jika server BPJS/Kemenkes sedang down (antrean otomatis di-retry).

---

## 🚀 Quick Start (Development)

Pastikan sistem Anda telah terpasang:
* **Node.js:** v20+ atau v24+
* **PostgreSQL:** v15+ (dengan ekstensi `pg_trgm`)
* **Redis:** v7+

```bash
# Clone repositori
git clone https://github.com/your-org/RME.git
cd RME

# Salin berkas konfigurasi environment
cp .env.example .env

# Pasang dependensi
npm install

# Jalankan migrasi database
npm run db:migrate

# Jalankan server lokal
npm run dev
```

---

## 📄 Lisensi & Kepatuhan Data

Data pasien dilindungi berdasarkan **UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP)** dan **Peraturan Pemerintah tentang Penyelenggaraan Sistem dan Transaksi Elektronik (PP PSTE)**. Server basis data wajib di-hosting di dalam wilayah Negara Kesatuan Republik Indonesia (NKRI).
