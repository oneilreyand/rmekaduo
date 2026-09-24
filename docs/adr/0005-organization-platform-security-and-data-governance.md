# ADR 0005: Paket keputusan keamanan, otentikasi, dan tata kelola data platform multi-cabang

- **Status:** Proposed
- **Date:** 2026-09-23
- **Decision owners:** Product owner, security lead, compliance/legal lead, platform/DBA lead
- **Decision brief:** [Ringkasan Keputusan ADR 0005 (Decision Brief)](0005-decision-brief.md)
- **Feature:** `organization-platform`

## Context

Sesuai ADR 0004, RME dirancang agar satu organisasi induk dapat mengelola banyak cabang fasilitas pelayanan kesehatan dengan profil pasien dan tenaga medis kanonik per organisasi induk, sedangkan kunjungan, antrean, dan aktivitas operasional terikat pada cabang.

Implementasi kode sebelumnya (`src/server/db/data-store.ts`, `src/app/api/v1/`) masih menggunakan penyimpanan in-memory tanpa batas organisasi, autentikasi server-side, kontrol akses role/permission, perlindungan sesi, retensi terjamin, ataupun audit trail immutable. Kontrak lama juga mengandalkan header client `X-Faskes-ID` yang dapat dimanipulasi di browser.

Sebelum runtime database PostgreSQL (P1) atau layanan autentikasi (P2) dibangun, diperlukan paket keputusan arsitektur keamanan yang mengikat untuk mencegah tebakan implementasi, kebocoran data medis antar-organisasi/cabang, modifikasi rekam medis tanpa hak, dan penggabungan identitas pasien yang keliru.

## Proposed decision

Dokumen ini mengajukan tujuh keputusan keamanan dan tata kelola data berikut. Ia belum mengikat sampai pemilik keputusan menyetujui setiap keputusan material, terutama MFA/recovery, akses rekam medis lintas cabang, retensi, RLS, dan target pemulihan.

### 1. Identity Provider & Session Management
- **Arsitektur Autentikasi:** Menggunakan authentication engine internal berbasis kredensial aman di PostgreSQL pada tahap awal, dengan desain interface yang kompatibel untuk federasi IdP eksternal (OIDC/OAuth2/SAML) di masa mendatang.
- **Penyimpanan Sesi:** Sesi dikelola sepenuhnya di sisi server (*stateful session table* di PostgreSQL). Token sesi berukuran 256-bit berentropi tinggi, disimpan pada browser melalui cookie `HttpOnly`, `Secure`, `SameSite=Strict`.
- **Payload & Resolusi Konteks:** Setiap request memuat session token yang divalidasi server menjadi konteks runtime: `account_id`, `organization_id`, dan `active_branch_id` (berasal dari penugasan valid). Header `X-Faskes-ID` / `X-Branch-ID` dari client hanya diperlakukan sebagai petunjuk (hint) yang wajib dicocokkan dengan cabang yang diizinkan dalam sesi; ia tidak pernah menjadi sumber otoritas.
- **Masa Berlaku & Pembatalan:** *Idle session timeout* 30 menit; *absolute session timeout* 12 jam. Logout langsung membatalkan sesi di database secara sinkron.

### 2. Multi-Factor Authentication (MFA)
- **Kewajiban Peran:** MFA bersifat **wajib (mandatory)** sejak awal bagi peran dengan akses istimewa atau akses data rekam medis luas (`SUPER_ADMIN`, `ORG_ADMIN`, `DOKTER`, `REKAM_MEDIS`).
- **Masa Transisi Staf Non-Klinis:** Peran staf operasional non-klinis (`PENDAFTARAN`, `KASIR`, `FARMASI`) diberikan masa transisi (grace period) tanpa kewajiban MFA pada awal peluncuran untuk memastikan kelancaran operasional loket.
- **Metode yang Didukung:** Time-based One-Time Password (TOTP, RFC 6238) via aplikasi autentikator standar dan WebAuthn/FIDO2. Menolak pengiriman kode OTP via SMS atau WhatsApp sebagai faktor autentikasi utama karena kerentanan *SIM swapping* dan ketidakstabilan pengiriman.
- **Recovery Codes:** Pengguna yang mengaktifkan MFA diberikan 8 kode pemulihan sekali pakai (*single-use hashed backup codes*) yang disimpan ter-hash (SHA-256) di database.

### 3. Account Recovery & Operator Bootstrap
- **Operator Bootstrap Awal:** Inisialisasi Organisasi Induk pertama dan Akun Super Administrator dilakukan melalui CLI command aman (`npm run seed:bootstrap`) yang menghasilkan token aktivasi sekali pakai pada terminal console lokal; dilarang menggunakan kredensial default atau hardcoded di kode sumber/migrasi.
- **Pemulihan Akun Mandiri (Self-Service):** Tenaga medis dan staf diizinkan melakukan *self-service password reset* melalui email terverifikasi dengan token sekali pakai bertenggat waktu ketat (15 menit). Opsi reset administratif oleh `ORG_ADMIN` tetap tersedia sebagai jalur sekunder; password sementara wajib langsung diganti pada saat login pertama.
- **Akses Darurat (Break-Glass):** Prosedur darurat untuk kondisi bencana sistem/kematian akses jaringan memerlukan persetujuan dua otorisator dan setiap tindakannya memicu audit event tingkat darurat (`EMERGENCY_AUDIT_LOG`).

