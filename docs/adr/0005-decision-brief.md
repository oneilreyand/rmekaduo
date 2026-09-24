# Ringkasan Keputusan ADR 0005 (Decision Brief)

- **Dokumen Referensi:** [ADR 0005: Paket keputusan keamanan, otentikasi, dan tata kelola data platform multi-cabang](0005-organization-platform-security-and-data-governance.md)
- **Status ADR Saat Ini:** `Proposed` (Menunggu Keputusan)
- **Target Pembaca:** Product Owner, Security Lead, Compliance/Legal Lead, Platform/DBA Lead
- **Fitur Terkait:** [DRD Platform Organisasi](../features/organization-platform/DRD.md)
- **Tanggal:** 2026-09-23

---

## Tujuan Dokumen

Dokumen ini menyajikan butir-butir keputusan material dalam ADR 0005 dalam bentuk ringkas (*decision brief*) agar para pemilik keputusan dapat memberikan persetujuan eksplisit atau meminta revisi terarah. 

> [!IMPORTANT]
> Milestone **P1 (Data Foundation)** dan **P2 (Identity & Access)** telah selesai divalidasi pada tingkat prototype (`VALIDATED (prototype)`). Milestone **P3 (Pendaftaran Pasien & Migrasi Master)** tetap berstatus **`BLOCKED`** sampai seluruh keputusan material di bawah ini diputuskan secara resmi oleh pihak yang berwenang.

---

## Matriks Keputusan yang Memerlukan Persetujuan

### 1. Model Login & Manajemen Sesi Server-Side

| Dimensi | Penjelasan |
|---|---|
| **Keputusan yang Diminta** | 1. Menggunakan authentication engine internal berbasis PostgreSQL (`sessions`) dengan token 256-bit acak.<br>2. Menyimpan sesi di browser via cookie `HttpOnly; Secure; SameSite=Strict`.<br>3. Resolusi konteks server-side pada setiap request (`account_id`, `organization_id`, `active_branch_id`), menolak parameter body/header client sebagai otoritas.<br>4. *Idle timeout* 30 menit, *absolute timeout* 12 jam, dan pembatalan instan saat logout. |
| **Alasan & Dampak Diterima** | Sesi dapat dibatalkan secara instan (*real-time revocation*) saat terjadi kompromi akun, mutasi nakes, atau logout, tanpa kerumitan blacklist token JWT. Query ke tabel `sessions` sudah dioptimalkan indeks dan sliding window terbukti pada prototype. |
| **Risiko Bila Ditunda** | Kontrak sesi antara frontend dan backend belum mengikat; pendaftaran akun nakes dan alur login di P3 tertahan. |
| **Opsi yang Masuk Akal** | - **Opsi A (Rekomendasi):** Stateful session table di PostgreSQL (sederhana, aman, tanpa dependensi infrastruktur baru).<br>- **Opsi B:** Stateless JWT dengan Redis revocation blacklist (memerlukan Redis cluster production yang persisten dan menambah titik kegagalan). |
| **Pihak yang Menyetujui** | **Security Lead** & **Platform/DBA Lead** |

---

### 2. Multi-Factor Authentication (MFA), Pemulihan Akun, & Operator Bootstrap

| Dimensi | Penjelasan |
|---|---|
| **Keputusan yang Diminta** | 1. **Kewajiban MFA:** Bersifat wajib (*mandatory*) bagi peran dengan akses rekam medis luas atau istimewa (`SUPER_ADMIN`, `ORG_ADMIN`, `DOKTER`, `REKAM_MEDIS`). Staf operasional non-klinis loket (`PENDAFTARAN`, `KASIR`, `FARMASI`) diberikan masa transisi (*grace period*).<br>2. **Metode MFA:** TOTP (RFC 6238 via Google Authenticator/kompatibel) dan WebAuthn/FIDO2. Dilarang menggunakan SMS/WhatsApp OTP sebagai faktor utama.<br>3. **Pemulihan Akun:** 8 kode cadangan sekali pakai (*hashed* SHA-256), *self-service password reset* via email terverifikasi (token 15 menit), serta reset administratif oleh `ORG_ADMIN`.<br>4. **Bootstrap Operator:** Inisialisasi Organisasi dan Super Admin pertama melalui CLI console lokal (`npm run seed:bootstrap`) tanpa kredensial bawaan (*hardcoded*). |
| **Alasan & Dampak Diterima** | Melindungi data medis berisiko tinggi dari pengambilalihan akun akibat kebocoran kata sandi, seraya mencegah hambatan antrean fisik di loket admisi. Menghindari biaya berulang pengiriman pesan SMS/WhatsApp OTP pihak ketiga dan risiko *SIM swapping*. |
| **Risiko Bila Ditunda** | Skema tabel profil akun dan alur manajemen nakes di P3 tidak dapat difinalkan. |
| **Opsi yang Masuk Akal** | - **Opsi A (Rekomendasi):** MFA wajib berbasis risiko peran (klinis/admin) via TOTP, transisi untuk loket.<br>- **Opsi B:** MFA wajib untuk seluruh staf tanpa terkecuali sejak hari pertama (potensi kendala operasional loket di faskes dengan keterbatasan perangkat staf).<br>- **Opsi C:** MFA sepenuhnya opsional pada fase 1 (berisiko tinggi terhadap keamanan data pasien). |
| **Pihak yang Menyetujui** | **Security Lead**, **Product Owner**, & **Operations Lead** |

