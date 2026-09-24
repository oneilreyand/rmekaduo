# DRD — Sistem Governance Fitur

- **Feature ID:** `feature-governance`
- **Status:** `BLOCKED`
- **Owner:** Repository maintainers
- **Tanggal dibuat / terakhir diperbarui:** 2026-09-24
- **Target rilis:** Baseline SDLC dokumentasi sebelum release workflow berikutnya

## Ringkasan untuk manusia

Tim membutuhkan satu cara kerja yang sama agar programmer dan model tidak membangun berdasarkan tebakan. Setiap fitur harus memiliki kebutuhan yang dapat diuji, pekerjaan FE dan BE yang jelas, serta bukti yang dapat diperiksa sebelum fitur dinyatakan siap.

## Scope

- **Termasuk:** Struktur folder fitur, DRD, TODO FE/BE, evidence ledger, aturan penulisan kode, aturan update dokumentasi, pembaruan entry-point governance, peta sumber SDLC, audit kesenjangan dokumentasi terhadap Qlickhub, baseline role delivery, QA traceability, release/environment, incident/hotfix, policy registry, handoff, CI quality check, dan database disposable untuk workflow CI.
- **Tidak termasuk:** Mengubah atau mengesahkan implementasi klinis, API, BPJS, SATUSEHAT, atau data yang sudah ada.
- **Batas FE/BE:** Dokumentasi FE dan BE dipisahkan per task, tetapi requirement dan evidence tetap satu di DRD.
- **Data/safety/integration impact:** Tidak ada perubahan runtime; standar baru memperketat cara perubahan tersebut didokumentasikan.

## Sumber dan keputusan

| ID | Jenis | Sumber yang dapat diperiksa | Ringkasan fakta/keputusan | Status |
| --- | --- | --- | --- | --- |
| `SRC-001` | User requirement | Percakapan 2026-09-22 | Satu dokumen fitur berbasis evidence dan test terukur, dengan DRD dan TODO FE/BE per folder. | Confirmed |
| `SRC-002` | Policy | `docs/GOVERNANCE.md` | Bukti harus reproducible; claim tidak boleh melebihi evidence. | Confirmed |
| `SRC-003` | Policy | `AGENTS.md` | Setiap perubahan substantive perlu evidence dan batas arsitektur harus dihormati. | Confirmed |
| `SRC-004` | User requirement | Percakapan 2026-09-24 | Bandingkan dokumentasi RME dengan Qlickhub dan buat dokumentasi yang menunjang proses SDLC RME. | Confirmed |
| `SRC-005` | User approval | Percakapan 2026-09-24 | Lanjutkan penyelesaian gap dokumentasi SDLC yang telah diaudit. | Confirmed |

## Requirements dan acceptance criteria

| Requirement | Owner | Hasil yang dapat diamati | Metode bukti wajib | Status |
| --- | --- | --- | --- | --- |
| `REQ-001` | FE+BE | Satu folder fitur memuat DRD, TODO FE, dan TODO BE yang terhubung. | Pemeriksaan struktur dan cross-link. | PASS |
| `REQ-002` | FE+BE | Requirement, assumption, decision, blocker, dan evidence memiliki ID serta status. | Review template dan workflow. | PASS |
| `REQ-003` | FE+BE | Aturan kode dan update dokumen dapat dibaca manusia serta dirujuk agent dari entry point. | Review `AGENTS.md`, Governance, dan links. | PASS |
| `REQ-004` | FE+BE | Fitur tidak dapat mengaku selesai tanpa bukti test yang sesuai. | Review policy matrix dan ledger rules. | PASS |
| `REQ-005` | FE+BE | Peta SDLC menunjukkan sumber kebenaran, artefak, jalur baca per peran, dan traceability RME tanpa membuat prosedur yang bersaing. | Review cross-link dan rekonsiliasi dengan Governance/Feature Workflow. | PASS |
| `REQ-006` | FE+BE | Audit membedakan kemampuan dokumentasi yang sudah ada, kesenjangan operasional yang belum terbukti, dan keputusan yang masih diperlukan untuk menyamai cakupan Qlickhub. | Review sumber RME dan Qlickhub; `npm run check:docs`. | PASS |
| `REQ-007` | FE+BE | Keputusan baseline delivery mendefinisikan tanggung jawab dokumentasi, QA traceability, release record, dan batas claim tanpa mengubah authorization aplikasi. | ADR dan rekonsiliasi dengan Governance/Feature Workflow. | PASS |
| `REQ-008` | FE+BE | Peran delivery, handoff, test case, defect/retest, dan release record dapat ditelusuri dari DRD tanpa membuat artefak runtime palsu. | Review template dan contoh field; `npm run check:docs`. | PASS |
| `REQ-009` | FE+BE | Runbook environment/release dan incident/hotfix membedakan environment yang terkonfigurasi dari yang belum dibuktikan. | Review runbook terhadap scripts/environment variables tanpa secret; `npm run check:docs`. | PASS |
| `REQ-010` | FE+BE | Policy registry menunjuk sumber kanonik, dan CI mendefinisikan pemeriksaan dokumentasi, tipe, build, serta test tanpa menyamakan test skip dengan pass. | Review workflow CI; `npm run check:docs`, `npx tsc --noEmit`, `npm run build`, `npm test`. | PASS |
| `REQ-011` | BE | Workflow CI menyediakan PostgreSQL disposable bernama `rme_test` untuk command test tanpa memakai data atau secret eksternal. | Review workflow dan hasil CI remote yang mencatat test pass/fail/skip. | BLOCKED |

