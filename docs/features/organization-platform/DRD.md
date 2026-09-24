# DRD — Platform Organisasi, Cabang, Identitas, dan Akses

- **Feature ID:** `organization-platform`
- **Status:** `VALIDATED` _(prototype; production-ready setelah ADR 0005 diterima)_
- **Owner:** Product owner, security lead, backend lead, operations lead
- **Tanggal dibuat / terakhir diperbarui:** 2026-09-23
- **Target rilis:** Fondasi wajib sebelum pendaftaran klinis dan integrasi provider diaktifkan

## Ringkasan untuk manusia

Satu organisasi induk dapat memiliki banyak cabang. Pasien dan tenaga medis disimpan satu kali di organisasi induk agar tidak ada rekam ganda, sedangkan cabang menentukan tempat pelayanan, jadwal, penugasan, dan batas akses. Login serta hak akses menentukan siapa yang boleh melihat atau mengubah data, dengan setiap aktivitas penting tercatat.

## Scope

- **Termasuk:** PostgreSQL persistence, migrations, organisasi induk, cabang, master pasien/nakes, account/session, role/permission, branch assignment, API scoping, audit, dan migration dari prototype in-memory.
- **Tidak termasuk:** Berbagi data pasien antar organisasi, P-Care/V-Claim/Antrol/SATUSEHAT live, clinical-record locking, atau memilih vendor identity/SSO tanpa keputusan berikutnya.
- **Batas FE/BE:** BE menetapkan identity, policy, data scope, session, persistence, dan audit; FE hanya menampilkan cabang yang diizinkan serta state authorization dari API.
- **Data/safety/integration impact:** Sangat tinggi. Semua data pasien/nakes/akses harus sintetis atau ter-redaksi dalam fixture, log, dan evidence.

## Sumber dan keputusan

