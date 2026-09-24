# DRD — Sistem UI

- **Feature ID:** `ui-system`
- **Status:** `DISCOVERY`
- **Owner:** Frontend maintainer
- **Tanggal dibuat / terakhir diperbarui:** 2026-09-22
- **Target rilis:** Belum ditentukan

## Ringkasan untuk manusia

Katalog Sistem UI adalah referensi komponen bersama RME. Dokumen ini akan memastikan komponen katalog benar-benar sama dengan komponen produksi, token mode terang/gelap konsisten, dan state interaktif dapat diuji tanpa mengandalkan kesan visual semata.

## Scope

- **Termasuk:** Token desain, komponen shared, catalogue preview, mode terang/gelap, dan state aksesibilitas komponen.
- **Tidak termasuk:** Mengubah aturan klinis atau mengesahkan alur pasien.
- **Batas FE/BE:** Implementasi utama berada pada FE; BE hanya menyediakan kontrak bila katalog memerlukan data nyata.
- **Data/safety/integration impact:** Tidak ada data pasien atau klaim integrasi di katalog.

## Sumber dan keputusan

| ID | Jenis | Sumber yang dapat diperiksa | Ringkasan fakta/keputusan | Status |
| --- | --- | --- | --- | --- |
| `SRC-001` | User requirement | Percakapan proyek | Semua komponen Sistem UI harus menjadi referensi yang konsisten dan tidak terlihat seperti implementasi terpisah. | Confirmed |
| `SRC-002` | Historical record | `docs/evidence/2026-09-21-ui-ux-clinical-redesign.md` | Catatan perubahan historis; tidak menjadi bukti acceptance feature ini. | Needs review |
| `SRC-003` | Policy | `docs/CODE_STANDARDS.md` | Preview wajib memakai komponen produksi dan token shared. | Confirmed |

## Requirements dan acceptance criteria

| Requirement | Owner | Hasil yang dapat diamati | Metode bukti wajib | Status |
| --- | --- | --- | --- | --- |
| `REQ-001` | FE | Katalog memakai komponen shared, bukan markup varian yang diduplikasi. | Pemetaan source import dan review komponen. | OPEN |
| `REQ-002` | FE | Token warna, typography, spacing, focus, dan states konsisten pada mode terang/gelap. | Test/browser matrix dengan viewport dan state tercatat. | OPEN |
| `REQ-003` | FE | Controls (toggle, checkbox, graph, dialog, button) memiliki state dan nama aksesibel yang dapat diuji. | Test interaksi + keyboard/focus + state error/loading/disabled bila relevan. | OPEN |

## Keputusan, asumsi, dan blocker

| ID | Jenis | Pernyataan | Dampak | Pemilik keputusan | Status |
| --- | --- | --- | --- | --- | --- |
| `DEC-001` | Decision | Katalog adalah consumer komponen produksi, bukan tempat membuat varian UI kedua. | Mengurangi visual drift. | Repository maintainers | Accepted |
| `BLOCKER-001` | Blocker | Baseline visual dan test interaktif yang diterima belum dicatat untuk seluruh komponen. | Tidak dapat mengklaim konsistensi atau aksesibilitas. | Frontend maintainer | Open |

## Kontrak dan desain

- **API/data contract:** Belum ada kebutuhan kontrak baru.
- **Authorization/audit:** Tidak berlaku kecuali katalog mulai memakai data domain.
- **UI/accessibility:** Wajib mengikuti `docs/CODE_STANDARDS.md` dan matriks FE pada workflow.
- **ADR yang diperlukan:** Belum; perubahan routing/navigation atau boundary komponen harus dinilai terhadap ADR 0001.
- **Migrations/recovery:** Tidak berlaku.

## Evidence ledger

| Evidence ID | Requirement | Metode / perintah tepat | Input atau fixture ter-redaksi | Hasil yang diharapkan | Hasil aktual | Status | Pelaksana & waktu |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `EV-001` | `REQ-001` | Audit import katalog terhadap atoms/molecules/organisms. | Tidak ada data sensitif. | Semua preview menunjuk komponen yang sama dengan consumer produksi. | Belum dijalankan. | NOT AVAILABLE | — |
| `EV-002` | `REQ-002`, `REQ-003` | Jalankan test FE dan browser matrix yang dicatat di DRD. | Data sintetis saja. | Mode terang/gelap dan seluruh state target lulus. | Test suite/baseline belum ditentukan. | NOT AVAILABLE | — |

## Release checklist

- [ ] Baseline komponen dan token disetujui.
- [ ] TODO FE memiliki requirement/evidence untuk semua perubahan.
- [ ] Bukti visual, keyboard, dan accessibility direkam.
- [ ] Tidak ada claim konsistensi tanpa evidence.

## Changelog

| Tanggal | Perubahan | Oleh |
| --- | --- | --- |
| 2026-09-22 | DRD discovery dibuat dari area UI System historis. | Codex |
