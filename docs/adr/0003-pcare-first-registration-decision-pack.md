# ADR 0003: Paket keputusan pendaftaran P-Care-first

- **Status:** Proposed
- **Date:** 2026-09-23
- **Decision owners:** Product owner, compliance owner, operations/facility owner, dan BPJS integration PIC
- **Feature:** `patient-registration`

## Context

Kaduo ingin memulai dari fondasi pendaftaran lokal lalu, bila relevan, memakai P-Care sebagai integrasi BPJS pertama. Repository belum membuktikan apakah Kaduo adalah FKTP atau FKRTL, belum memiliki kode faskes/poli/provider yang disetujui, dan belum memiliki sandbox BPJS yang terverifikasi. Master faskes, poli, tenaga medis, jadwal, role, persistence, authorization, dan audit juga belum tersedia sebagai perilaku runtime yang teruji.

Pilihan ini memengaruhi data pasien, izin akses, audit, kontrak eksternal, dan perilaku pendaftaran. Karena itu ia tidak boleh ditetapkan dari UI, mock, nilai default, atau asumsi implementasi.

## Decision proposed for acceptance

ADR ini **belum memilih** FKTP atau FKRTL dan tidak mengaktifkan provider apa pun. Ia meminta satu paket keputusan tertulis berikut sebelum M0 dapat selesai dan sebelum M1/M3 dimulai:

1. **Jenis fasilitas dan jalur JKN** — pilih salah satu: FKTP dengan P-Care-first, atau FKRTL dengan jalur yang disetujui; nyatakan apakah V-Claim dan Antrol berada di scope tranche pertama, ditunda, atau di luar scope.
2. **Master data dan ownership** — tetapkan pemilik bisnis untuk faskes, poli, tenaga medis/practitioner, jadwal, dan role admisi; tetapkan sumber data resmi, proses perubahan, dan siapa yang menyetujui aktivasi/nonaktifnya record.
3. **Credential boundary** — tetapkan pemilik credential, secret manager/environment yang disetujui, prosedur rotation/revocation, sandbox/allowlist, test account, dan larangan credential pada browser, source, fixture, log, atau evidence.
4. **Lifecycle lokal versus provider** — setujui bahwa pendaftaran lokal, eligibility BPJS, pendaftaran provider, antrean, dan SATUSEHAT adalah status terpisah. Kegagalan/timeout provider tidak menghapus pendaftaran lokal dan tidak boleh berubah menjadi sukses simulasi.
5. **Persetujuan dan evidence** — tetapkan Product owner, compliance owner, facility owner, dan BPJS PIC yang harus menyetujui keputusan; catat keputusan final, versi kontrak resmi, dan evidence sandbox ter-redaksi pada DRD sebelum klaim integrasi.

Sampai butir tersebut disetujui, feature tetap `DISCOVERY` dan pekerjaan provider tetap `BLOCKED`.

## Evidence

- `docs/features/patient-registration/DRD.md`: `REQ-001`, `REQ-005`, `REQ-006`, `REQ-008`, `BLOCKER-001` sampai `BLOCKER-004`, dan `EV-006`.
- `docs/features/bpjs-bridging/DRD.md`: mode provider, credential, retry/idempotency, dan evidence sandbox masih `DISCOVERY`/`OPEN`.
- `docs/GOVERNANCE.md` section 3 dan 7: keputusan integrasi, data, authorization, dan credential memerlukan ADR serta evidence yang dapat diulang.
- `docs/BPJS_BRIDGING.md`: referensi internal yang masih membutuhkan verifikasi terhadap kontrak BPJS resmi oleh PIC; bukan bukti akses provider.

## Alternatives considered

1. Menetapkan FKTP/P-Care dari tampilan “Klinik Pratama” atau default kode faskes. Ditolak: UI/default bukan keputusan operasional atau bukti provider.
2. Mengimplementasikan master dan pendaftaran langsung dengan nilai faskes/dokter contoh. Ditolak: menambah asumsi klinis, ownership, dan data tanpa persetujuan.
3. Mengaktifkan P-Care/V-Claim/Antrol bersamaan. Ditunda: scope provider tergantung jenis fasilitas, kredensial, dan kontrak resmi.
4. Menunggu semua kredensial sebelum menyiapkan dokumentasi keputusan. Ditolak: keputusan scope, ownership, dan safety dapat diputuskan tanpa secret atau data pasien.

## Consequences

- Tidak ada endpoint, UI, atau adapter yang boleh mengklaim P-Care, V-Claim, Antrol, atau sandbox siap berdasarkan ADR ini.
- M1 hanya dapat melanjutkan setelah paket keputusan diterima; implementasi harus memakai master persistence/audit/authorization yang tervalidasi dan fixture yang diberi label sintetis.
- M3 hanya dapat dimulai setelah mode FKTP/P-Care-first diterima, contract resmi diverifikasi, dan sandbox/credential boundary tersedia.
- Penolakan atau perubahan proposal ini harus direkam sebagai ADR berikutnya atau pembaruan ADR ini, lalu direkonsiliasi di DRD/TODO.

## Implementation and validation links

- [DRD pendaftaran pasien](../features/patient-registration/DRD.md)
- [TODO backend pendaftaran](../features/patient-registration/be/TODO.md)
- [DRD bridging BPJS](../features/bpjs-bridging/DRD.md)
- [Feature workflow](../FEATURE_WORKFLOW.md)
- [Governance](../GOVERNANCE.md)
- Validasi dokumentasi: `npm run check:docs`
