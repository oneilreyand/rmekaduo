# DRD — Tampilan TV Antrean

- **Feature ID:** `queue-display-tv`
- **Status:** `DISCOVERY`
- **Owner:** Frontend dan backend maintainers
- **Tanggal dibuat / terakhir diperbarui:** 2026-09-22
- **Target rilis:** Belum ditentukan

## Ringkasan untuk manusia

Tampilan TV antrean harus menyajikan nomor dan panggilan dengan jelas tanpa membocorkan data pasien. Fitur ini belum dianggap tersambung ke sumber antrean sampai kontrak data, refresh, error state, dan bukti tampilannya tervalidasi.

## Scope

- **Termasuk:** Tampilan antrean publik, kontrak data yang aman, refresh, loading/empty/error state, aksesibilitas, dan batas privasi.
- **Tidak termasuk:** Pembaruan klinis, autentikasi petugas, atau claim integrasi eksternal.
- **Batas FE/BE:** FE merender state publik; BE menentukan data minimal, otorisasi sumber, dan audit/publish behavior.
- **Data/safety/integration impact:** Tidak boleh menampilkan identitas pasien atau data klinis.

## Sumber dan keputusan

| ID | Jenis | Sumber yang dapat diperiksa | Ringkasan fakta/keputusan | Status |
| --- | --- | --- | --- | --- |
| `SRC-001` | User expectation | Percakapan proyek | TV antrean merupakan bagian aplikasi dan harus mengikuti standar UI yang konsisten. | Confirmed |
| `SRC-002` | Historical record | `docs/evidence/2026-09-22-tv-antrean-enhancement.md` | Catatan UI historis; bukan bukti sumber antrean atau privasi yang diterima. | Needs review |
| `SRC-003` | Policy | `AGENTS.md` | Data pasien nyata tidak boleh muncul di source, fixture, bukti, atau tampilan publik. | Confirmed |

## Requirements dan acceptance criteria

| Requirement | Owner | Hasil yang dapat diamati | Metode bukti wajib | Status |
| --- | --- | --- | --- | --- |
| `REQ-001` | BE | Kontrak hanya mengirim data publik minimum dan tidak mengandung identitas/data klinis. | Contract test dengan fixture sintetis dan review payload. | OPEN |
| `REQ-002` | FE | TV memiliki state loading, empty, error, dan reconnect yang jelas tanpa nomor panggilan palsu. | Test interaktif/browser matrix. | OPEN |
| `REQ-003` | FE+BE | Nomor/panggilan yang ditampilkan dapat dilacak ke event sumber secara aman dan ter-redaksi. | Integration test/mode record dan audit review. | OPEN |

## Keputusan, asumsi, dan blocker

| ID | Jenis | Pernyataan | Dampak | Pemilik keputusan | Status |
| --- | --- | --- | --- | --- | --- |
| `ASSUMPTION-001` | Assumption | Tampilan dapat memakai polling atau push update. | Memengaruhi kontrak dan failure/retry; perlu keputusan teknis. | Backend maintainer | Open |
| `BLOCKER-001` | Blocker | Kontrak antrean publik dan lingkungan integration test belum diterima. | Tidak dapat mengklaim data live, refresh, atau audit trail. | Product + backend maintainers | Open |

## Kontrak dan desain

- **API/data contract:** Harus ditulis dan diputuskan sebelum implementasi data nyata.
- **Authorization/audit:** Publish/publish event dan akses sumber harus terotorisasi serta dapat diaudit.
- **UI/accessibility:** Keterbacaan jarak jauh, kontras, state failure, dan label status harus dibuktikan.
- **ADR yang diperlukan:** Ya bila memilih transport push/polling atau mengubah batas data publik.
- **Migrations/recovery:** Tentukan retry/recovery tanpa mengubah status antrean secara tidak sah.

## Evidence ledger

| Evidence ID | Requirement | Metode / perintah tepat | Input atau fixture ter-redaksi | Hasil yang diharapkan | Hasil aktual | Status | Pelaksana & waktu |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `EV-001` | `REQ-001` | Contract test endpoint/event antrean publik. | Fixture nomor sintetis, tanpa identitas pasien. | Payload tervalidasi dan field terlarang ditolak/tidak terkirim. | Contract test belum tersedia. | NOT AVAILABLE | — |
| `EV-002` | `REQ-002` | Browser test dengan state loading, empty, error, reconnect. | Data sintetis. | Semua state terbaca pada viewport TV yang didefinisikan. | Test/browser matrix belum tersedia. | NOT AVAILABLE | — |
| `EV-003` | `REQ-003` | Integration test pada environment yang disetujui. | Event ter-redaksi dan correlation ID. | Event sumber, render, dan audit dapat dicocokkan. | Environment belum tersedia. | NOT AVAILABLE | — |

## Release checklist

- [ ] Kontrak data publik disetujui.
- [ ] Batas privasi dan audit event diuji.
- [ ] Semua UI state dan keterbacaan TV dibuktikan.
- [ ] ADR transport/batas publik tersedia jika diperlukan.

## Changelog

| Tanggal | Perubahan | Oleh |
| --- | --- | --- |
| 2026-09-22 | DRD discovery dibuat dari area TV antrean historis. | Codex |