## Keputusan, asumsi, dan blocker

| ID | Jenis | Pernyataan | Dampak | Pemilik keputusan | Status |
| --- | --- | --- | --- | --- | --- |
| `DEC-001` | Decision | `DRD.md` adalah sumber kebenaran tiap fitur; evidence dicatat di dalamnya. | Menghindari requirement dan hasil tersebar. | User | Accepted |
| `DEC-002` | Decision | TODO FE dan BE dipisah menurut pemilik lapisan, tetapi tiap task menunjuk requirement/evidence DRD. | Tanggung jawab jelas tanpa spesifikasi ganda. | User | Accepted |
| `BLOCKER-001` | Blocker | Eksekusi CI di GitHub, database test disposable, dan bukti environment release belum tersedia. | Workflow/repository lokal tidak boleh disamakan dengan enforcement remote, deployment, atau kesiapan rilis. | Repository maintainers | Open |
| `DEC-003` | Decision | Peta dan audit SDLC baru hanya mengindeks sumber dan mencatat gap; keduanya tidak menambah role, environment, release gate, atau klaim runtime baru. | Menghindari policy ganda dan klaim kesiapan yang belum terbukti. | Repository maintainers | Accepted |
| `DEC-004` | Decision | Baseline proses delivery disimpan sebagai dokumentasi repository dan template DRD; ia tidak mengubah RBAC aplikasi, tidak memilih platform deployment, dan tidak membuktikan environment eksternal. | Gap proses dapat ditutup tanpa mengarang kontrol runtime. | User / Repository maintainers | Accepted |
| `BLOCKER-002` | Blocker | Nama individu release owner, target deployment, serta sistem issue tracker belum diberikan. | Release nyata, deployment, atau sinkronisasi tracker tidak dapat dilakukan atau diklaim sampai pemilik menentukannya. | Product owner | Open |
| `BLOCKER-003` | Blocker | Workflow CI belum dieksekusi di GitHub pada perubahan ini. | Provisioning database dapat diverifikasi statis, tetapi hasil test database remote belum dapat diklaim. | Repository maintainers | Open |

## Kontrak dan desain

- **API/data contract:** Tidak berubah.
- **Authorization/audit:** Tidak berubah.
- **UI/accessibility:** Tidak berubah.
- **ADR yang diperlukan:** [ADR 0002](../../adr/0002-feature-drd-evidence-workflow.md), karena ini adalah quality gate dan workflow repository-wide.
- **Migrations/recovery:** Tidak ada.

## Evidence ledger

