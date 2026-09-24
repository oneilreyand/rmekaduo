# ADR 0004: Data bersama dalam organisasi induk dengan akses bercakup cabang

- **Status:** Accepted
- **Date:** 2026-09-23
- **Decision owners:** Product owner dan repository maintainers
- **Feature:** `organization-platform`

## Context

Kaduo harus dapat melayani beberapa cabang di bawah satu organisasi induk. Pasien dan tenaga medis tidak boleh dibuat ulang hanya karena dilayani atau bertugas pada cabang berbeda, namun akses dan aktivitas klinis tetap harus dapat dibatasi dan ditelusuri per cabang.

Implementasi saat ini memakai data in-memory tanpa batas organisasi/cabang, autentikasi, otorisasi, atau persistence yang dapat diuji. Kontrak lama juga menyebut `X-Faskes-ID` dari request client; header dari client bukan bukti hak akses cabang.

## Decision

1. **Organisasi induk** adalah batas isolasi data utama. Tidak ada pembacaan atau penulisan data lintas organisasi tanpa keputusan dan kontrak eksplisit baru.
2. **Cabang** adalah fasilitas pelayanan di bawah tepat satu organisasi induk dan menjadi konteks setiap kunjungan, antrean, aktivitas audit, serta penugasan kerja.
3. **Pasien** memiliki satu rekam identitas kanonik per organisasi induk. Cabang tidak memiliki salinan master pasien; setiap kunjungan menyimpan `branch_id`. Pencarian kandidat duplikat tidak boleh otomatis menggabungkan data tanpa prosedur yang diaudit.
4. **Tenaga medis/practitioner** memiliki satu profil kanonik per organisasi induk. Penugasan ke cabang, poli, jadwal, dan kewenangan disimpan terpisah serta memiliki masa berlaku/status aktif.
5. **Akun login** dan **person/practitioner** dipisahkan. Hak akses diberikan melalui assignment role/permission dengan scope organisasi atau cabang, mengikuti least privilege dan default-deny.
6. Konteks organisasi dan cabang berasal dari session/token yang diverifikasi server-side, lalu diverifikasi kembali pada service/repository/database boundary. `X-Faskes-ID` boleh menjadi petunjuk permintaan yang tervalidasi terhadap session, bukan sumber otoritas.
7. Record klinis, kunjungan, dan audit tidak dipindah/digandakan antar cabang secara implisit. Akses lintas cabang di dalam organisasi dicatat pada audit trail dan tunduk pada role yang disetujui.

Non-goal: keputusan ini tidak mengaktifkan SSO, P-Care, V-Claim, Antrol, SATUSEHAT, atau berbagi pasien antar organisasi.

## Evidence

- User requirement, 2026-09-23: satu organisasi induk dengan banyak cabang; pasien dan tenaga medis bersifat bersama tanpa duplikasi.
- `docs/features/patient-registration/DRD.md`: registration membutuhkan persistence, authorization, audit, dan master data.
- `docs/GOVERNANCE.md` dan `docs/FEATURE_WORKFLOW.md`: perubahan data/authorization membutuhkan ADR dan evidence terukur.
- [Permenkes 24 Tahun 2022](https://jdih.kemkes.go.id/common/dokumen/2022permenkes024.pdf): penyelenggaraan RME perlu menjaga keamanan, kerahasiaan, keutuhan, dan ketersediaan data.
- [SATUSEHAT Organization](https://satusehat.kemkes.go.id/platform/docs/id/fhir/resources/organization/) dan [Prerequisites](https://satusehat.kemkes.go.id/platform/docs/id/fhir/prerequisites/): organisasi induk, suborganisasi, lokasi, patient, dan practitioner menjadi data referensi interoperabilitas.

## Alternatives considered

1. Salin master pasien dan tenaga medis pada setiap cabang. Ditolak: memicu duplikasi, konflik, dan risiko keselamatan saat riwayat tidak lengkap.
2. Satu database tanpa organization/branch scope. Ditolak: tidak ada isolasi tenant atau audit akses cabang yang memadai.
3. Percayai `X-Faskes-ID` dari browser. Ditolak: nilai client dapat dimanipulasi dan bukan otorisasi.
4. Satu role statis pada akun. Ditolak: seorang tenaga kerja dapat memiliki peran/penugasan berbeda per cabang atau poli.

## Consequences

- Seluruh tabel domain baru harus membawa `organization_id`; data operasional cabang membawa `branch_id`.
- Migrations, query, caching, job, audit, dan API contract harus memiliki scope organisasi/cabang yang eksplisit.
- Penggabungan kandidat pasien, pemindahan cabang, deaktivasi penugasan, dan akses lintas cabang memerlukan workflow dan audit, bukan operasi diam-diam.
- Data model lama, API contract, dan UI demo tidak boleh dianggap sudah mematuhi keputusan ini sampai dimigrasikan serta diuji.

## Implementation and validation links

- [DRD platform organisasi](../features/organization-platform/DRD.md)
- [TODO backend](../features/organization-platform/be/TODO.md)
- [TODO frontend](../features/organization-platform/fe/TODO.md)
- [DRD pendaftaran pasien](../features/patient-registration/DRD.md)
- Validation command: `npm run check:docs`
