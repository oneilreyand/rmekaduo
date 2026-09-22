# Kaduo UI System

Dokumen ini adalah sumber visual untuk RME Kaduo. Tujuannya adalah tampilan yang tenang, dapat dipindai, dan konsisten; bukan demonstrasi visual yang berbeda-beda per layar.

## Prinsip

1. **Satu sistem, bukan kumpulan demo.** Katalog memakai komponen produksi yang sama dengan layar aplikasi.
2. **Informasi sebelum dekorasi.** Typography, jarak, dan label menjelaskan makna sebelum warna atau animasi.
3. **Status keselamatan tidak bergantung pada warna.** Status alergi, risiko jatuh, sukses, peringatan, dan kesalahan selalu memakai teks serta ikon.
4. **Bahasa antarmuka adalah Bahasa Indonesia.** Nama teknis yang baku, seperti SOAP, ICD-10, BPJS, dan SATUSEHAT, boleh dipertahankan.
5. **Data katalog adalah contoh non-pasien.** Jangan tampilkan identitas atau catatan klinis pasien di halaman referensi.

## Token warna

| Peran | Light | Dark | Penggunaan |
| --- | --- | --- | --- |
| Canvas | `#FFFFFF` | `#000000` | Latar aplikasi |
| Surface | `#FFFFFF` | `#121212` | Header, kartu, dialog |
| Surface halus | `#FFFAF7` | `#1C1C1C` | Panel sekunder, chip, skeleton |
| Teks utama | `#0B0D2C` | `#FFFFFF` | Judul, nilai, konten penting |
| Teks sekunder | `#6B6B73` | `#CBD5E1` | Deskripsi, label pendukung |
| Border | `#E7E5E4` | `#3F3F46` | Pemisah dan batas kontrol |
| Aksi/fokus | `#FF7A1A` | `#FF8F3D` | CTA, navigasi aktif, fokus |
| Aksi halus | `#FFD9BF` | `#402817` | Active state ringan, avatar |

Warna merah, amber, dan hijau hanya untuk status berlabel:

| Status | Warna | Kewajiban |
| --- | --- | --- |
| Kritis/kesalahan | Merah | Ikon dan teks eksplisit |
| Perlu perhatian | Amber | Ikon dan teks eksplisit |
| Berhasil/normal | Hijau | Ikon dan teks eksplisit |

Jangan memakai biru sebagai aksen produk, token fokus, chart utama, atau navigasi aktif. Jangan menambahkan override CSS global yang memetakan kelas warna lama dengan `!important`; pindahkan setiap komponen ke token semantik.

## Light dan dark mode

Tema dikendalikan oleh class `rme-dark` pada elemen root. Semua komponen bersama harus membaca variabel di `src/app/globals.css`:

- `--canvas`, `--surface`, `--surface-subtle`, `--surface-muted`
- `--text`, `--text-muted`, `--border`, `--border-strong`
- `--action`, `--action-hover`, `--action-soft`, `--focus`
- `--chart-grid`, `--chart-primary`, `--chart-normal`
- `--success-*`, `--warning-*`, `--danger-*` untuk latar, teks, dan border status yang berlabel

Komponen tidak boleh menyematkan hex produk atau pasangan `slate/sky` baru. Pengecualian hanya warna status keselamatan yang memiliki label dan ikon.

## Kontrol dan state

| Elemen | Light & dark requirement |
| --- | --- |
| Tombol | Primary memakai action; secondary memakai surface muted; disabled turun opacity tanpa menghilangkan teks. |
| Input | Surface dan border token; focus menggunakan `--focus` serta border terlihat. |
| Checkbox | Memakai `--action` melalui `accent-color`; label selalu clickable. |
| Toggle | On memakai `--action`, off memakai `--control-off`, thumb memakai `--surface`; track memiliki border, thumb bergerak nyata, label terlihat, dan state dinyatakan melalui `role="switch"` + `aria-checked`. Toggle tema boleh hanya memakai ikon matahari/bulan jika tetap memiliki nama aksesibel. |
| Badge | Status netral menggunakan surface muted; status keselamatan memakai teks + ikon + warna. |
| Grafik | Seri utama memakai `--chart-primary`, grid memakai `--chart-grid`, normal range memakai `--chart-normal`; grafik memiliki judul/label. |
| Loading | Spinner memakai action dan track muted; skeleton memakai surface muted. |

## Atomic Design

- **Atoms:** kontrol context-free, avatar, badge, progress, spinner, skeleton, sparkline, shortcut.
- **Molecules:** kombinasi satu interaksi, seperti input kata sandi, date picker, tabs, tooltip, pain scale, dan chips.
- **Organisms:** region yang dapat digunakan ulang, seperti ringkasan grafik, tabel status, atau state pemulihan.
- **Templates:** hanya mengatur layout dan state halaman.

Katalog harus mengimpor komponen tersebut. Jangan menyalin markup tombol, input, atau badge langsung di preview.

## Pemeriksaan sebelum selesai

Untuk perubahan UI, verifikasi:

1. Light dan dark mode pada katalog dan layar aplikasi.
2. State default, hover/focus, disabled, loading, empty/error untuk komponen yang terdampak.
3. Keyboard: tombol, checkbox, switch, tab, input, dan slider memiliki nama aksesibel serta fokus terlihat.
4. Lebar desktop dan mobile tidak menyembunyikan aksi penting.
5. `npx tsc --noEmit` dan `npm run build` berhasil.
