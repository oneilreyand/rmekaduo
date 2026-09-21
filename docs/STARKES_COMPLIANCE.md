# ⚖️ Kepatuhan Standar Akreditasi (STARKES & Permenkes 24/2022)

Dokumen ini menjelaskan kepatuhan terhadap standar akreditasi rumah sakit (**STARKES**) dan akreditasi klinik (**LPA FKTP**), mencakup *Medical Record Locking*, sistem *Addendum*, *Audit Trail* tidak terhapus (*immutable*), instrumen keselamatan pasien (*Patient Safety*), dan Tanda Tangan Elektronik (TTE).

---

## 🔒 1. Penguncian Rekam Medis (Medical Record Locking)

Sesuai Permenkes No. 24 Tahun 2022 Pasal 21, pengisian rekam medis elektronik harus diselesaikan dan ditandatangani oleh tenaga medis dalam batas waktu tertentu.

### Aturan Bisnis (*Business Rules*):
1. **Status Rekam Medis:**
   * `DRAFT`: Dokter sedang memeriksa atau belum menandatangani. Data masih bisa diubah langsung.
   * `FINAL`: Dokter klik "Selesai & Simpan" serta menandatangani secara elektronik.
   * `LOCKED`: Rekam medis otomatis terkunci secara permanen **1 x 24 jam** sejak status `FINAL`.
2. **Larangan Hapus:**
   * Sekali berstatus `FINAL` atau `LOCKED`, seluruh record dilarang keras di-`UPDATE` secara langsung atau di-`DELETE` dari database.

### Implementasi Logic Locking:
```typescript
export function isRecordLocked(note: {
  status: 'DRAFT' | 'FINAL' | 'AMENDED';
  locked_at?: Date | null;
  created_at: Date;
}): boolean {
  if (note.status === 'DRAFT') return false;

  const now = new Date().getTime();
  const lockDeadline = new Date(note.created_at).getTime() + 24 * 60 * 60 * 1000; // 24 Jam

  return now > lockDeadline || note.status === 'FINAL';
}
```

---

## 📝 2. Sistem Addendum (Catatan Pembetulan Resmi)

Jika dokter perlu memperbaiki kesalahan input setelah rekam medis terkunci, dokter **wajib** menggunakan fitur Addendum:

1. Data lama **tidak ditimpa/dihapus**.
2. Sistem mencatat:
   * Siapa dokter yang melakukan pembetulan.
   * Waktu pembetulan (*timestamp*).
   * Alasan pembetulan (*justification*, misal: "Koreksi dosis obat karena berat badan baru terverifikasi").
   * Snapshot data sebelum diubah (`original_snapshot` dalam format JSONB).
   * Teks catatan addendum.

---

## 🕵️ 3. Audit Trail & Jejak Digital (Wajib STARKES & UU PDP)

Setiap aktivitas pada sistem RME wajib memiliki jejak digital yang tidak dapat disangkal (*non-repudiation*).

### Karakteristik Teknis:
* **Immutable (Append-Only):** Tabel `audit_logs` **TIDAK BOLEH** memiliki hak akses `UPDATE` maupun `DELETE` bagi user aplikasi maupun admin faskes.
* **Cakupan Pencatatan:**
  * Login & Logout (beserta status sukses/gagal).
  * Pembukaan berkas rekam medis pasien (`READ`).
  * Penyimpanan SOAP baru (`CREATE`).
  * Pengajuan Addendum (`AMEND`).
  * Pencetakan atau Export Resume Medis (`EXPORT`).

### Middleware Logger (TypeScript):
```typescript
import { db } from '@/lib/db';

export async function logAuditEvent({
  userId,
  action,
  entityName,
  entityId,
  oldValues,
  newValues,
  ipAddress,
  userAgent,
}: {
  userId: string;
  action: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT';
  entityName: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress: string;
  userAgent?: string;
}) {
  await db.audit_logs.create({
    data: {
      user_id: userId,
      action,
      entity_name: entityName,
      entity_id: entityId,
      old_values: oldValues ? JSON.stringify(oldValues) : null,
      new_values: newValues ? JSON.stringify(newValues) : null,
      ip_address: ipAddress,
      user_agent: userAgent,
    },
  });
}
```

---

## 🚨 4. Instrumen Wajib Keselamatan Pasien (Patient Safety)

### A. Skrining & Validasi Silang Alergi Obat (Allergy Cross-Check)
* **Kewajiban:** Peringatan merah menyala wajib muncul seketika di layar e-resep jika dokter memilih obat yang mengandung zat aktif yang ada pada riwayat alergi pasien.
* **Hard Stop vs Soft Stop:**
  * Jika alergi kategori **Berat / Anafilaksis**: Sistem memblokir peresepan (*Hard Stop*).
  * Jika alergi kategori **Sedang**: Sistem menampilkan konfirmasi merah tebal (*Soft Stop*) dan mewajibkan dokter memasukkan alasan klinis tertulis untuk melanjutkan.

### B. Skrining Risiko Jatuh
1. **Rawat Jalan Dewasa (Get Up and Go Test - GUGT):**
   * *Pertanyaan 1:* Apakah cara berjalan pasien tidak seimbang / limbung? (Ya/Tidak)
   * *Pertanyaan 2:* Apakah saat duduk/berdiri pasien memegang pinggiran kursi atau meja sebagai penopang? (Ya/Tidak)
   * **Hasil:**
     * Tidak berisiko (Tidak ada "Ya") -> Badge Hijau.
     * Risiko Rendah (Satu "Ya") -> Badge Kuning.
     * Risiko Tinggi (Dua-duanya "Ya") -> Badge Merah (Wajib dipasang gelang risiko jatuh kuning di admisi).
2. **Rawat Inap Dewasa:** Morse Fall Scale.
3. **Anak-Anak:** Humpty Dumpty Scale.

### C. Skrining Nyeri
* **Dewasa & Sadar:** Numeric Rating Scale (NRS 0–10).
  * `0`: Tidak nyeri.
  * `1 - 3`: Nyeri ringan.
  * `4 - 6`: Nyeri sedang.
  * `7 - 10`: Nyeri berat (Wajib lapor DPJP dan intervensi farmakologis).
* **Anak / Lansia:** Wong-Baker FACES Pain Rating Scale.

---

## ✍️ 5. Tanda Tangan Elektronik (TTE) & Resume Medis

1. **TTE Terintegrasi:**
   * Diintegrasikan dengan Penyelenggara Sertifikasi Elektronik (PSrE) berinduk Kominfo (seperti BSrE BSSN, Privy, atau VIDA).
   * Pada tahap awal pengembangan lokal, sistem menghasilkan hash dokumen digital (SHA-256 + Private Key Faskes) yang disertakan pada footer dokumen PDF/Cetak.
2. **Resume Medis / Ringkasan Pulang Pasien:**
   * Wajib digenerate otomatis setiap kali rawat jalan selesai atau rawat inap pulang.
   * Elemen wajib: Identitas pasien, Keluhan utama, Ringkasan pemeriksaan fisik, Diagnosis ICD-10 (primer & sekunder), Tindakan medis ICD-9, Terapi obat pulang, dan Instruksi kontrol/edukasi.
