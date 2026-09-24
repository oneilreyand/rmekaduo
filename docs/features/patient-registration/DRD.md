# DRD — Pendaftaran Pasien Terpadu

- **Feature ID:** `patient-registration`
- **Status:** `DISCOVERY`
- **Owner:** Product owner, admisi lead, backend lead, integration lead
- **Tanggal dibuat / terakhir diperbarui:** 2026-09-23
- **Target rilis:** Ditentukan setelah keputusan jenis faskes dan sandbox diterima

## Ringkasan untuk manusia

Pendaftaran harus melayani pasien baru dan pasien lama, baik penjamin mandiri/umum maupun JKN. Hasil pendaftaran lokal tidak boleh otomatis berarti BPJS menerima kunjungan atau SATUSEHAT menerima data. Sistem menyimpan hasil setiap langkah secara terpisah agar petugas mengetahui apa yang harus diperbaiki dan pasien tidak menerima informasi yang menyesatkan.

## Scope

- **Termasuk:** Identifikasi pasien baru/lama, pencarian aman, pencegahan duplikasi, penjamin umum/mandiri, verifikasi JKN, pembuatan kunjungan/antrean, status integrasi, consent/privasi, dan audit.
- **Tidak termasuk:** Mengklaim P-Care, V-Claim, Antrol, Mobile JKN, atau SATUSEHAT aktif sebelum evidence sandbox/live yang disetujui ada.
- **Batas FE/BE:** FE mengumpulkan data minimum dan menampilkan state nyata; BE menguasai identity matching, authorization, persistence, idempotensi, audit, dan adapter provider.
- **Data/safety/integration impact:** Tinggi. NIK, nomor kartu, nomor RM, dan status penjaminan hanya diproses di batas terotorisasi dan tidak boleh masuk log/evidence/fixture nyata.

## Sumber dan keputusan

