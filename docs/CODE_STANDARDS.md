# Standar Penulisan Kode dan Dokumentasi

Standar ini berlaku untuk manusia dan model. Ia melengkapi `FEATURE_WORKFLOW.md`: DRD menentukan **apa** yang harus benar; dokumen ini menentukan **bagaimana** perubahan ditulis dan dirawat.

## Aturan universal

1. Satu perubahan harus punya fitur aktif di `docs/features/<feature-id>/DRD.md` dan task FE/BE yang merujuk requirement terkait.
2. Jangan mengarang aturan klinis, nilai kode, field API, status integrasi, data pasien, kredensial, atau claim kepatuhan. Tambahkan sumber primer atau blokir pekerjaan.
3. Tidak ada `any`, `@ts-ignore`, cast lebar, error swallowing, atau fallback yang mengubah hasil bisnis tanpa alasan dan test.
4. Error harus diperlakukan sebagai data yang terlihat di batas yang tepat; jangan mengganti kegagalan layanan dengan toast sukses, data palsu, atau state “connected”.
5. Gunakan nama yang mencerminkan domain; satu file/satu komponen/satu service memiliki satu alasan utama untuk berubah.
6. Perubahan yang menghapus, memigrasikan, atau mengunci data wajib memiliki strategi recovery, auditability, dan requirement DRD.

## Frontend

- Dependency hanya mengalir `atoms → molecules → organisms → templates → app`.
- Gunakan shared component dan token desain; jangan menggandakan markup komponen katalog atau menyematkan warna produk baru.
- Semua kontrol memiliki label aksesibel, focus terlihat, dan state disabled/loading/error/empty bila relevan.
- Component tidak memanggil provider eksternal secara langsung jika terdapat service/API boundary.
- Hasil API ditampilkan sebagai `loading`, `success`, atau `error` dari respons nyata. Mode mock wajib diberi label dan tidak boleh menyerupai lingkungan produksi.

## Backend dan API

- Validasi input di route/service boundary; response mengikuti kontrak tertulis dan tidak membocorkan detail internal.
- Otorisasi dilaksanakan di service/backend, bukan hanya disembunyikan di UI.
- Endpoint write mendefinisikan idempotensi, audit event, failure/retry behavior, dan test untuk success/error/unauthorized.
- Adapter pihak ketiga memisahkan transport, credential handling, mapping, retry, dan mock. Mock deterministik tidak boleh mengaku sebagai live integration.
- Jangan menyimpan credential atau data pasien pada source, fixture, output test, ataupun evidence.

## Perubahan dokumentasi

- Tambahkan/ubah requirement di DRD sebelum kode yang mengubah perilaku dibuat.
- Perbarui kontrak API, skema data, ADR, atau design system pada commit yang sama bila batas tersebut berubah.
- Jalankan `npm run check:docs` setelah mengubah dokumen; perbaiki struktur atau tautan rusak sebelum review.
- Evidence ledger mencatat hasil aktual, termasuk failure dan skip. Jangan mengedit sejarah evidence untuk menyamarkan kegagalan; tambahkan entry baru dengan perbaikan.
- Hapus task selesai hanya setelah Evidence ID yang direncanakan telah ada dan lulus.

## Kriteria review

Reviewer menolak perubahan apabila salah satu kondisi ini benar:

- tidak ada DRD/TODO atau requirement tidak memiliki acceptance outcome;
- claim fitur lebih kuat daripada bukti;
- test wajib tidak tersedia tetapi status fitur dinyatakan `VALIDATED`;
- ada data sensitif/realistis yang tidak ter-redaksi;
- perubahan kontrak/arsitektur tidak memiliki ADR atau keputusan pengguna;
- UI menyatakan akses, integrasi, locking, TTE, atau compliance yang backend tidak buktikan.
