# DRD — Alur Perjalanan Pasien

- **Feature ID:** `patient-journey`
- **Status:** `DISCOVERY`
- **Owner:** Belum ditetapkan
- **Tanggal dibuat / terakhir diperbarui:** 2026-09-22
- **Target rilis:** Belum ditetapkan

## Ringkasan untuk manusia

Fitur ini mengatur perpindahan pasien dari admisi sampai penyelesaian pelayanan. Karena setiap perpindahan dapat menyentuh data klinis, antrean, dan integrasi, perilaku tidak boleh disimpulkan dari state UI atau mock.

## Scope

- **Termasuk:** Admisi, antrean, triase, konsultasi, farmasi/kasir, state transaksi, safety cue, dan batas FE/BE.
- **Tidak termasuk:** Pengesahan regulasi, integrasi BPJS/SATUSEHAT, atau record locking sampai requirement dan evidence khusus disetujui.
- **Batas FE/BE:** FE merender state dari kontrak; BE menentukan transition, authorization, audit, dan persistence.
- **Data/safety/integration impact:** Tinggi; semua contoh harus sintetis/ter-redaksi.

## Sumber dan keputusan

| ID | Jenis | Sumber yang dapat diperiksa | Ringkasan fakta/keputusan | Status |
| --- | --- | --- | --- | --- |
| `SRC-001` | Domain | `docs/DEV_HUB.md` | Dev Hub mendeskripsikan journey dari admisi sampai farmasi. | Confirmed |
| `SRC-002` | Policy | `docs/GOVERNANCE.md` | Workflow klinis memerlukan authorization, safety, audit, record lifecycle, dan evidence. | Confirmed |
| `SRC-003` | Historical record | `docs/evidence/2026-09-22-patient-journey-lifecycle.md` | Claim implementasi historis; bukan bukti validasi yang diterima oleh DRD ini. | Needs review |

## Requirements dan acceptance criteria

| Requirement | Owner | Hasil yang dapat diamati | Metode bukti wajib | Status |
| --- | --- | --- | --- | --- |
| `REQ-001` | FE+BE | Transition status pasien hanya terjadi melalui kontrak yang tervalidasi dan berotorisasi. | API/service tests untuk valid/invalid/unauthorized transition. | OPEN |
| `REQ-002` | FE | UI membedakan state loading, error, local demo, dan hasil backend nyata. | Browser desktop/mobile + accessibility evidence. | OPEN |
| `REQ-003` | BE | Perubahan rekam/encounter memiliki audit event dan lifecycle yang dapat ditelusuri. | Persistence/audit test dengan fixture sintetis. | OPEN |
| `REQ-004` | FE+BE | Safety cue alergi, risiko jatuh, dan nyeri berbasis data terotorisasi serta tidak hanya warna. | UI + contract test. | OPEN |

## Keputusan, asumsi, dan blocker

| ID | Jenis | Pernyataan | Dampak | Pemilik keputusan | Status |
| --- | --- | --- | --- | --- | --- |
| `ASSUMPTION-001` | Assumption | State React in-memory dapat dipakai untuk demo visual. | Tidak boleh diklaim sebagai persistensi, audit, atau completion klinis. | Product owner | Pending |
| `BLOCKER-001` | Blocker | Belum ada suite test/contract evidence yang membuktikan transition, otorisasi, dan audit. | Fitur tidak boleh berstatus `VALIDATED`. | BE owner | Open |

## Kontrak dan desain

- **API/data contract:** `docs/API_CONTRACT.md` perlu direkonsiliasi per transition.
- **Authorization/audit:** Wajib ditentukan sebelum state clinical/persisten diaktifkan.
- **UI/accessibility:** `docs/UI_UX_DESIGN_SYSTEM.md` dan `docs/FRONTEND_ARCHITECTURE.md`.
- **ADR yang diperlukan:** Ya, bila state/navigation/persistence lifecycle berubah dari ADR yang diterima.
- **Migrations/recovery:** Belum ditentukan; blocker untuk persistence.

## Evidence ledger

| Evidence ID | Requirement | Metode / perintah tepat | Input ter-redaksi | Expected | Actual | Status | Pelaksana & waktu |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `EV-001` | `REQ-001` | Contract test transition belum tersedia. | Fixture pasien sintetis. | Valid/invalid/unauthorized transition dibuktikan. | Tidak ada suite test yang teridentifikasi. | NOT AVAILABLE | Codex, 2026-09-22 |
| `EV-002` | `REQ-002` | Browser check setelah testable state tersedia. | Data sintetis. | State UI dapat dibedakan. | Belum dijalankan sebagai evidence DRD. | PLANNED | — |

## Release checklist

- [ ] Kontrak transition disetujui.
- [ ] TODO FE/BE selesai dan evidence PASS.
- [ ] Audit/authorization/lifecycle dibuktikan.
- [ ] UI demo tidak menyamar sebagai hasil klinis atau integrasi.

## Changelog

| Tanggal | Perubahan | Oleh |
| --- | --- | --- |
| 2026-09-22 | DRD discovery dibuat dari dokumen domain dan evidence historis. | Codex |