| ID | Jenis | Sumber yang dapat diperiksa | Ringkasan fakta/keputusan | Status |
| --- | --- | --- | --- | --- |
| `SRC-001` | User requirement | Percakapan 2026-09-22 | Pendaftaran pasien baru/lama harus mendukung BPJS atau mandiri dan dievaluasi terhadap BPJS/SATUSEHAT. | Confirmed |
| `SRC-002` | Source audit | `src/app/api/v1/patients/route.ts`, `src/server/repositories/patient-repository.ts` | Endpoint pasien baru dan pencarian ada, tetapi memakai data store in-memory, tanpa boundary authorization yang terbukti, dan menghasilkan IHS lokal. | Confirmed |
| `SRC-003` | Feature DRD | `../bpjs-bridging/DRD.md` | BPJS belum memiliki evidence sandbox/live; mock dan fallback tidak membuktikan penerimaan provider. | Confirmed |
| `SRC-004` | Feature DRD | `../satusehat-bridging/DRD.md` | SATUSEHAT belum memiliki evidence sandbox; ID/sinkronisasi sintetis tidak boleh dipakai sebagai hasil provider. | Confirmed |
| `SRC-005` | Sumber primer | [Dokumentasi autentikasi SATUSEHAT](https://satusehat.kemkes.go.id/platform/docs/id/api-catalogue/authentication/) dan [Patient API](https://satusehat.kemkes.go.id/platform/docs/id/api-catalogue/onboardings/apis/patient/) | Akses SATUSEHAT memakai OAuth client credentials dari partner terverifikasi; pencarian Patient memakai Bearer token. | Confirmed |
| `SRC-006` | Proposed ADR | `../../adr/0003-pcare-first-registration-decision-pack.md` | Paket keputusan M0 untuk jenis fasilitas, scope provider, ownership master data, credential boundary, lifecycle status, dan persetujuan. Tidak mengikat sebelum `Accepted`. | Proposed |
| `SRC-007` | Accepted ADR / platform dependency | `../../adr/0004-organization-scoped-multi-branch-data.md` dan `../organization-platform/DRD.md` | Pasien/nakes kanonik per organisasi induk dan akses cabang harus dibangun sebagai platform sebelum pendaftaran klinis. | Accepted |

## Requirements dan acceptance criteria

| Requirement | Owner | Hasil yang dapat diamati | Metode bukti wajib | Status |
| --- | --- | --- | --- | --- |
| `REQ-001` | Product + integration | Jenis faskes dan jalur penjaminan disetujui: FKTP/P-Care atau FKRTL/V-Claim; Antrol/Mobile JKN diputuskan terpisah. | Keputusan produk + ADR + contract matrix terverifikasi dengan pemilik integrasi. | OPEN |
| `REQ-002` | BE | Pasien baru dibuat hanya setelah validasi identitas, deduplikasi, role authorization, idempotensi, persistence, dan audit lulus. | API/integration test untuk valid, invalid, duplicate, unauthorized, retry, dan restart. | OPEN |
| `REQ-003` | FE+BE | Pasien lama dapat dicari oleh parameter yang diizinkan dengan hasil minimum, role-based, terlindungi dari enumeration, dan tidak membuka data berlebih. | Authorization/privacy/contract test serta browser evidence. | OPEN |
| `REQ-004` | FE+BE | Jalur mandiri/umum dapat membuat kunjungan lokal tanpa melakukan atau mengklaim request BPJS/SATUSEHAT. | Contract + browser test dengan state success/error. | OPEN |
| `REQ-005` | BE | Jalur JKN memverifikasi eligibility dan membuat transaksi P-Care atau SEP sesuai jenis faskes, dengan mode provider yang eksplisit, idempotensi, retry, audit, dan rekonsiliasi. | Sandbox contract tests dan bukti transaksi ter-redaksi dari provider. | OPEN |
| `REQ-006` | FE | Petugas melihat status terpisah: `pencatatan lokal`, `BPJS`, `antrean`, dan `SATUSEHAT`; mock/sandbox/error tidak dapat tampil sebagai sukses live. | Controlled-response browser tests dengan keyboard/accessibility evidence. | OPEN |
| `REQ-007` | BE | Pemetaan IHS dan pengiriman FHIR memakai adapter SATUSEHAT terversi; kegagalan tidak boleh membuat hasil sinkronisasi palsu. | Sandbox OAuth/FHIR test dan audit/outbox evidence. | OPEN |
| `REQ-008` | BE | Master faskes, poli, tenaga medis, jadwal, dan role tersedia secara terotorisasi; data tenaga medis tidak dibuat-buat untuk request provider. | Schema/authorization/audit test dengan fixture sintetis. | OPEN |

## Keputusan, asumsi, dan blocker

| ID | Jenis | Pernyataan | Dampak | Pemilik keputusan | Status |
| --- | --- | --- | --- | --- | --- |
| `DEC-001` | Decision | Pendaftaran lokal dan hasil provider adalah status terpisah yang direkonsiliasi, bukan satu toast sukses. | Mencegah data lokal disalahartikan sebagai penerimaan eksternal. | Product owner | Accepted |
| `DEC-002` | Proposal | ADR 0003 mengumpulkan keputusan M0 yang harus disetujui sebelum memilih FKTP/FKRTL atau mengaktifkan scope provider. | Mencegah UI/default/mock menjadi keputusan fasilitas atau integrasi. | Product + compliance + BPJS PIC | Proposed — not binding |
| `ASSUMPTION-001` | Assumption | Kaduo merupakan FKTP atau FKRTL. | Menentukan apakah jalur utama JKN adalah P-Care atau V-Claim; tidak boleh diasumsikan. | Product + BPJS PIC | Open — blocker |
| `BLOCKER-001` | Blocker | Jenis faskes, kode fasilitas, ruang lingkup P-Care/V-Claim/Antrol, dan PIC BPJS belum diputuskan/terverifikasi. ADR 0003 baru `Proposed`, belum merupakan keputusan. | `REQ-005` tidak dapat dirancang atau diuji final; M0/M1 tidak dapat melewati gerbang keputusan. | Product + BPJS PIC | Open |
| `BLOCKER-002` | Blocker | Belum ada credential sandbox terverifikasi, allowlist, test account, atau prosedur redaksi untuk BPJS/SATUSEHAT. | Tidak ada claim live/sandbox yang sah. | Integration owner | Open |
| `BLOCKER-003` | Blocker | Persistence, authorization, audit, test harness, dan data migration untuk identitas pasien belum terbukti. Platform `organization-platform` harus memenuhi gerbangnya sebelum pendaftaran klinis. | Pendaftaran klinis tidak boleh diaktifkan dari store in-memory. | Backend lead | Open |
| `BLOCKER-004` | Blocker | Dasar consent, retensi data, role matriks, serta master data pasien/penjamin belum ditetapkan. | Field/data collection tidak boleh diperluas. | Product + compliance owner | Open |

## Kontrak dan desain

- **API/data contract:** Buat `registration` command dan `registration-status` read model yang terversi. Request tidak menerima status provider sebagai input; respons menyertakan operation/correlation ID serta status lokal/provider yang terpisah.
- **Authorization/audit:** Hanya role admisi terotorisasi dapat mencari/mendaftarkan; setiap lookup dan write teraudit. Terapkan rate-limit/masking dan larangan log identifier.
- **UI/accessibility:** Form bertahap berdasarkan jalur pasien; wajib memiliki state default/loading/error/duplicate/retry, nama aksesibel, fokus error, dan banner mode `mock`/`sandbox` yang permanen.
- **ADR yang diperlukan:** Ya — [ADR 0003](../../adr/0003-pcare-first-registration-decision-pack.md) `Proposed` mencakup jenis faskes/jalur JKN, lifecycle status lokal-provider, ownership master data, dan credential boundary. Ia belum mengizinkan implementasi provider atau mengikat pilihan apa pun.
- **Migrations/recovery:** Migrasi pasien/kunjungan harus disposable dan teruji; operation yang gagal provider dapat diretry dengan idempotency key tanpa membuat kunjungan/SEP ganda.

## Rencana P-Care-first dan gerbang

P-Care menjadi integrasi pertama **setelah** fondasi lokal minimum tersedia. V-Claim tidak ikut dikerjakan pada tranche ini; ia hanya dapat direncanakan kembali apabila keputusan `REQ-001` menyatakan Kaduo adalah FKRTL.

| Milestone | Hasil kerja | Requirement | Syarat keluar / evidence | Status saat ini |
| --- | --- | --- | --- | --- |
| `M0 — Keputusan & safety` | Putuskan FKTP, PPK/kode faskes, poli layanan, PIC BPJS, serta kebijakan data/consent. Adapter provider fail-closed dan mode terlihat. | `REQ-001`, `REQ-006` | ADR 0003 diterima; inventory secret/PII dan controlled error test lulus. | BLOCKED — ADR 0003 masih Proposed |
| `M1 — Master lokal` | Master faskes, poli, dokter/tenaga medis, jadwal, role admisi; semua record persisten dan teraudit. | `REQ-008` | Schema, authorization, audit, dan migration/restart tests lulus dengan fixture sintetis. | OPEN |
| `M2 — Pendaftaran lokal` | Pasien baru, pencarian pasien lama, deduplikasi, kunjungan, antrean, dan penjamin mandiri/umum. | `REQ-002`, `REQ-003`, `REQ-004` | API/browser tests untuk valid/invalid/duplicate/unauthorized/retry serta state UI lulus. | OPEN |
| `M3 — P-Care sandbox` | Eligibility peserta lalu pendaftaran kunjungan P-Care FKTP; setiap write memakai idempotency, audit, outbox/retry, dan rekonsiliasi. | `REQ-005`, `REQ-006` | Contract test resmi + transaksi sandbox ter-redaksi untuk success/error/retry lulus. | BLOCKED |
| `M4 — Pilot terkendali` | Aktivasi bagi role/poli terbatas, dashboard rekonsiliasi, SOP gagal/retry, dan dukungan operasional. | `REQ-002`–`REQ-006`, `REQ-008` | Semua evidence sebelumnya PASS dan sign-off pemilik produk/integrasi. | BLOCKED |

**Alur operasional target M3:** petugas memilih pasien baru atau lama → sistem memvalidasi/menyimpan pendaftaran lokal → bila JKN, backend melakukan eligibility P-Care → petugas mengonfirmasi data/poli/keluhan yang diwajibkan kontrak → backend mengirim pendaftaran P-Care sekali secara idempotent → UI menampilkan status lokal dan status P-Care secara terpisah. Gagal P-Care tidak menghapus pendaftaran lokal dan tidak boleh tampil sebagai “terdaftar BPJS”.

Setiap gerbang hanya dimulai setelah requirement sebelumnya mempunyai evidence `PASS`; tidak ada tanggal estimasi sebelum blocker provider dan keputusan jenis faskes selesai.

## Evidence ledger

| Evidence ID | Requirement | Metode / perintah tepat | Input atau fixture ter-redaksi | Hasil yang diharapkan | Hasil aktual | Status | Pelaksana & waktu |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `EV-001` | `REQ-002`, `REQ-003` | Audit source `patients` route/repository pada 2026-09-22. | Tidak ada identifier disalin. | Ada batas persistence/auth/audit yang dapat diuji. | Endpoint dan repository ada, tetapi store in-memory, authorization, dan test evidence belum tersedia. | FAIL | Codex, 2026-09-22 |
| `EV-002` | `REQ-005` | Test sandbox BPJS versi kontrak resmi. | Test account dan payload ter-redaksi. | Eligibility dan write provider menghasilkan contract success/error terverifikasi. | Credential/sandbox belum tersedia. | NOT AVAILABLE | — |
| `EV-003` | `REQ-007` | Test sandbox OAuth + FHIR Patient/Encounter yang terversi. | Fixture sintetis/ter-redaksi. | Token, IHS, resource response/error, dan correlation ID tercatat. | Belum tersedia; lihat `satusehat-bridging`. | NOT AVAILABLE | — |
| `EV-004` | `REQ-004`, `REQ-006` | Browser desktop/mobile dengan controlled API response. | Data sintetis. | Jalur mandiri dan semua state provider ditampilkan jujur serta aksesibel. | Belum direncanakan sebagai suite test. | PLANNED | — |
| `EV-005` | `REQ-008` | Schema, authorization, audit, migration/restart test untuk master faskes/poli/tenaga medis. | Fixture sintetis tanpa SIP/NIK nyata. | Data tenaga medis dan lokasi tersedia secara aman untuk pendaftaran P-Care. | Model persistence dan test harness belum tersedia. | NOT AVAILABLE | — |
| `EV-006` | `REQ-001`, `REQ-005`, `REQ-006`, `REQ-008` | Review ADR 0003 oleh Product, compliance, facility owner, dan BPJS PIC; kemudian jalankan `npm run check:docs`. | Tidak ada credential, kode faskes, atau data pasien. | Keputusan M0 dicatat sebagai `Accepted` atau tetap `Proposed`/`BLOCKED`; dokumentasi saling tertaut. | ADR 0003 dibuat `Proposed`; persetujuan pemilik keputusan belum ada. `npm run check:docs`: feature documentation checked `7`, documentation links checked `39`, exit `0`. Pemeriksaan hanya membuktikan struktur/tautan, bukan keputusan M0 atau integrasi. | BLOCKED | Agy, 2026-09-23 |

## Release checklist

- [ ] ADR keputusan jenis faskes, provider mode, dan credential boundary diterima.
- [ ] Identity/persistence/authorization/audit/idempotency tests PASS.
- [ ] Master faskes, poli, tenaga medis, jadwal, dan role lulus `EV-005`.
- [ ] Jalur mandiri lulus tanpa claim provider.
- [ ] BPJS dan SATUSEHAT sandbox evidence PASS bila diaktifkan.
- [ ] UI tidak menampilkan keberhasilan provider dari mock/fallback.
- [ ] Pilot/runbook/reconciliation disetujui sebelum live.

## Changelog

| Tanggal | Perubahan | Oleh |
| --- | --- | --- |
| 2026-09-22 | DRD discovery dan rencana pendaftaran terpadu dibuat dari audit repository. | Codex |
| 2026-09-23 | ADR 0003 `Proposed` ditautkan sebagai paket keputusan M0; tidak ada jenis faskes, kode, credential, atau integrasi dipilih. | Codex |
