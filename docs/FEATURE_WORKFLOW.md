# Sistem Kerja Fitur Berbasis Bukti

Dokumen ini adalah satu pintu kerja untuk setiap programmer dan model yang mengubah RME. Ia menjelaskan **bagaimana sebuah fitur direncanakan, dibangun, diuji, dibuktikan, dan ditutup**. Kebijakan keselamatan dan otoritas sumber tetap berada di `GOVERNANCE.md`; standar penulisan kode berada di `CODE_STANDARDS.md`.

Tidak ada fitur yang boleh dianggap selesai hanya karena halaman terlihat benar, kode terkompilasi, atau sebuah agent menuliskan klaim. Status selesai hanya berasal dari bukti yang dapat diulang.

## 1. Struktur wajib

Setiap fitur substantif memiliki satu folder dengan ID yang stabil dan huruf kecil-kebab.

```text
docs/features/<feature-id>/
├── DRD.md       # sumber kebenaran: kebutuhan, keputusan, bukti, dan status fitur
├── fe/TODO.md   # pekerjaan frontend yang diturunkan dari DRD
└── be/TODO.md   # pekerjaan backend yang diturunkan dari DRD
```

Gunakan `docs/features/_template/` saat membuat fitur baru. `DRD.md` adalah dokumen utama yang dibaca manusia. TODO FE dan BE bukan spesifikasi kedua: keduanya hanya memecah pekerjaan yang sudah memiliki ID kebutuhan dari DRD.

Dokumen lama di `docs/evidence/` adalah arsip historis. Pekerjaan baru tidak membuat evidence record terpisah; bukti akhir ditambahkan ke **Evidence ledger** di DRD agar konteks fitur tidak terpecah.

## 2. Siklus hidup dan gerbang

| Status | Syarat masuk | Syarat keluar |
| --- | --- | --- |
| `DISCOVERY` | Folder dan DRD dibuat. | Kebutuhan, sumber, batas scope, dan risiko ditulis. |
| `READY` | Semua kebutuhan memiliki ID dan acceptance test terukur. | TODO FE/BE memiliki pemilik dan urutan; keputusan yang membutuhkan ADR sudah diterima. |
| `IN_PROGRESS` | DRD `READY`. | Implementasi dan TODO berubah bersama. |
| `BLOCKED` | Bukti, keputusan, akses, atau lingkungan yang wajib belum ada. | Penyebab, dampak, dan pihak yang diperlukan tercatat. |
| `VALIDATING` | Implementasi untuk kriteria yang dituju selesai. | Semua bukti wajib dijalankan dan direkam. |
| `VALIDATED` | Semua acceptance criterion lulus atau limitation telah disetujui tertulis. | Review akhir mengonfirmasi scope, dokumen, dan risiko. |
| `RELEASE_READY` | `VALIDATED` dan tidak ada blocker keselamatan/keamanan. | Hanya pemilik rilis dapat mengubah ke `RELEASED`. |

`Complete`, `done`, `ready for production`, `compliant`, atau `integrated` dilarang dipakai sebagai status bebas. Gunakan status di atas dan tulis bukti yang membenarkannya.

## 3. Aturan anti-asumsi

1. Setiap kebutuhan di DRD harus diberi ID `REQ-###`, sumber, pemilik FE/BE, hasil yang dapat diamati, dan metode pembuktian.
2. Jika sumber tidak menentukan perilaku, tulis sebagai `ASSUMPTION-###`. Asumsi yang memengaruhi pasien, data, otorisasi, audit, biaya, routing, kontrak API, atau integrasi **memblokir** fitur sampai ada keputusan pengguna atau ADR.
3. Mock, komentar, seed, screenshot, dan toast bukan bukti integrasi, otorisasi, TTE, kepatuhan, atau penyimpanan data.
4. UI hanya boleh menyatakan keberhasilan eksternal setelah menerima hasil dari batas layanan yang sesuai. Label `demo`, `lokal`, atau `simulasi` wajib terlihat ketika tidak ada integrasi nyata.
5. Bukti yang tidak dapat diulang harus ditulis `NOT AVAILABLE`, dengan dampak dan langkah untuk mendapatkannya. Ia tidak boleh diganti dengan `Pass`.

## 4. Evidence ledger yang terukur

Setiap bukti di DRD menggunakan satu baris ledger dengan kolom berikut.

| Evidence ID | Requirement | Metode / perintah tepat | Input atau fixture ter-redaksi | Hasil yang diharapkan | Hasil aktual | Status | Pelaksana & waktu |
| --- | --- | --- | --- | --- | --- | --- | --- |

Aturan ledger:

