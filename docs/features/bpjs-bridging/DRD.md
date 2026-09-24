# DRD — Bridging BPJS

- **Feature ID:** `bpjs-bridging`
- **Status:** `DISCOVERY`
- **Owner:** Belum ditetapkan
- **Tanggal dibuat / terakhir diperbarui:** 2026-09-22
- **Target rilis:** Belum ditetapkan

## Ringkasan untuk manusia

Fitur ini mencakup integrasi P-Care, V-Claim, dan Antrol. Koneksi nyata membawa risiko credential, data kesehatan, signature, perubahan status layanan, dan klaim finansial. UI atau mock yang tampak valid bukan bukti bahwa BPJS menerima transaksi.

## Scope

- **Termasuk:** Eligibility peserta, SEP, antrean, adapter/signature, error mapping, mock mode, dan UI result state.
- **Tidak termasuk:** Menganggap provider live aktif tanpa sandbox/credential/whitelist yang diverifikasi.
- **Batas FE/BE:** FE menampilkan result kontrak dan mode lingkungan; BE mengelola auth, signature, request, retry, idempotensi, redaksi, dan audit.
- **Data/safety/integration impact:** Sangat tinggi; credential dan identitas peserta dilarang masuk source/evidence.

## Sumber dan keputusan

| ID | Jenis | Sumber yang dapat diperiksa | Ringkasan fakta/keputusan | Status |
| --- | --- | --- | --- | --- |
| `SRC-001` | Contract | `docs/BPJS_BRIDGING.md` | Kontrak/kriptografi bridging BPJS. | Needs official verification |
| `SRC-002` | Contract | `docs/API_CONTRACT.md` | Kontrak API RME untuk peserta, task antrean, dan sync. | Needs implementation review |
| `SRC-003` | Historical record | `docs/evidence/2026-09-22-bpjs-pcare-vclaim-integration.md` | Claim mock/adapter historis; tidak membuktikan provider live. | Needs review |
| `SRC-004` | Policy | `docs/GOVERNANCE.md` | Integrasi membutuhkan verification signature/auth/retry/idempotensi dan evidence ter-redaksi. | Confirmed |
| `SRC-005` | Source audit | `src/lib/bpjs/pcare-service.ts`, `src/lib/bpjs/vclaim-service.ts`, `src/server/integrations/bpjs/bpjs-http-client.ts` | Service P-Care/V-Claim memakai mock; HTTP client dapat mengembalikan respons sukses simulasi setelah kegagalan provider. | Confirmed |

## Requirements dan acceptance criteria

| Requirement | Owner | Hasil yang dapat diamati | Metode bukti wajib | Status |
| --- | --- | --- | --- | --- |
| `REQ-001` | BE | Adapter membedakan mode mock, sandbox, dan live; tidak fallback diam-diam menjadi sukses. | Unit/contract test dan konfigurasi ter-redaksi. | OPEN |
| `REQ-002` | BE | Request peserta/SEP/antrean tervalidasi, berotorisasi, dapat diretry/idempotent bila write, dan diaudit. | Request/response/error/auth/retry test. | OPEN |
| `REQ-003` | FE | UI menampilkan environment dan hasil error/sukses nyata tanpa mengklaim provider live pada mock. | Browser + controlled API response test. | OPEN |
| `REQ-004` | FE+BE | Tidak ada credential, NIK, nomor kartu, SEP, atau data peserta realistis dalam source, fixture, log, maupun evidence. | Secret/PII scan + fixture review. | OPEN |

## Keputusan, asumsi, dan blocker

| ID | Jenis | Pernyataan | Dampak | Pemilik keputusan | Status |
| --- | --- | --- | --- | --- | --- |
| `BLOCKER-001` | Blocker | Credential, whitelist, dan sandbox provider yang terverifikasi belum tercatat di DRD. | Tidak boleh mengklaim `live` atau `integrated`. | Integration owner | Open |
| `BLOCKER-002` | Blocker | Test runner/contract harness belum dibuktikan di repository. | Tidak dapat memvalidasi adapter atau error contract. | BE owner | Open |
| `BLOCKER-003` | Blocker | Mode provider tidak fail-closed: kegagalan HTTP dapat berubah menjadi respons `200` simulasi; beberapa UI juga memakai service mock langsung. | Risiko UI menyatakan BPJS aktif/SEP terbit padahal tidak ada penerimaan provider. Semua claim bridging harus tetap `DISCOVERY`. | Integration owner | Open |
| `BLOCKER-004` | Blocker | Fixture/source mengandung nilai yang menyerupai identifier peserta dan credential. | Harus diinventarisasi, dipastikan sintetis, lalu diganti/di-redaksi sebelum evidence scan dapat PASS. | Security owner | Open |
| `ASSUMPTION-001` | Assumption | Deterministic mock boleh dipakai untuk development. | Wajib terlihat sebagai mock dan hanya membuktikan contract mock. | Product owner | Pending |

## Kontrak dan desain

- **API/data contract:** `docs/API_CONTRACT.md`, `docs/BPJS_BRIDGING.md`, dan sumber resmi provider yang terversi.
- **Authorization/audit:** BE wajib; FE tidak menjadi batas keamanan.
- **UI/accessibility:** Tampilan hasil harus menyatakan mode provider dan error yang dapat ditindaklanjuti.
- **ADR yang diperlukan:** Ya, untuk provider mode, credential boundary, retry/idempotensi, atau lifecycle baru.
- **Migrations/recovery:** Audit/retry records perlu ditentukan sebelum write live.

## Evidence ledger

| Evidence ID | Requirement | Metode / perintah tepat | Input ter-redaksi | Expected | Actual | Status | Pelaksana & waktu |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `EV-001` | `REQ-001` | Test adapter mode belum tersedia. | Tidak ada credential nyata. | Mock/sandbox/live terpisah dan teruji. | Belum ada test yang direkam di DRD. | NOT AVAILABLE | Codex, 2026-09-22 |
| `EV-002` | `REQ-004` | Audit source 2026-09-22: review `mock-bpjs-data`, `data-store`, dan konfigurasi fallback. | Tidak ada nilai disalin ke DRD. | Tidak ada identifier/credential sensitif atau semuanya terbukti sintetis dan aman. | Ditemukan nilai credential-like dan data peserta-like; asal/sintetisnya belum dibuktikan serta belum ada secret/PII scan formal. | FAIL | Codex, 2026-09-22 |

## Release checklist

- [ ] Provider mode dan credential boundary disetujui melalui ADR.
- [ ] Contract/auth/error/retry/idempotency tests PASS.
- [ ] Scan data sensitif PASS.
- [ ] UI menyatakan mode provider dengan jujur.
- [ ] Sandbox/live evidence ter-redaksi tersedia bila provider live diklaim.

## Changelog

| Tanggal | Perubahan | Oleh |
| --- | --- | --- |
| 2026-09-22 | DRD discovery dibuat; evidence historis tidak diangkat sebagai bukti live. | Codex |
| 2026-09-22 | Audit rencana pendaftaran menambahkan blocker fail-open dan data/secret-like. | Codex |