### 4. Role Matrix, Permission Assignment & Scope Cabang (Default-Deny)
- **Pemisahan Entitas:** Memisahkan secara ketat antara `Account` (kredensial login), `Practitioner` (identitas profil nakes), dan `RoleAssignment` (penugasan peran).
- **Model Hak Akses:** Menggunakan Role-Based Access Control dengan izin eksplisit (*RBAC + granular permissions*) dan prinsip *default-deny*. Setiap request yang tidak memiliki permission spesifik ditolak (`403 Forbidden`).
- **Hierarki Cakupan:**
  - *Organization-level roles:* `SUPER_ADMIN`, `ORG_ADMIN`, `COMPLIANCE_AUDITOR` (memiliki akses tata kelola di seluruh cabang dalam organisasi induk).
  - *Branch-level roles:* `DOKTER_CABANG`, `PERAWAT_CABANG`, `ADMISI_CABANG`, `FARMASI_CABANG`, `KASIR_CABANG`, `REKAM_MEDIS_CABANG` (beroperasi di cabang tempat penugasan aktif).
- **Akses Rekam Medis Lintas Cabang (Cross-Branch RME Visibility):**
  - Profil master pasien kanonik dapat dicari di seluruh cabang dalam satu organisasi untuk mencegah rekam ganda.
  - Tenaga medis di suatu cabang **diberikan hak membaca riwayat rekam medis (kunjungan, CPPT, diagnosa, dan terapi) dari cabang lain dalam organisasi induk yang sama**, agar riwayat kesehatan pasien utuh dan dapat dijadikan acuan penanganan lanjutan rujukan internal antarcabang.
  - Setiap akses baca rekam medis lintas cabang dicatat secara otomatis dalam audit log (`CROSS_BRANCH_ACCESS`) dengan merekam identitas nakes, waktu, cabang asal, cabang target kunjungan, dan ID kunjungan.

### 5. Duplicate Candidate Review & Larangan Merge Otomatis
- **Prinsip Utama:** TIDAK ADA penggabungan (*merge*) atau duplikasi otomatis master pasien.
- **Deteksi Kandidat Duplikat:** Pasien baru yang mendaftar dievaluasi terhadap master pasien organisasi berdasarkan:
  - Kesamaan NIK (16 digit persis); ATAU
  - Kesamaan kombinasi: Nama Lengkap (metode Levenshtein/Trigram similarity > 0.85) + Tanggal Lahir + Jenis Kelamin + Nomor Kontak.
- **Alur Peninjauan (Review Workflow):**
  - Jika terdeteksi potensi duplikasi, sistem menandai kedua rekam sebagai `DUPLICATE_CANDIDATE`.
  - Pasien baru tidak langsung ditolak jika butuh pelayanan segera, namun rekam diberi status *flagged*.
  - Hanya petugas berwenang (`REKAM_MEDIS` atau `ORG_ADMIN`) yang dapat membuka antrean peninjauan duplikat untuk memverifikasi dokumen fisik/identitas resmi pasien.
- **Resolusi Duplikat:**
  - `CONFIRMED_SAME`: Satu profil ditetapkan sebagai master kanonik; profil sekunder ditandai `MERGED_INTO` (merujuk ID master kanonik). Seluruh riwayat kunjungan masa lalu tetap tersimpan utuh dan teraudit; tidak ada data yang dihapus (*hard delete*).
  - `CONFIRMED_DIFFERENT`: Pasangan identitas ditandai sebagai `FALSE_POSITIVE` dengan catatan verifikasi resmi agar tidak memunculkan peringatan duplikat berulang.

### 6. Data Isolation, RLS, dan Kebijakan Retensi
- **Isolasi Data (Multi-Tenant):** Seluruh tabel domain dan operasional wajib memiliki foreign key `organization_id`. Seluruh data operasional fasilitas (kunjungan, poli, antrean, jadwal) wajib memiliki `branch_id`.
- **Row-Level Security (RLS):** Database PostgreSQL mengaktifkan Row-Level Security pada tabel sensitif untuk memastikan boundary query tidak dapat melintasi tenant organisasi sekalipun terjadi cacat logika aplikasi.
- **Kebijakan Retensi:** Mematuhi Permenkes No. 24 Tahun 2022:
  - Resume medis, ringkasan pulang, dan persetujuan tindakan disimpan sekurang-kurangnya 25 tahun sejak tanggal pembuatan.
  - Berkas rekam medis non-resume disimpan sekurang-kurangnya 5 tahun sejak kunjungan terakhir.
  - Data yang melewati masa retensi tidak dihapus sembarangan, melainkan dipindahkan ke arsip dingin (*cold storage*) atau dimusnahkan melalui berita acara resmi sesuai ketentuan hukum.