- Perintah harus dapat disalin dan dijalankan kembali dari root repository.
- Bukti test menyebut jumlah pass/fail/skip, bukan hanya “test passed”.
- Bukti UI menyebut browser dan viewport lebar × tinggi, state yang diuji, serta nama/fokus aksesibilitas bila relevan.
- Bukti API menyebut request tervalidasi, respons sukses dan gagal, autentikasi/otorisasi, idempotensi bila write, serta kontrak yang diuji.
- Bukti integrasi eksternal mencantumkan lingkungan, mode (`sandbox`, `mock`, atau `live`), redaksi, retry, dan korelasi request. Mock membuktikan adapter/kontrak mock saja, bukan keberhasilan pihak eksternal.
- Bukti klinis/data menyebut data sintetis/ter-redaksi, audit trail, otorisasi, safety cue, serta locking/addendum bila terdampak.

## 5. Validation plan per lapisan

DRD harus memilih semua baris yang relevan sebelum implementasi.

| Lapisan | Bukti minimum |
| --- | --- |
| Dokumentasi | Cross-link, registry, dan keputusan terdampak direkonsiliasi. |
| Frontend statis | `npx tsc --noEmit`, `npm run build`, lint bila tersedia. |
| Frontend interaktif | Bukti statis + state default/loading/empty/error/disabled + keyboard/focus + browser desktop dan mobile. |
| Backend/API | Unit/service test, request validation, success/error contract, authorization test, dan compatibility review. |
| Persistensi | Migrasi database disposable, recovery/rollback, integritas dan audit trail. |
| Klinis | Semua bukti API/UI yang relevan + safety cue, role/authorization, record lifecycle, locking/addendum. |
| BPJS/SATUSEHAT | Kontrak resmi, signature/auth, retry/idempotensi, error mapping, dan bukti ter-redaksi per lingkungan. |

Jika proyek belum memiliki test runner atau environment, TODO BE/FE harus memuat pekerjaan untuk menyediakannya. Fitur yang mewajibkan test tersebut tidak dapat melampaui `VALIDATING` tanpa pengecualian eksplisit dari pemilik produk.

## 6. Cara memperbarui dokumentasi

Urutan yang wajib dilakukan pada setiap perubahan:

1. Baca `AGENTS.md`, `GOVERNANCE.md`, DRD fitur, ADR diterima, dan kontrak domain yang relevan.
2. Perbarui DRD **sebelum** mengubah perilaku: requirement, scope, keputusan, risiko, atau status.
3. Perbarui TODO FE/BE pada saat pekerjaan berubah. Setiap task harus menunjuk `REQ-###` dan evidence yang akan membuktikannya. Untuk fitur yang membutuhkan QA/release formal, isi bagian optional QA traceability dan release record di DRD; bagian itu tetap menunjuk requirement dan Evidence ledger yang sama.
4. Buat/ubah ADR sebelum keputusan yang tahan lama tentang arsitektur, keamanan, data, routing, kontrak publik, atau integrasi.
5. Implementasikan perubahan terkecil pada layer pemiliknya sesuai `CODE_STANDARDS.md`.
6. Jalankan validation plan dan tambahkan hasil nyata ke Evidence ledger DRD.
7. Tutup task hanya setelah requirement terkait memiliki bukti lulus. Perbarui index fitur dan handoff.

Satu pull request/commit yang mengubah perilaku harus mengubah kode **dan** DRD/TODO yang menjelaskannya. Tidak ada pembaruan dokumentasi di akhir yang mencoba menerka apa yang telah dilakukan kode.

## 7. Kepemilikan FE dan BE

- **FE** memiliki komponen, UX state, accessibility, adaptasi data API ke view model, dan tidak boleh menyamarkan kegagalan API sebagai sukses.
- **BE** memiliki kontrak, validation, authorization, persistence, audit, idempotensi, observability, dan adapter integrasi.
- Requirement lintas batas memiliki satu `REQ-###`, satu acceptance outcome, dan task di kedua TODO. FE tidak mengklaim integrasi lulus tanpa evidence BE; BE tidak mengklaim pengalaman pengguna lulus tanpa evidence FE.

## 8. Template dan registry

- Registry: `docs/features/README.md`
- Template DRD: `docs/features/_template/DRD.md`
- Template TODO FE: `docs/features/_template/fe/TODO.md`
- Template TODO BE: `docs/features/_template/be/TODO.md`
- Standar kode: `docs/CODE_STANDARDS.md`
- Tanggung jawab delivery dan handoff: `docs/SDLC_WORKFLOW_AND_ROLES.md`
- Konvensi test case/defect/retest: `docs/QA_TRACEABILITY.md`
- Environment/release dan incident/hotfix: `docs/DEPLOYMENT_AND_ENVIRONMENTS.md`, `docs/INCIDENT_AND_HOTFIX.md`

Jalankan `npm run check:docs` untuk memeriksa struktur, heading DRD, Feature ID, status/registry, kolom requirement/evidence, dan tautan Markdown lokal. Pemeriksaan ini menjaga struktur dokumentasi; ia tidak menggantikan test produk atau evidence ledger.