---

### 3. Role Matrix & Hak Akses Rekam Medis Lintas Cabang

| Dimensi | Penjelasan |
|---|---|
| **Keputusan yang Diminta** | 1. Pemisahan entitas `Account`, `Practitioner`, dan `RoleAssignment` dengan model RBAC *default-deny* dan izin granular.<br>2. **Akses Lintas Cabang:** Profil pasien kanonik dapat dicari di seluruh cabang dalam organisasi induk yang sama. Dokter/tenaga medis di suatu cabang diberikan hak membaca riwayat rekam medis (kunjungan, CPPT, diagnosa, terapi) dari cabang lain dalam organisasi induk yang sama untuk kesinambungan perawatan (*continuity of care*).<br>3. Setiap pembacaan rekam medis lintas cabang dicatat secara otomatis dalam audit log (`CROSS_BRANCH_ACCESS`) merekam identitas nakes, waktu, cabang asal, cabang target, dan ID kunjungan. |
| **Alasan & Dampak Diterima** | Pasien yang berobat di beberapa cabang dalam satu klinik group mendapatkan penanganan medis yang akurat dan berkesinambungan (mencegah duplikasi obat berisiko, alergi yang terlewat, atau polifarmasi). Audit trail menjamin akuntabilitas nakes sesuai ketentuan UU No. 27/2022 (UU PDP). |
| **Risiko Bila Ditunda** | Batas akses data antarcabang belum memiliki kejelasan hukum; alur konsultasi dan rujukan internal klinik group terhambat. |
| **Opsi yang Masuk Akal** | - **Opsi A (Rekomendasi):** Akses baca rekam medis lintas cabang otomatis bagi nakes terotorisasi dalam satu organisasi induk disertai audit log wajib.<br>- **Opsi B:** Akses baca lintas cabang memerlukan persetujuan eksplisit pasien (*one-time patient consent code*) saat kunjungan antarcabang.<br>- **Opsi C:** Isolasi total antarcabang (nakes tidak dapat melihat riwayat kunjungan cabang lain tanpa resume rujukan manual). |
| **Pihak yang Menyetujui** | **Compliance/Legal Lead**, **Medical/Clinical Director**, & **Product Owner** |

---

### 4. Deteksi Kandidat Duplikat & Larangan Penggabungan (*Merge*) Otomatis

| Dimensi | Penjelasan |
|---|---|
| **Keputusan yang Diminta** | 1. **Larangan Mutlak Auto-Merge:** Sistem dilarang menggabungkan dua identitas pasien secara otomatis.<br>2. **Kriteria Deteksi:** Pasien baru ditandai sebagai `DUPLICATE_CANDIDATE` jika NIK persis sama (16 digit) ATAU terdapat kemiripan Nama Lengkap (> 0.85) + Tanggal Lahir + Jenis Kelamin + Kontak.<br>3. **Alur Peninjauan:** Pasien berstatus *flagged* tetap dapat dilayani jika mendesak, namun antrean peninjauan dibuka untuk petugas berwenang (`REKAM_MEDIS` / `ORG_ADMIN`).<br>4. **Resolusi Duplikat:** Diputuskan melalui `CONFIRMED_SAME` (satu profil kanonik, profil sekunder ditandai `MERGED_INTO`, riwayat masa lalu tetap ada/non-destruktif) atau `CONFIRMED_DIFFERENT` (`FALSE_POSITIVE`). |
| **Alasan & Dampak Diterima** | Mencegah kekeliruan fatal penanganan medis (misal: riwayat alergi fatal atau transfusi darah tertukar) akibat salah input nomor identitas di loket pendaftaran. Memberikan jalur rekonsiliasi identitas yang aman dan terdokumentasi. |
| **Risiko Bila Ditunda** | P3 tidak memiliki landasan baku untuk memvalidasi pendaftaran pasien baru versus pencarian pasien lama di loket. |
| **Opsi yang Masuk Akal** | - **Opsi A (Rekomendasi):** Deteksi otomatis peringatan duplikasi, larangan auto-merge, verifikasi manual oleh petugas rekam medis.<br>- **Opsi B:** Blokir mutlak pendaftaran bila NIK terdaftar (kendala bila terjadi *typo* NIK atau pasien belum memiliki e-KTP fisik). |
| **Pihak yang Menyetujui** | **Compliance/Legal Lead** & **Product Owner** |