| Evidence ID | Requirement | Metode / perintah tepat | Input ter-redaksi | Expected | Actual | Status | Pelaksana & waktu |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `EV-001` | `REQ-001` | `npm run check:docs` | Tidak ada data sensitif | Setiap feature aktif memiliki DRD + TODO FE/BE dan tercatat di registry; tautan lokal valid. | `Feature documentation checked: 5 feature(s). Documentation links checked: 30.` | PASS | Codex, 2026-09-22 |
| `EV-002` | `REQ-002` | Review `docs/FEATURE_WORKFLOW.md` dan template. | Tidak ada data sensitif | Semua field ID dan lifecycle tersedia. | Template memuat `REQ`, `DEC`, `ASSUMPTION`, `BLOCKER`, dan `EV`. | PASS | Codex, 2026-09-22 |
| `EV-003` | `REQ-004` | Review validation/evidence clauses. | Tidak ada data sensitif | Status completion bergantung pada evidence terukur. | Workflow melarang claim bebas dan mengatur `NOT AVAILABLE`. | PASS | Codex, 2026-09-22 |
| `EV-004` | `REQ-003` | `rg -n "FEATURE_WORKFLOW.md|CODE_STANDARDS.md|docs/features/<feature-id>" AGENTS.md README.md docs/GOVERNANCE.md docs/AI_WORKFLOW.md docs/DEV_HUB.md` | Tidak ada data sensitif | Entry point utama merujuk workflow, standard, atau registry fitur. | Semua lima entry point merujuk sistem feature workflow; detail hasil tercatat pada validasi 2026-09-22. | PASS | Codex, 2026-09-22 |
| `EV-005` | `REQ-005` | `npm run check:docs` | Tidak ada data sensitif | Peta SDLC serta seluruh entry-point terkait memiliki tautan lokal dan struktur fitur tetap valid. | `Feature documentation checked: 8 feature(s). Documentation links checked: 84.` | PASS | Codex, 2026-09-24 |
| `EV-006` | `REQ-006` | Review `docs/SDLC_GAP_ASSESSMENT.md` terhadap sumber RME dan Qlickhub yang tercantum. | Tidak ada data sensitif atau konfigurasi environment | Setiap perbandingan menyebut sumber, status, dan batas claim; rekomendasi yang mengubah policy ditandai perlu keputusan. | Audit memetakan 12 area SDLC, menautkan artefak RME/Qlickhub yang diperiksa, dan memisahkan keputusan P0–P2 dari aturan aktif. | PASS | Codex, 2026-09-24 |
| `EV-007` | `REQ-007` | Review ADR baseline dan sumber kanonik yang ditautkan. | Tidak ada data sensitif | Keputusan tidak bertentangan dengan lifecycle/ADR dan jelas membatasi scope dokumentasi. | ADR 0006 mempertahankan Feature Workflow sebagai lifecycle kanonik, membatasi roles pada delivery documentation, dan melarang claim environment/runtime baru. | PASS | Codex, 2026-09-24 |
| `EV-008` | `REQ-008` | `npm run check:docs` dan review template DRD/handoff. | Contoh ID dan input sintetis saja | Template memiliki traceability QA/release opsional dan handoff menunjuk evidence ledger. | Template DRD memiliki table optional `TC`/`BUG` dan release record; handoff memuat traceability, actual validation, environment/release record, serta next action. | PASS | Codex, 2026-09-24 |
| `EV-009` | `REQ-009` | `npm run check:docs` dan review runbook terhadap `.env.example`, `package.json`, serta scripts. | Nama environment/variabel tanpa nilai secret | Runbook menyebut fakta yang ada dan `NOT AVAILABLE` untuk environment/deployment yang belum terbukti. | Runbook mencatat `local`/`test` dari repository, menyatakan sandbox/staging/production belum terbukti, dan memberikan preflight/recovery/incident record tanpa nilai secret. | PASS | Codex, 2026-09-24 |
| `EV-010` | `REQ-010` | `npm run check:docs`; `npm run build`; `npx tsc --noEmit`; `npm test`. | Tidak ada data pasien atau secret | Workflow CI mendefinisikan command lokal yang sama dan hasil tiap command tercatat tanpa menyamakan skip dengan pass. | Workflow GitHub Actions dibuat. Lokal: docs PASS (8 features, 138 links); build PASS; test command selesai dengan 0 pass, 0 fail, 6 skip karena `RME_TEST_DATABASE_URL` tidak ada. `tsc` sebelum build gagal karena `.next/types` belum dibuat; CI diurutkan build lalu type check, dan rerun `tsc` setelah build PASS. Eksekusi remote belum tersedia. | PASS | Codex, 2026-09-24 |
| `EV-011` | `REQ-011` | Review `.github/workflows/quality.yml`; hasil workflow GitHub Actions. | URL test memakai user/password/database CI disposable; tidak ada nilai production atau data pasien | Service PostgreSQL sehat dan `npm test` di CI menjalankan suite database, bukan menandai semua test skip. | Workflow mendefinisikan service `postgres:16`, database/user `rme_test`, health check, dan `RME_TEST_DATABASE_URL`; YAML parsed. Tidak ada run GitHub yang dapat diinspeksi dari workspace ini. | NOT AVAILABLE | Codex, 2026-09-24 |

## Release checklist

- [x] Template folder dan registry dibuat.
- [x] Evidence ledger bersatu di DRD.
- [x] TODO FE/BE memiliki format yang sama.
- [x] Semua entry point governance dan agent guide direkonsiliasi.
- [x] Peta SDLC dan audit gap dokumentasi direkonsiliasi terhadap sumber yang ada.
- [x] Cross-link dan validasi dokumentasi akhir dijalankan.
- [x] Baseline role, QA traceability, release/environment, incident, policy registry, handoff, dan CI direkonsiliasi.
- [ ] PostgreSQL disposable CI ditambahkan dan hasil eksekusi remote dicatat.

## Changelog

| Tanggal | Perubahan | Oleh |
| --- | --- | --- |
| 2026-09-22 | DRD dibuat. | Codex |
| 2026-09-22 | ADR 0002, registry fitur aktif, dan validasi struktur ditambahkan. | Codex |
| 2026-09-24 | Audit perbandingan Qlickhub serta peta SDLC RME dimulai. | Codex |
| 2026-09-24 | Peta SDLC, audit gap, entry-point, dan evidence dokumentasi direkonsiliasi. | Codex |
| 2026-09-24 | Implementasi baseline dokumentasi dan CI SDLC dimulai atas persetujuan user. | Codex |
| 2026-09-24 | ADR 0006, baseline SDLC, template, runbook, policy registry, dan CI ditambahkan; limitations operasional dicatat. | Codex |
| 2026-09-24 | Database disposable untuk CI mulai dikonfigurasi. | Codex |
| 2026-09-24 | Service PostgreSQL CI ditambahkan dan YAML tervalidasi; evidence eksekusi remote masih blocked. | Codex |