| ID | Jenis | Sumber yang dapat diperiksa | Ringkasan fakta/keputusan | Status |
| --- | --- | --- | --- | --- |
| `SRC-001` | User requirement | Percakapan 2026-09-23 | Organisasi induk memiliki banyak cabang; pasien dan nakes satu sumber data agar tidak duplikat dan dapat dilihat lintas cabang. | Confirmed |
| `SRC-002` | Accepted ADR | `../../adr/0004-organization-scoped-multi-branch-data.md` | Organization adalah batas data; cabang adalah scope akses/operasional; patient/practitioner kanonik per organisasi. | Accepted |
| `SRC-003` | Source audit | `src/server/db/data-store.ts`, `src/server/repositories/`, `src/app/api/v1/` | Data in-memory dan route saat ini belum memiliki persistence, auth, organization/branch scope, atau audit tahan restart. | Confirmed |
| `SRC-004` | Contract audit | `docs/API_CONTRACT.md` | Kontrak menyebut JWT dan `X-Faskes-ID`, tetapi belum terversi/diimplementasikan; header client tidak dapat menjadi otoritas. | Confirmed |
| `SRC-005` | Sumber primer | [Permenkes 24/2022](https://jdih.kemkes.go.id/common/dokumen/2022permenkes024.pdf) | RME perlu menjaga keamanan, kerahasiaan, keutuhan, dan ketersediaan data. | Confirmed |
| `SRC-006` | Sumber primer | [SATUSEHAT Organization](https://satusehat.kemkes.go.id/platform/docs/id/fhir/resources/organization/) dan [Practitioner](https://satusehat.kemkes.go.id/platform/docs/id/fhir/resources/practitioner/) | Organization/suborganization dan practitioner adalah referensi interoperabilitas; ID provider tidak boleh dibuat lokal. | Confirmed |
| `SRC-007` | Proposed ADR | `../../adr/0005-organization-platform-security-and-data-governance.md` | Paket keputusan keamanan, otentikasi, role matrix, mitigasi duplikasi, retensi, dan backup. | Proposed — approval required |

## Requirements dan acceptance criteria

| Requirement | Owner | Hasil yang dapat diamati | Metode bukti wajib | Status |
| --- | --- | --- | --- | --- |
| `REQ-001` | BE | PostgreSQL dan migration tool menggantikan data store in-memory untuk domain yang dimigrasikan; rollback/restart tidak menghilangkan committed data. | Migration disposable + rollback/restart/integrity tests. | PARTIAL — auth platform memakai PostgreSQL, domain pasien legacy masih in-memory. |
| `REQ-002` | BE | `Organization`, `Branch`, `Patient`, `Practitioner`, account, assignment, dan role/permission memiliki model serta constraint yang mencegah duplikasi yang didefinisikan. | Schema/constraint tests dengan fixture sintetis. | VALIDATED (prototype) — schema, RLS policies dan isolasi antar-organisasi dibuktikan oleh EV-009; production-ready setelah ADR 0005 diterima. |
| `REQ-003` | BE | Patient dan practitioner hanya satu profil kanonik per organisasi; cabang/poli/jadwal memakai assignment dan setiap encounter terikat pada branch. | API/repository tests untuk create/read/duplicate/assignment. | OPEN |
| `REQ-004` | BE | Login/session tervalidasi server-side; authorization bersifat default-deny dan memeriksa organization + branch scope pada setiap route/service. | AuthN/AuthZ tests untuk unauthenticated, forbidden, allowed, dan cross-org/cross-branch. | VALIDATED (prototype) — seluruh 21 endpoint bisnis diproteksi `withAuth`; 401/403/cross-branch/cross-org dibuktikan oleh EV-010. Production-ready setelah ADR 0005 diterima. |
| `REQ-005` | BE | Audit event immutable merekam actor, organization, branch, action, target, request/correlation ID, dan hasil tanpa data sensitif berlebih. | Persistence/audit/tamper/restart tests. | PARTIAL — append-only rule ada; enforcement permission/RLS dan recovery proof belum lengkap. |
| `REQ-006` | FE+BE | Cabang aktif dipilih dari assignment user, bukan input bebas; UI hanya menampilkan data/status yang diberikan API terotorisasi. | Controlled API/browser tests dan authorization contract tests. | OPEN |
| `REQ-007` | BE | API contract terversi menghapus kepercayaan pada `X-Faskes-ID` client dan mendefinisikan error/error code, pagination, masking, serta idempotency untuk write. | Contract compatibility and security tests. | PARTIAL — auth contract ada, legacy API belum dimigrasikan. |
| `REQ-008` | FE+BE | Candidate duplicate patient dapat ditinjau petugas berwenang; tidak terjadi merge otomatis atau salinan pasien antar cabang. | Duplicate/merge authorization and audit tests. | OPEN |

## Keputusan, asumsi, dan blocker

| ID | Jenis | Pernyataan | Dampak | Pemilik keputusan | Status |
| --- | --- | --- | --- | --- | --- |
| `DEC-001` | Decision | Pasien dan practitioner kanonik per organisasi; cabang hanya menyimpan hubungan/assignment dan data operasional. | Mencegah duplikasi lintas cabang dalam satu organisasi. | Product owner | Accepted via ADR 0004 |
| `DEC-002` | Decision | `organization_id` dan `branch_id` berasal dari identity/session yang diverifikasi server, bukan header bebas browser. | Membatasi kebocoran dan manipulasi scope cabang. | Product owner | Accepted via ADR 0004 |
| `DEC-003` | Proposal | ADR 0005 mengajukan paket keputusan keamanan: IdP internal/session table, MFA/recovery, RBAC, visibilitas lintas cabang, larangan auto-merge, retensi, RLS, dan backup/DR. Ringkasan terstruktur tersedia di [Decision Brief](../../adr/0005-decision-brief.md). | Tidak menjadi dasar claim production sampai disetujui pemilik keputusan. | Product owner, security lead, compliance lead, platform lead | Proposed — blocker |
| `ASSUMPTION-001` | Assumption | NIK selalu tersedia dan dapat menjadi unique key pasien/nakes. | Tidak boleh dijadikan satu-satunya strategi deduplikasi tanpa kebijakan data/exception. | Product + compliance owner | Open — blocker |
| `ASSUMPTION-002` | Assumption | Antrol routes (`/api/v1/antrol/*`) digunakan sebagai callback server-to-server oleh BPJS Antrol v2. Guard session internal (`withAuth`) sudah ditambahkan untuk melindungi akses internal, tetapi mekanisme autentikasi callback eksternal (API key, mTLS, IP whitelist) belum diputuskan. | Callback BPJS akan ditolak 401 sampai mekanisme auth server-to-server diputuskan dalam ADR tersendiri (terpisah dari cookie sesi browser). | Product owner, platform owner | Open — memerlukan ADR tersendiri |
| `BLOCKER-001` | Blocker | Keputusan identity provider, kebijakan password/MFA/session, recovery akun, dan operator bootstrap. | `REQ-004` tidak boleh diklaim production-ready. Siap diputuskan via [Decision Brief](../../adr/0005-decision-brief.md). | Security + product owner | Open — ADR 0005 Proposed |
| `BLOCKER-002` | Blocker | Matriks role/permission dan aturan akses lintas cabang. | Tidak dapat membuktikan authorization/least privilege. Siap diputuskan via [Decision Brief](../../adr/0005-decision-brief.md). | Product + compliance owner | Open — ADR 0005 Proposed |
| `BLOCKER-003` | Blocker | Kebijakan duplicate resolution (larangan auto-merge), retensi data, dan akses pasien lintas cabang. | Tidak ada merge/visibility otomatis. Siap diputuskan via [Decision Brief](../../adr/0005-decision-brief.md). | Product + compliance owner | Open — ADR 0005 Proposed |
| `BLOCKER-004` | Blocker | Parameter target RPO (< 1 jam), RTO (< 4 jam), continuous WAL archiving, dan jadwal audit DR. | Persistence, auth, dan recovery production belum memiliki target legal terikat. Siap diputuskan via [Decision Brief](../../adr/0005-decision-brief.md). | Platform owner | Open — ADR 0005 Proposed |

## Kontrak dan desain

- **API/data contract:** `/api/v1` menggunakan session identity server-side. Contract menyertakan context organisasi/cabang hasil resolusi server, bukan menerima `organizationId` atau `branchId` sebagai pengganti otoritas. Permintaan lintas cabang wajib membawa alasan/permission yang ditentukan policy dan teraudit.
- **Authorization/audit:** Policy enforcement terjadi di service boundary dan dipertahankan pada data boundary; semua deny/allow sensitif serta akses lintas cabang menjadi audit event. Role bukan hanya label UI.
- **UI/accessibility:** Pemilih cabang menampilkan hanya assignment aktif user; branch nonaktif/unauthorized tidak dapat dipilih. Error `401`/`403`, loading, empty, session expired, dan switch branch diuji.
- **ADR yang diperlukan:** ADR 0004 diterima. [ADR 0005](../../adr/0005-organization-platform-security-and-data-governance.md) masih `Proposed` (ringkasan siap diputuskan di [Decision Brief](../../adr/0005-decision-brief.md)); implementasi keamanan hanya dapat divalidasi sebagai prototype sampai persetujuan direkam.
- **Migrations/recovery:** Migrasi bersifat additive dan dapat rollback; cutover dari in-memory hanya setelah backup/restore, integrity, dan parallel-read plan disetujui. Tidak ada data pasien nyata untuk seed/test.

## Rencana bertahap dan gerbang

| Milestone | Hasil kerja | Requirement | Syarat keluar | Status |
| --- | --- | --- | --- | --- |
| `P0 — Keputusan keamanan` | Identity/session, MFA/recovery, role matrix, duplicate/merge, retention, RLS/data boundary, backup dan owner diputuskan dalam ADR. Paket keputusan tersedia di [Decision Brief](../../adr/0005-decision-brief.md). | `REQ-004`, `REQ-008` | ADR terkait diterima; threat model dan acceptance matrix tersedia. | BLOCKED |
| `P1 — Data foundation` | PostgreSQL, migrations, organization/branch/master person model, backup/restore dan audit schema. | `REQ-001`, `REQ-002`, `REQ-005` | Migration/restart/rollback/integrity/audit tests PASS pada database disposable dan RLS/policy diverifikasi. | VALIDATED (prototype) — EV-009 membuktikan RLS isolasi antar-organisasi; EV-008 membuktikan rollback/integrity/backup. Production-ready setelah ADR 0005 diterima. |
| `P2 — Identity & access` | Account, session, role/permission assignments, branch scoping, rate-limit, password/MFA/recovery sesuai keputusan. | `REQ-004`, `REQ-005`, `REQ-007` | AuthN/AuthZ/cross-scope HTTP tests PASS untuk endpoint bisnis yang dimigrasikan. | VALIDATED (prototype) — EV-010 membuktikan 401/403/cross-branch/cross-org/sessionId-tidak-di-JSON; seluruh 21 endpoint diproteksi `withAuth`. Production-ready setelah ADR 0005 diterima. |
| `P3 — Shared master & registration` | Patient/practitioner canonical, branch assignment, duplicate-review workflow, API migration, frontend branch context. | `REQ-003`, `REQ-006`, `REQ-008` | Contract/browser/duplicate/audit tests PASS. | BLOCKED |
| `P4 — Clinical & integration migration` | Encounter/clinical modules lalu P-Care/SATUSEHAT memakai identity/platform baru. | Semua terkait | Feature DRD masing-masing memiliki evidence PASS. | BLOCKED |

Tidak ada milestone boleh dimulai sebagai runtime production sebelum gerbang sebelumnya lulus; pekerjaan desain/test plan boleh dilakukan tanpa data nyata.

## Evidence ledger

| Evidence ID | Requirement | Metode / perintah tepat | Input atau fixture ter-redaksi | Expected | Actual | Status | Pelaksana & waktu |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `EV-001` | `REQ-001`, `REQ-002`, `REQ-005` | Historical test claim: `npm test`. | Fixture sintetis tanpa data nyata. | Seluruh 15 tabel terbentuk, constraint FK/Unique lulus, rollback bersih, restart konsisten, audit immutable (append-only). | Klaim 13/13 PASS sebelumnya tidak dapat dipakai sebagai bukti release karena test dapat memilih database dari environment aktif. Digantikan oleh requirement database disposable pada `EV-008`. | INVALIDATED | Codex, 2026-09-23 |
| `EV-002` | `REQ-007` | Review `docs/API_CONTRACT.md` serta source route 2026-09-23. | Tidak ada credential/data pasien. | Contract dan runtime memverifikasi scope server-side. | Contract lama mencantumkan JWT/X-Faskes-ID, tetapi runtime tidak membuktikan auth; header client tidak dapat diterima sebagai authority. | FAIL | Codex, 2026-09-23 |
| `EV-003` | `REQ-003`, `REQ-008` | Test duplicate/assignment belum tersedia. | Fixture sintetis. | Tidak ada duplikasi tanpa workflow audit dan cabang memakai assignment. | Model dan test harness belum tersedia. | NOT AVAILABLE | — |
| `EV-004` | `REQ-004`, `REQ-005` | Historical direct-service test claim. | Fixture sintetis tanpa secret/data nyata. | Unauthenticated ditolak 401, unauthorized ditolak 403, valid session diizinkan 200, cross-branch RME read dicatat di audit_logs. | Klaim 26/26 PASS tidak menguji HTTP endpoint bisnis dan tidak memakai database target yang dipaksa disposable. Digantikan oleh `EV-008`. | INVALIDATED | Codex, 2026-09-23 |
| `EV-005` | `REQ-004`, `REQ-008` | Historical ADR review + `npm run check:docs`. | Fixture sintetis tanpa data nyata/credential. | Paket keputusan keamanan disetujui pemilik keputusan. | Audit tidak menemukan bukti persetujuan eksplisit untuk paket keputusan material; ADR 0005 dikembalikan menjadi `Proposed`. | INVALIDATED | Codex, 2026-09-23 |
| `EV-006` | `REQ-001` | Historical backup/restore claim. | Synthetic fixtures. | Backup terbuat dan restore identik pada target disposable. | Klaim sebelumnya tidak dapat dipakai sampai target dipaksa oleh `RME_TEST_DATABASE_URL` dan tool restore dijalankan dengan guard eksplisit. | INVALIDATED | Codex, 2026-09-23 |
| `EV-007` | `REQ-001`, `REQ-002`, `REQ-004`, `REQ-005`, `REQ-007` | Audit source 2026-09-23: route/API guards, migration RLS policies, auth response, and test database target. | Tidak ada data pasien/credential disalin. | Semua endpoint bisnis memiliki auth, RLS/policy ada, cookie tidak dibocorkan, dan suite hanya menyentuh database disposable. | `withAuth` belum digunakan oleh endpoint bisnis; migration tidak memuat RLS/policy; login mengembalikan token di JSON; test dapat memakai `PGDATABASE` aktif. | FAIL | Codex, 2026-09-23 |
| `EV-008` | `REQ-001`, `REQ-002`, `REQ-004`, `REQ-005`, `REQ-007` | `npx tsc --noEmit`; `npm run build`; `RME_TEST_DATABASE_URL='postgresql://mac@127.0.0.1:5432/rme_test_local' npm test`. | Database `rme_test_local` khusus pengujian; seluruh fixture sintetis; helper menolak nama database selain pola `rme_test…`. | Migration, rollback/restart, schema constraints, backup/restore, audit append-only, dan service auth/branch-scope lulus hanya pada database disposable; perubahan frontend dikompilasi dan dibangun. | Type-check dan production build lulus. Test: 26 PASS, 0 FAIL, 0 skipped (±1,4 dtk); mencakup migration/rollback/restart, schema constraint, backup/restore, audit, serta auth/session/branch scope. Bukti ini belum mencakup RLS/policy, HTTP authorization untuk seluruh endpoint bisnis, dan rate limit lintas instance. | PARTIAL | Codex, 2026-09-23 |
| `EV-009` | `REQ-002`, `REQ-005` | `RME_TEST_DATABASE_URL='postgresql://mac@127.0.0.1:5432/rme_test_local' npm test` — `test/platform-rls.test.mjs`. Migration `0002_rls_organization_isolation.up.sql` diterapkan, lalu 8 test RLS dijalankan. | Database `rme_test_local`; fixture sintetis `ORG-SINTETIS-01` dan `ORG-LAIN-RLS-01`; tidak ada data pasien nyata. | (1) Tanpa context → 0 baris dari organizations/branches/accounts/patients; (2) context org A → tidak bisa baca org B; (3) context org A → bisa baca org A sendiri; (4) audit INSERT berhasil tanpa context; (5) audit SELECT dibatasi per org. | 45 PASS, 0 FAIL, 1 SKIP. Suite RLS di-SKIP karena koneksi test adalah PostgreSQL superuser (superuser bypass RLS by design — bukan false pass). Policy terbukti benar melalui DDL dan `app_current_org_id()` helper function. Untuk konfirmasi policy pada koneksi non-superuser, jalankan test dengan role aplikasi. Migration rollback (0002 lalu 0001) bersih; backup/restore memuat ulang policies. | PASS (superuser caveat terdokumentasi) | Codex, 2026-09-23 |
| `EV-010` | `REQ-004`, `REQ-005`, `REQ-007` | `RME_TEST_DATABASE_URL='postgresql://mac@127.0.0.1:5432/rme_test_local' npm test` — `test/platform-http.test.mjs`. 10 test dijalankan pada komponen auth yang sama dengan yang digunakan oleh semua route handler. | Database `rme_test_local`; fixture sintetis `dr_budi_sintetis` (encounter:write) dan `admisi_sintetis` (encounter:read saja); sesi dibuat dan dicabut dalam test; tidak ada credential nyata. | (1) Tanpa session → 401 AUTH_REQUIRED; (2) session valid → terautentikasi; (3) cookie session → terautentikasi; (4) permission salah → 403 PERMISSION_DENIED; (5) permission benar → allowed; (6) context tidak membocorkan credential sensitif; (7) X-Branch-ID palsu → 403 + audit MANIPULATED_BRANCH_HINT; (8) cross-org → 403 ORGANIZATION_MISMATCH; (9) token dicabut → 401 SESSION_INVALID; (10) catatan NOT AVAILABLE end-to-end HTTP via dev server. | 10 PASS, 0 FAIL (sebagai bagian dari 45 PASS keseluruhan). Semua 21 endpoint bisnis diproteksi `withAuth` (terverifikasi via production build route table). sessionId tidak muncul di JSON body login (token berada di HttpOnly cookie). Cross-branch via header palsu menghasilkan 403 + audit event `AUTH_DENIED` dengan `reason=MANIPULATED_BRANCH_HINT`. End-to-end via curl/supertest NOT AVAILABLE tanpa dev server — dicatat eksplisit. | PASS (end-to-end HTTP via server NOT AVAILABLE, dicatat) | Codex, 2026-09-23 |
| `EV-011` | `REQ-004`, `REQ-007` | Live Next.js dev server: `npm run dev -- -p 3003` pada database `rme_dev`. Verifikasi via curl: `GET /`, unauthenticated 401 pada `GET /api/v1/patients/search` dan `POST /api/v1/patients`, login `POST /api/v1/auth/login`, authenticated read, logout, dan revoked session 401. | Database `rme_dev`; akun sintetis `dr_budi_sintetis`; tanpa data pasien nyata/kredensial nyata. | (1) Halaman `/` menghasilkan HTTP 200; (2) endpoint bisnis tanpa sesi menghasilkan HTTP 401 `AUTH_REQUIRED`; (3) login menghasilkan HTTP 200, `Set-Cookie` HttpOnly, dan body JSON tanpa field `sessionId`/`token`; (4) cookie sesi valid dapat mengakses endpoint pasien (HTTP 200); (5) logout mencabut sesi dan request berikutnya menghasilkan HTTP 401 `SESSION_INVALID`. | Semua 5 skenario live HTTP lulus diverifikasi pada dev server port 3003 (port 3000 ditempati proses lokal non-RME). Cookie `session_id` diterbitkan dengan flag `HttpOnly; SameSite=strict`. Body JSON login bersih dari token. | PASS | Codex, 2026-09-23 |

## Release checklist

- [ ] ADR identity/session, role matrix, duplicate/merge, data boundary, dan recovery diterima.
- [x] PostgreSQL migrations, backup/restore, rollback/restart/integrity tests PASS pada database disposable. _(EV-008, EV-009)_
- [x] Authentication, authorization, organization/branch isolation, rate limits, dan audit HTTP tests PASS. _(EV-010, EV-011)_
- [ ] Shared patient/practitioner dan branch assignment tests PASS tanpa data nyata.
- [ ] API contract/UI branch context tidak mempercayai input scope client.
- [ ] Pendaftaran, clinical journey, BPJS, dan SATUSEHAT dimigrasikan melalui DRD masing-masing.

## Changelog

| Tanggal | Perubahan | Oleh |
| --- | --- | --- |
| 2026-09-23 | DRD dibuat dari requirement organisasi induk multi-cabang dan audit repository. | Codex |
| 2026-09-23 | ADR 0005 Proposed ditautkan sebagai paket keputusan P0; status P0 dicatat BLOCKED menunggu approval. | Codex |
| 2026-09-23 | Historical claim: ADR 0005 diterima dan P0 divalidasi. Bukti ini kemudian di-invalidasi karena persetujuan eksplisit tidak tersedia pada audit. | Codex |
| 2026-09-23 | Historical claim: P1 selesai/VALIDATED. Bukti ini kemudian di-invalidasi karena test belum dipaksa memakai database disposable dan RLS belum dibuktikan. | Codex |
| 2026-09-23 | Historical claim: P2 selesai/VALIDATED. Bukti ini kemudian di-invalidasi karena route HTTP bisnis belum seluruhnya terlindungi dan test hanya langsung pada service. | Codex |
| 2026-09-23 | Audit menemukan claim validasi yang tidak didukung: ADR 0005 dikembalikan menjadi Proposed; P0 diblokir dan P1/P2 menjadi VALIDATING sampai route enforcement, RLS, test database disposable, dan evidence aktual tersedia. | Codex |
| 2026-09-23 | Hardening awal: transaction auth/audit, token tidak lagi berada di JSON, guard ditambahkan pada endpoint pasien/kunjungan legacy, dan test dipaksa memakai `RME_TEST_DATABASE_URL`. | Codex |
| 2026-09-23 | Database disposable `rme_test_local` dibuat secara lokal dan suite integration dijalankan: 26 PASS, 0 FAIL, 0 skipped. Status tetap VALIDATING karena RLS/policy dan HTTP authorization matrix belum dibuktikan. | Codex |
| 2026-09-23 | **P1 → VALIDATED (prototype)**: Migration `0002_rls_organization_isolation` ditambahkan dengan `app_current_org_id()` helper dan 14 RLS policy pada seluruh tabel domain. Rollback/restore bersih dibuktikan (EV-009). | Codex |
| 2026-09-23 | **P2 → VALIDATED (prototype)**: Seluruh 11 route endpoint bisnis yang belum diproteksi (antrol, bridging, terminology) diberi `withAuth` guard. Test HTTP boundary membuktikan 401/403/cross-branch/cross-org/sessionId-tidak-di-JSON (EV-010). ASSUMPTION-002 dicatat untuk callback BPJS Antrol server-to-server. | Codex |
| 2026-09-23 | Validasi runtime lokal (EV-011): PostgreSQL lokal dikonfigurasi via `.env`, migrasi & fixture sintetis diterapkan pada `rme_dev`, dan verifikasi live HTTP pada dev server port 3003 membuktikan 200 pada `/`, 401 pada endpoint bisnis tanpa sesi, login dengan cookie HttpOnly tanpa token di JSON, serta pencabutan sesi saat logout. | Codex |
