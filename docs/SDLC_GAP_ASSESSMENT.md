# Audit Kesenjangan SDLC: RME dan Qlickhub

**Status:** Baseline dokumentasi; tidak menambah kebijakan atau klaim runtime
**Tanggal audit:** 2026-09-24
**Scope:** Struktur dokumentasi dan proses delivery yang dapat diverifikasi dari repository RME dan repository lokal Qlickhub.
**Tidak termasuk:** Audit implementasi produksi, validitas integrasi BPJS/SATUSEHAT, kepatuhan klinis, atau penilaian personal.

## 1. Cara membaca hasil

Qlickhub adalah pembanding untuk **kelengkapan artefak SDLC**, bukan template yang boleh disalin mentah ke RME. RME memiliki risiko klinis, data sensitif, dan integrasi kesehatan yang membutuhkan bukti dan keputusan berbeda.

- **Setara:** RME sudah memiliki artefak dengan tujuan yang sebanding.
- **Sebagian:** Fondasi ada, tetapi hubungan, ownership, atau batas operasional belum terdokumentasi lengkap.
- **Belum ada:** Tidak ditemukan artefak kanonik di repository RME pada audit ini. Ini bukan bukti bahwa kemampuan runtime tidak ada; statusnya harus dikonfirmasi sebelum dibuat claim.

## 2. Sumber yang dibandingkan

| Pembanding Qlickhub | Sumber RME yang diperiksa |
| --- | --- |
| `docs/0_PRODUCT_KNOWLEDGE_MAP.md` | `docs/DEV_HUB.md`, `docs/GOVERNANCE.md`, dan peta baru `docs/SDLC_KNOWLEDGE_MAP.md` |
| `docs/1_ARCHITECTURE.md` | `docs/ARCHITECTURE_AND_STACK.md`, `docs/DATABASE_SCHEMA.md`, `docs/API_CONTRACT.md`, ADR |
| `docs/2_WORKFLOW_AND_ROLES.md` | `docs/FEATURE_WORKFLOW.md`, `docs/GOVERNANCE.md`, feature DRD/TODO |
| `docs/3_UI_ATOMIC_DESIGN_SYSTEM.md` | `docs/UI_UX_DESIGN_SYSTEM.md`, `docs/FRONTEND_ARCHITECTURE.md` |
| `docs/4_AGENT_DEV_GUIDELINES.md` dan `AGENTS.md` | `AGENTS.md`, `docs/GOVERNANCE.md`, `docs/CODE_STANDARDS.md`, `docs/AI_WORKFLOW.md` |
| `docs/POLICY_REGISTRY.md` | Registry dokumen di `docs/GOVERNANCE.md` dan ADR |
| `docs/DEPLOYMENT_AND_ENVIRONMENTS.md` | README, `package.json`, scripts migrasi/backup; tidak ditemukan runbook setara |
| Feature card, test evidence, bug/retest, release record | Feature DRD/TODO dan Evidence ledger |

## 3. Perbandingan

| Area SDLC | Qlickhub | Kondisi RME saat audit | Status | Implikasi aman |
| --- | --- | --- | --- | --- |
| Peta pengetahuan dan urutan baca | Satu product knowledge map dengan jalur baca per peran dan graph traceability | Developer Hub dan Governance sudah menjadi entry point; jalur lintas-peran belum terkonsolidasi | Sebagian → ditutup pada level navigasi oleh `SDLC_KNOWLEDGE_MAP.md` | Peta baru hanya indeks; sumber kanonik tetap tidak berubah |
| Hierarki sumber dan ADR | SSoT berlapis serta ADR terindeks | Governance memiliki urutan otoritas, registry dokumen, dan ADR | Setara | Pertahankan keputusan tahan lama dalam ADR, bukan laporan/evidence |
| Dokumen per fitur | Feature Knowledge Card lintas peran | DRD + TODO FE/BE + registry + Evidence ledger | Setara | RME sudah lebih eksplisit untuk requirement dan evidence ID per fitur |
| Traceability kebutuhan–bukti | Requirement → AC → task → test/run → bug/retest → release decision | `REQ → TODO → kontrak/ADR → EV` ditambah konvensi optional `TC`/`BUG`, retest, dan release snapshot di DRD | Sebagian | Konvensi dokumentasi sudah ada; tidak ada Test Case/Test Run, Bug/retest, atau release record persisten |
| Peran delivery dan separation of duties | Matrix Owner/Admin/PO/Dev/QA, execution boundaries, break-glass | Matrix scope/implementasi/verifier/release owner dan limitation same-person review sudah didokumentasikan | Sebagian | Ini bukan RBAC atau break-glass aplikasi; perubahan authorization memerlukan ADR/implementasi terpisah |
| Test strategy dan evidence | Test Case version, scoped Test Run, immutable result/evidence manifest | Validation matrix, DRD ledger, test-case format, dan evidence release snapshot tersedia | Sebagian | Tidak ada taxonomi atau persistence runtime Qlickhub; `PASS` hanya berasal dari Evidence ledger |
| Defect dan independent retest | Bug lifecycle, developer fix, QA retest, immutable chronology | Log `BUG` dan retest dokumenter tersedia di DRD | Sebagian | Issue tracker dan independent verifier nyata belum dipilih/dibuktikan |
| Release readiness | QA sign-off dan PO release decision dari snapshot bukti | Release owner responsibility, release record, and preflight are documented | Sebagian | Nama release owner dan environment deployment harus dicatat per release; belum ada approval/deployment evidence |
| Environment dan deployment | Local/preview/production, secret boundary, preflight, rollback | Runbook environment/release/recovery tersedia dan memisahkan configured dari `NOT AVAILABLE` | Sebagian | Target staging/production, deployment platform, dan recovery test belum tercatat |
| Kualitas dokumentasi otomatis | `docs:check` menjadi gate CI | Workflow GitHub Actions menjalankan docs, build, type check, dan test | Sebagian | Eksekusi workflow di GitHub dan database test environment belum dibuktikan; test skip tidak dianggap pass |
| Policy registry ber-ID stabil | Registry ID menunjuk aturan kanonik | Registry ID yang hanya menautkan sumber kanonik tersedia | Setara pada level dokumentasi | Registry tidak membuktikan runtime enforcement |
| Handoff dan laporan delivery | Template report dengan command/evidence | Template handoff menyatukan traceability, validation, release record, and next action | Setara pada level template | Handoff nyata tetap perlu diisi dengan actual evidence |
| Klinis, privasi, dan integrasi kesehatan | Tidak menjadi domain utama Qlickhub | RME memiliki STARKES, BPJS, SATUSEHAT, database audit, dan safety gate | Lebih ketat pada dokumen domain | Perlu tetap diprioritaskan daripada mengejar paritas proses umum |

