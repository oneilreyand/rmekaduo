# 🛡️ Panduan Teknis Bridging BPJS Kesehatan (v2.0)

Dokumen ini berisi spesifikasi teknis resmi, formula pembuatan signature HMAC-SHA256, algoritma dekripsi payload AES-256-CBC + LZ-String, serta siklus Task ID Antrean Online BPJS (V2).

---

## 🔑 Kredensial Bridging BPJS

| Parameter | Sumber / Lokasi | Deskripsi |
| :--- | :--- | :--- |
| `Cons-ID` | Portal BPJS TrustMark | ID Konsumen faskes (numerik, misal: `12345`). |
| `Secret Key` | Portal BPJS TrustMark | Kunci rahasia faskes (alphanumeric, misal: `8aB9x01Y`). |
| `User Key` | Portal BPJS TrustMark | Kunci otorisasi layanan (V-Claim / Antrean / P-Care). |
| `PPK Code` | Kantor Cabang BPJS | Kode fasilitas kesehatan (misal: `0123R001`). |

---

## 🔐 1. Formula Signature (HMAC-SHA256)

Setiap request HTTP ke BPJS wajib menyertakan 4 header utama:
* `X-cons-id`: Nilai Cons-ID.
* `X-timestamp`: Unix timestamp waktu UTC dalam satuan **detik**.
* `X-signature`: Base64 string hasil hashing HMAC-SHA256 dari `ConsID + "&" + Timestamp` dengan `SecretKey`.
* `user_key`: Nilai User Key layanan terkait.

### Implementasi TypeScript / Node.js:
```typescript
import crypto from 'crypto';

export interface BpjsHeaders {
  'X-cons-id': string;
  'X-timestamp': string;
  'X-signature': string;
  'user_key': string;
}

export function generateBpjsHeaders(
  consId: string,
  secretKey: string,
  userKey: string
): { headers: BpjsHeaders; timestamp: string } {
  // 1. Dapatkan timestamp UTC dalam detik
  const timestamp = Math.floor(Date.now() / 1000).toString();

  // 2. Format pesan yang di-hash: ConsID + "&" + Timestamp
  const message = `${consId}&${timestamp}`;

  // 3. Hitung HMAC-SHA256 menggunakan SecretKey
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(message)
    .digest('base64');

  return {
    headers: {
      'X-cons-id': consId,
      'X-timestamp': timestamp,
      'X-signature': signature,
      'user_key': userKey,
    },
    timestamp,
  };
}
```

---

## 🔓 2. Algoritma Dekripsi Response (AES-256-CBC + LZ-String)

Response data dari BPJS dikembalikan dalam bentuk string terenkripsi:
```json
{
  "metaData": { "code": "200", "message": "Sukses" },
  "response": "k1Jd9f8A0eL... (ciphertext base64)"
}
```

### Langkah Dekripsi:
1. **Derivasi Kunci:** Gabungkan `ConsID + SecretKey + Timestamp`.
2. **Hash Kunci:** Lakukan SHA-256 pada kunci gabungan tersebut (menghasilkan binary buffer 32 bytes).
3. **Inisialisasi Vektor (IV):** Ambil 16 bytes pertama dari hasil hash SHA-256 tersebut.
4. **Dekripsi AES:** Dekripsi string `response` menggunakan algoritma `aes-256-cbc`.
5. **Dekompresi LZ-String:** String hasil dekripsi didekompresi menggunakan `LZString.decompressFromEncodedURIComponent()`.

### Implementasi TypeScript / Node.js:
```typescript
import crypto from 'crypto';
import LZString from 'lz-string';

export function decryptBpjsResponse(
  encryptedText: string,
  consId: string,
  secretKey: string,
  timestamp: string
): any {
  try {
    // 1. Gabungkan string kunci
    const keyString = `${consId}${secretKey}${timestamp}`;

    // 2. Hash SHA-256 untuk mendapatkan key 32 bytes
    const keyHash = crypto.createHash('sha256').update(keyString).digest();

    // 3. Ambil 16 bytes pertama sebagai IV
    const iv = keyHash.subarray(0, 16);

    // 4. Dekripsi AES-256-CBC
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyHash, iv);
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    // 5. Dekompresi LZ-String (URL-encoded)
    const decompressed = LZString.decompressFromEncodedURIComponent(decrypted);

    if (!decompressed) {
      throw new Error('Gagal mendekompresi payload LZ-String BPJS');
    }

    // 6. Parse hasil ke JSON
    return JSON.parse(decompressed);
  } catch (error) {
    console.error('Error saat dekripsi response BPJS:', error);
    throw error;
  }
}
```

---

## ⏱️ 3. Siklus Antrean Online BPJS (V2) - Task ID 1 sampai 7

Setiap perubahan fase pelayanan wajib dilaporkan ke endpoint `/antrean/updatewaktu`:

| Task ID | Fase Pelayanan | Kapan Dikirim? | Keterangan |
| :---: | :--- | :--- | :--- |
| **1** | Mulai tunggu admisi | Saat pasien mengambil tiket antrean di mesin kiosk / pendaftaran. | Timestamp waktu ambil antrean. |
| **2** | Admisi dilayani | Petugas loket pendaftaran memanggil nomor antrean. | Pasien sedang di meja admisi. |
| **3** | Selesai admisi / Tunggu poli | Petugas admisi selesai memproses berkas dan mengarahkan ke poli. | Pasien menuju ruang tunggu poli. |
| **4** | **Pemeriksaan Dokter** | **Dokter memanggil pasien dan mulai mengisi SOAP di RME.** | Waktu pemeriksaan dokter. |
| **5** | Selesai poli / Tunggu farmasi | **Dokter klik "Selesai Periksa" dan resep masuk ke farmasi.** | Pasien menuju apotek. |
| **6** | Farmasi melayani | Petugas farmasi mulai menyiapkan dan meracik obat. | Proses peracikan dimulai. |
| **7** | Pelayanan selesai | Petugas farmasi menyerahkan obat dan memberikan edukasi. | Pasien pulang dari faskes. |

### Payload Update Waktu Antrean:
* **Method:** `POST`
* **Endpoint:** `/antrean/updatewaktu`
* **Body:**
```json
{
  "kodebooking": "BK202409210001",
  "taskid": 4,
  "waktu": 1726912345000,
  "jenisresep": "Racikan" 
}
```
*(Catatan: `waktu` menggunakan Unix timestamp dalam satuan **milidetik**).*

---

## 🔍 4. Pengecekan Kepesertaan (NIK / No. Kartu)

### Cek Peserta Berdasarkan NIK:
* **Method:** `GET`
* **Endpoint:** `/Peserta/nik/{nik}/tglPelayanan/{YYYY-MM-DD}`

### Response Hasil Dekripsi:
```json
{
  "peserta": {
    "nama": "BUDI SANTOSO",
    "noKartu": "0001234567890",
    "nik": "3171012345670001",
    "tglLahir": "1979-05-12",
    "statusPeserta": {
      "kode": "0",
      "keterangan": "AKTIF"
    },
    "hakKelas": {
      "kode": "1",
      "keterangan": "KELAS 1"
    },
    "provUmum": {
      "kdProvider": "0123U001",
      "nmProvider": "KLINIK PRATAMA SEHAT"
    }
  }
}
```
*(Jika `statusPeserta.kode == "0"`, pasien dapat dijamin BPJS).*

---

## 🏥 5. Spesifikasi Bridging BPJS P-Care v2.0 (FKTP)

Ditujukan untuk Fasilitas Kesehatan Tingkat Pertama (Puskesmas / Klinik Pratama / DPM):

### 5.1 Pendaftaran Kunjungan
* **Method:** `POST`
* **Endpoint:** `/pendaftaran`
* **Payload:**
  ```json
  {
    "kdProviderPeserta": "0123R001",
    "tglDaftar": "22-09-2026",
    "noKartu": "0001234567890",
    "kdPoli": "001",
    "keluhan": "Demam dan batuk",
    "kunjSakit": true,
    "sistole": 120,
    "diastole": 80,
    "beratBadan": 68,
    "tinggiBadan": 170,
    "respRate": 18,
    "heartRate": 82
  }
  ```

### 5.2 Entri Pelayanan Dokter
* **Method:** `POST`
* **Endpoint:** `/pelayanan`
* **Payload:** Mengirimkan diagnosa primer (ICD-10), kesadaran, status pulang (3: Berobat Jalan, 4: Rujuk Vertikal), dan terapi obat.

### 5.3 Penerbitan Surat Rujukan Vertikal (FKTP $\rightarrow$ RS)
* **Method:** `POST`
* **Endpoint:** `/rujukan`
* **Payload:** Menyertakan `kdppk` RS tujuan, `kdSubSpesialis`, kriteria `tacc` (1: Time, 2: Age, 3: Complication, 4: Comorbidity), dan estimasi tanggal kunjungan.

---

## 🏛️ 6. Spesifikasi Bridging BPJS V-Claim v2.0 (FKRTL / Rumah Sakit)

Ditujukan untuk Fasilitas Kesehatan Rujukan Tingkat Lanjut (Rumah Sakit / Klinik Utama):

### 6.1 Penerbitan Surat Eligibilitas Peserta (SEP)
* **Method:** `POST`
* **Endpoint:** `/SEP/2.0/insert`
* **Payload:**
  ```json
  {
    "request": {
      "t_sep": {
        "noKartu": "0001234567890",
        "tglSep": "2026-09-22",
        "ppkPelayanan": "0123R001",
        "jnsPelayanan": "2",
        "klsRawatHak": "1",
        "noMR": "RM-001289",
        "rujukan": {
          "asalRujukan": "1",
          "tglRujukan": "2026-09-20",
          "noRujukan": "0123R0010926P000124",
          "ppkRujukan": "0123R001"
        },
        "catatan": "Pemeriksaan lanjutan poli dalam",
        "diagAwal": "J06.9",
        "poli": { "tujuan": "INT", "eksekutif": "0" },
        "dpjpLayan": "12345",
        "noTelp": "081234567890",
        "user": "LOKET-ADM-01"
      }
    }
  }
  ```

### 6.2 Penerbitan Surat Perintah Kontrol (SK) & SPRI
* **Method:** `POST`
* **Endpoint:** `/RencanaKontrol/insert`
* **Payload:** Menyertakan `noSEP`, `tglRencanaKontrol`, `poliKontrol`, dan `kodeDokter`.