---

### 5. Retensi Data, Row-Level Security (RLS), Audit Trail, Backup, RPO & RTO

| Dimensi | Penjelasan |
|---|---|
| **Keputusan yang Diminta** | 1. **Retensi Data:** Resume medis disimpan sekurang-kurangnya 25 tahun; rekam non-resume sekurang-kurangnya 5 tahun sejak kunjungan terakhir (sesuai Permenkes 24/2022). Data kadaluarsa dipindahkan ke *cold storage* atau dimusnahkan dengan berita acara resmi.<br>2. **Row-Level Security:** RLS aktif pada seluruh tabel domain menggunakan parameter sesi `app.current_organization_id` untuk mencegah kebocoran antartenant pada layer database engine.<br>3. **Immutabilitas Audit Trail:** Tabel `audit_logs` dilarang `UPDATE` dan `DELETE` di level database engine.<br>4. **Backup & DR:** *Continuous WAL Archiving* (PITR) + dump harian terenkripsi (AES-256) pada lokasi geografis sekunder.<br>5. **Parameter Pemulihan:** RPO < 1 jam, RTO < 4 jam. Uji restore berkala ke database disposable setiap kuartal. |
| **Alasan & Dampak Diterima** | Memenuhi kewajiban regulasi hukum rekam medis nasional dan pelindungan data pribadi (UU PDP). Menjamin integritas alat bukti hukum dan kelangsungan operasional klinik saat terjadi kegagalan infrastruktur. |
| **Risiko Bila Ditunda** | Perencanaan arsitektur infrastruktur basis data, kapasitas penyimpanan jangka panjang, dan disaster recovery tidak dapat dianggarkan secara tepat. |
| **Opsi yang Masuk Akal** | - **Opsi A (Rekomendasi):** RLS ketat + append-only audit + PITR WAL kontinu + RPO < 1 jam / RTO < 4 jam.<br>- **Opsi B:** Backup dump harian reguler tanpa PITR kontinu (RPO turun menjadi maksimal 24 jam). |
| **Pihak yang Menyetujui** | **Platform/DBA Lead**, **Compliance/Legal Lead**, & **Security Lead** |

---

### 6. Catatan Khusus: Autentikasi Callback Server-to-Server BPJS Antrol

> [!CAUTION]
> **Keputusan Terpisah (Out of Scope ADR 0005):**
> Endpoint `/api/v1/antrol/*` adalah endpoint penerima callback *server-to-server* dari sistem eksternal BPJS Antrol v2.
> - Callback ini **tidak dapat menggunakan cookie sesi browser**.
> - Mekanisme autentikasi pihak ketiga ini (misalnya *API Key header*, *HMAC request signing*, *mutual TLS*, atau *IP Whitelisting*) **bukan bagian dari ADR 0005** dan memerlukan ADR tersendiri sebelum integrasi bridging live diaktifkan.
> - Pada prototype saat ini, endpoint tersebut dilindungi guard internal untuk keamanan kode dan dicatat sebagai blocker `ASSUMPTION-002` / task `BE-007`.

---

## Tindakan yang Diperlukan dari Pemilik Keputusan

Pemilik keputusan dapat menyetujui seluruh paket atau memberikan instruksi revisi pada butir tertentu menggunakan format keputusan berikut:

```markdown
Persetujuan Paket ADR 0005:
1. Model Login & Sesi: [SETUJU / REVISI: ...]
2. Kebijakan MFA & Pemulihan Akun: [SETUJU / REVISI: ...]
3. Role Matrix & Akses Lintas Cabang: [SETUJU / REVISI: ...]
4. Larangan Auto-Merge & Peninjauan Duplikat: [SETUJU / REVISI: ...]
5. Retensi, RLS, Audit, & Disaster Recovery: [SETUJU / REVISI: ...]
```

Setelah seluruh pihak membubuhkan persetujuan resmi, status ADR 0005 akan dinaikkan menjadi `Accepted`, membuka blokir gerbang **P0**, dan mengizinkan dimulainya implementasi **P3 (Shared Master & Pendaftaran Pasien Persisten)**.