## 4. Yang sudah siap dipakai sekarang

1. Mulai fitur dengan DRD dan TODO FE/BE, lalu rujuk `REQ-###` serta `EV-###`.
2. Catat assumption dan blocker; jangan mengganti bukti yang tidak tersedia dengan klaim lulus.
3. Gunakan ADR untuk keputusan tahan lama dan perbarui kontrak/domain pada perubahan boundary.
4. Jalankan `npm run check:docs` setelah perubahan dokumentasi, serta type check/build/test sesuai matriks perubahan.
5. Gunakan [Peta Pengetahuan SDLC](SDLC_KNOWLEDGE_MAP.md) untuk menemukan sumber dan memisahkan status fitur dari status rilis.
6. Untuk feature dengan QA/release formal, gunakan [Workflow & Peran Delivery](SDLC_WORKFLOW_AND_ROLES.md), [QA Traceability](QA_TRACEABILITY.md), dan [template handoff](templates/DELIVERY_HANDOFF_TEMPLATE.md).
7. Gunakan [runbook environment/release](DEPLOYMENT_AND_ENVIRONMENTS.md) dan [incident/hotfix](INCIDENT_AND_HOTFIX.md), sambil menulis `NOT AVAILABLE` untuk kontrol operasional yang belum terbukti.

## 5. Backlog rekomendasi — membutuhkan keputusan pemilik

Prioritas berikut bukan aturan aktif. Setiap item yang mengubah authorization, data lifecycle, deployment, quality gate, atau tooling memerlukan pemilik keputusan dan ADR sesuai Governance.

| Prioritas | Keputusan/deliverable yang diperlukan | Mengapa | Bukti minimum sebelum diberlakukan |
| --- | --- | --- | --- |
| P0 | Tetapkan nama release owner, target environment/deployment, serta jalur eskalasi operasional | Template/rule sudah tersedia, tetapi tidak dapat melakukan release atau containment tanpa pemilik dan control nyata | Release record terisi, preflight/rollback diuji pada environment jelas, bukti ter-redaksi |
| P0 | Jalankan CI dengan database disposable yang sudah didefinisikan dan catat hasil test sebenarnya | Workflow kini mendefinisikan PostgreSQL `rme_test`, tetapi belum ada run remote yang dapat diperiksa | URL/run ID, migrasi, pass/fail/skip count, dan bukti audit/authorization sesuai scope |
| P1 | Pilih issue tracker atau putuskan DRD tetap menjadi defect log kanonik | Konvensi `BUG` ada, tetapi belum ada system-of-record lintas fitur | ADR, ownership, retention/audit, dan contoh traceability hingga retest |
| P1 | Jalankan workflow CI di GitHub dan review hasilnya | Workflow telah ditambahkan tetapi belum memiliki evidence eksekusi remote | Run URL/ID, command result, warnings, skipped tests, dan remediation bila gagal |
| P2 | Tunjuk verifier independen untuk perubahan risiko tinggi dan daftar incident contacts/control yang tersedia | Dokumentasi tidak dapat menggantikan separation of duties atau on-call/containment nyata | DRD/handoff mencatat orang/control dan latihan/simulasi ter-redaksi |

## 6. Keputusan yang sengaja tidak dibuat audit ini

- Tidak memilih platform deployment, issue tracker, atau model approval rilis.
- Tidak menetapkan role aplikasi baru, break-glass flow, maupun perubahan authorization.
- Tidak menyatakan BPJS, SATUSEHAT, database, backup, migration, CI, atau rollback telah berhasil di environment mana pun.
- Tidak menyamakan dokumentasi Qlickhub dengan kebutuhan regulasi klinis RME.

## 7. Kesimpulan

RME sekarang memiliki baseline dokumentasi untuk peran delivery, QA traceability, release/environment, incident/hotfix, policy registry, handoff, dan CI. Gap yang tersisa adalah **operasional**, bukan sekadar dokumen: pemilik nyata, environment/test database, deployment, tracker, dan bukti eksekusi harus ditetapkan serta direkam sebelum ada klaim rilis atau produksi.