- **Immutabilitas Audit Trail:** Tabel `audit_logs` diberi pembatasan tingkat database (larangan hak `UPDATE` dan `DELETE` bagi aplikasi). Setiap kejadian otentikasi, autorisasi ditolak, pembacaan lintas cabang, dan perubahan data pasien dicatat dengan `ip_address`, `actor_id`, `organization_id`, `branch_id`, dan `correlation_id`.

### 7. Backup, Disaster Recovery, dan Rencana Kelangsungan
- **Strategi Backup:**
  - Backup fisik: *Continuous WAL Archiving* dengan Point-in-Time Recovery (PITR).
  - Backup logis: Dump terjadwal harian (*daily automated pg_dump*) yang dienkripsi (AES-256) dan disimpan pada lokasi sekunder terpisah secara geografis.
- **Parameter Pemulihan:**
  - Recovery Point Objective (RPO): < 1 jam data loss maksimal pada insiden katastropik.
  - Recovery Time Objective (RTO): < 4 jam waktu pemulihan layanan ke kondisi operasional.
- **Uji Pemulihan:** Pengujian restore berkala ke environment disposable wajib dijalankan sekurang-kurangnya setiap kuartal dan diverifikasi integritasnya sebelum rilis produksi.

## Evidence

- `docs/features/organization-platform/DRD.md`: `REQ-001`, `REQ-002`, `REQ-003`, `REQ-004`, `REQ-005`, `REQ-008`, `BLOCKER-001` s/d `BLOCKER-004`, dan `EV-005`.
- `docs/adr/0004-organization-scoped-multi-branch-data.md`: Menetapkan organisasi sebagai batas data dan cabang sebagai lingkup akses operasional.
- Keputusan pengguna eksplisit untuk paket ini belum direkam dalam ADR. Persetujuan tertulis diperlukan sebelum status diubah menjadi `Accepted`.
- `docs/GOVERNANCE.md` Bagian 1, 3, dan 7: Keputusan otorisasi, keamanan data, retensi, dan persistensi wajib melalui ADR yang teruji.
- [Permenkes 24 Tahun 2022 tentang Rekam Medis](https://jdih.kemkes.go.id/common/dokumen/2022permenkes024.pdf): Kewajiban keamanan, kerahasiaan, keutuhan data, dan masa retensi minimal 25 tahun untuk resume medis.
- [UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)](https://peraturan.go.id/id/uu-no-27-tahun-2022): Kewajiban pemrosesan data spesifik/kesehatan dengan persetujuan, prinsip minimalisasi data, kerahasiaan, dan audit trail.

## Alternatives considered

1. **Menggunakan JWT stateless murni tanpa session table:** Ditolak karena JWT stateless tidak dapat dicabut (*revoked*) secara instan jika akun diretas atau hak akses diubah mendadak, yang berbahaya bagi sistem data medis.
2. **Mengizinkan merge pasien secara otomatis bila NIK sama:** Ditolak karena rentan kesalahan input oleh petugas di loket pendaftaran yang dapat berakibat fatal (riwayat alergi atau rekam medis tertukar).
3. **Membatasi rekam medis hanya di cabang asal tanpa visibilitas cabang lain:** Ditolak oleh pemilik keputusan: tenaga medis memerlukan riwayat rekam medis pasien yang utuh antar-cabang dalam organisasi yang sama sebagai acuan penanganan lanjutan.
4. **MFA berbasis SMS/WhatsApp OTP:** Ditolak karena biaya operasional tinggi, dependensi pihak ketiga penyedia pesan, dan kerentanan keamanan terhadap *SIM swap* atau *interception*.
5. **Mengandalkan header `X-Faskes-ID` dari client browser:** Ditolak karena header HTTP dari browser dapat dimanipulasi dengan mudah oleh penyerang.

## Consequences

- Keputusan P0 belum mengikat. Implementasi yang sudah ada hanya prototype keamanan dan tidak boleh dinyatakan production-ready.
- Milestone `P1 — Data foundation` dan `P2 — Identity & access` tetap memerlukan validasi ulang terhadap RLS, route enforcement, recovery, dan test database disposable.
- Implementasi backend wajib menyediakan tabel `sessions`, `accounts`, `roles`, `permissions`, `role_assignments`, `patient_duplicate_candidates`, dan `audit_logs` yang *append-only*.
- Setiap API endpoint harus mengonsumsi konteks organisasi dan cabang yang divalidasi oleh session middleware, bukan dari parameter body atau header bebas.
- UI tidak boleh menyediakan tombol "Gabungkan Pasien" otomatis; UI wajib menyediakan alur tinjauan duplikat bagi petugas rekam medis yang berwenang.

## Implementation and validation links

- [DRD Platform Organisasi](../features/organization-platform/DRD.md)
- [TODO Backend Platform Organisasi](../features/organization-platform/be/TODO.md)
- [TODO Frontend Platform Organisasi](../features/organization-platform/fe/TODO.md)
- [ADR 0004: Data bersama organisasi multi-cabang](0004-organization-scoped-multi-branch-data.md)
- [Ringkasan Keputusan ADR 0005 (Decision Brief)](0005-decision-brief.md)
- Perintah validasi dokumentasi: `npm run check:docs`
