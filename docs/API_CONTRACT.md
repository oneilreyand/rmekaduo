# 📑 Kontrak API (API Contract Specification) v1.0.0

Dokumen ini merupakan target kontrak antara tim **Frontend (FE)** dan **Backend (BE)** untuk sistem Rekam Medis Elektronik (RME). Endpoint legacy belum seluruhnya mematuhi kontrak ini. Autentikasi berbasis sesi aman server-side bergantung pada **ADR 0004** dan **ADR 0005 Proposed**; ia tidak boleh diklaim aktif pada endpoint yang belum dibungkus authorization server-side.

---

## 🌐 Konvensi Global

* **Base URL:** `https://api.faskes.id/api/v1` (Production) / `http://localhost:8000/api/v1` (Development)
* **Standard Headers:**
  ```http
  Cookie: session_id=<opaque_secure_session_token>
  Content-Type: application/json
  Accept: application/json
  X-Branch-ID: <branch_uuid_hint>
  ```
  *(Catatan: `X-Branch-ID` / `X-Faskes-ID` hanya diperlakukan sebagai petunjuk permintaan client yang divalidasi ketat terhadap penugasan cabang dalam sesi server-side. Bila tidak sesuai hak akses, server merespons `403 Forbidden`. Header client tidak pernah menjadi sumber otoritas akses.)*
* **Format Response Standar:**
  ```json
  {
    "success": true,
    "code": 200,
    "message": "Operasi berhasil",
    "data": {},
    "meta": {
      "timestamp": "2026-09-21T11:50:00Z",
      "requestId": "req-982183719",
      "organizationId": "org-uuid-001",
      "branchId": "branch-uuid-001"
    }
  }
  ```
* **Format Error Standar:**
  ```json
  {
    "success": false,
    "code": 400,
    "error": "BAD_REQUEST",
    "message": "Validasi input gagal",
    "errors": [
      {
        "field": "nik",
        "message": "NIK wajib terdiri dari 16 digit angka numerik"
      }
    ]
  }
  ```

---

## 🔐 0. Modul Autentikasi, Sesi, dan Hak Akses (`/auth`)

### 0.1 Login Pengguna
* **Method:** `POST`
* **Path:** `/auth/login`
* **Rate Limit:** Maksimal 5 percobaan gagal per 15 menit per IP/Username (`429 RATE_LIMIT_EXCEEDED`).
* **Lockout:** 5 kali kegagalan berturut-turut mengunci akun selama 15 menit (`403 ACCOUNT_LOCKED`).
* **Request Body:**
  ```json
  {
    "username": "dr_budi_sintetis",
    "password": "DokterSintetis123!",
    "organizationCode": "ORG-SINTETIS-01"
  }
  ```
* **Response `200 OK`:**
  *Headers:* `Set-Cookie: session_id=<token_256bit>; Path=/; HttpOnly; SameSite=Strict; Max-Age=43200`
  ```json
  {
    "success": true,
    "code": 200,
    "message": "Login berhasil",
    "data": {
      "user": {
        "id": "ac000000-0000-0000-0000-000000000002",
        "username": "dr_budi_sintetis",
        "fullName": "dr. Sintetis Budi, Sp.PD [SINTETIS]",
        "email": "dr.budi.sintetis@example.internal"
      },
      "organization": {
        "id": "a0000000-0000-0000-0000-000000000001",
        "code": "ORG-SINTETIS-01",
        "name": "Klinik Pratama Sehat Sejahtera Group [SINTETIS]"
      },
      "activeBranch": {
        "id": "b0000000-0000-0000-0000-000000000001",
        "code": "BR-SINTETIS-01",
        "name": "Klinik Sehat Cabang Kemang [SINTETIS]"
      },
      "roles": [
        {
          "id": "c0000000-0000-0000-0000-000000000003",
          "code": "DOKTER_CABANG",
          "name": "Dokter Cabang [SINTETIS]",
          "scopeType": "BRANCH",
          "branchId": "b0000000-0000-0000-0000-000000000001"
        }
      ],
      "permissions": [
        "patient:read",
        "encounter:read",
        "encounter:write",
        "cross_branch:read"
      ],
      "assignedBranches": [
        "b0000000-0000-0000-0000-000000000001",
        "b0000000-0000-0000-0000-000000000002"
      ]
    }
  }
  ```

---

### 0.2 Profil Sesi Aktif (Me)
* **Method:** `GET`
* **Path:** `/auth/me`
* **Response `200 OK`:**
  ```json
  {
    "success": true,
    "code": 200,
    "data": {
      "user": {
        "id": "ac000000-0000-0000-0000-000000000002",
        "username": "dr_budi_sintetis",
        "fullName": "dr. Sintetis Budi, Sp.PD [SINTETIS]",
        "email": "dr.budi.sintetis@example.internal",
        "mfaEnabled": true
      },
      "organization": {
        "id": "a0000000-0000-0000-0000-000000000001",
        "code": "ORG-SINTETIS-01",
        "name": "Klinik Pratama Sehat Sejahtera Group [SINTETIS]"
      },
      "activeBranch": {
        "id": "b0000000-0000-0000-0000-000000000001",
        "code": "BR-SINTETIS-01",
        "name": "Klinik Sehat Cabang Kemang [SINTETIS]"
      },
      "roles": [],
      "permissions": [],
      "assignedBranches": [],
      "isOrgAdmin": false
    }
  }
  ```

---

### 0.3 Pergantian Cabang Aktif (Switch Branch)
* **Method:** `POST`
* **Path:** `/auth/switch-branch`
* **Catatan Otorisasi:** Cabang tujuan wajib termasuk dalam penugasan aktif akun atau akun memiliki hak akses organisasi. Jika tidak berhak, server merespons `403 BRANCH_ACCESS_DENIED`.
* **Request Body:**
  ```json
  {
    "branchId": "b0000000-0000-0000-0000-000000000002"
  }
  ```
* **Response `200 OK`:**
  ```json
  {
    "success": true,
    "code": 200,
    "message": "Cabang aktif berhasil diubah",
    "data": {
      "activeBranch": {
        "id": "b0000000-0000-0000-0000-000000000002",
        "code": "BR-SINTETIS-02",
        "name": "Klinik Sehat Cabang Tebet [SINTETIS]"
      }
    }
  }
  ```

---

### 0.4 Logout Pengguna
* **Method:** `POST`
* **Path:** `/auth/logout`
* **Response `200 OK`:**
  *Headers:* `Set-Cookie: session_id=; Path=/; Max-Age=0`
  ```json
  {
    "success": true,
    "code": 200,
    "message": "Logout berhasil",
    "data": {
      "loggedOut": true
    }
  }
  ```

---

## 👥 1. Modul Pasien & Admisi (`/patients`)

### 1.1 Pencarian Pasien (Search / Autocomplete)
* **Method:** `GET`
* **Path:** `/patients/search`
* **Query Params:**
  * `q` (string, required): No. RM, NIK, atau Nama (minimal 2 karakter)
  * `limit` (integer, optional, default: 10)
* **Response `200 OK`:**
  ```json
  {
    "success": true,
    "code": 200,
    "data": [
      {
        "id": "pat-001",
        "mrn": "00-12-89",
        "nik": "3171012304790002",
        "ihsNumber": "P01234567890",
        "name": "Tn. Budi Santoso",
        "gender": "L",
        "birthDate": "1979-04-23",
        "age": 45,
        "phone": "081234567890",
        "bpjs": {
          "cardNumber": "0001234567890",
          "status": "AKTIF",
          "class": "KELAS 1"
        }
      }
    ]
  }
  ```

---

### 1.2 Detail Lengkap Pasien & Riwayat Medis
* **Method:** `GET`
* **Path:** `/patients/{id}`
* **Response `200 OK`:**
  ```json
  {
    "success": true,
    "code": 200,
    "data": {
      "id": "pat-001",
      "mrn": "00-12-89",
      "nik": "3171012304790002",
      "ihsNumber": "P01234567890",
      "name": "Tn. Budi Santoso",
      "gender": "L",
      "birthDate": "1979-04-23",
      "age": 45,
      "bloodType": "O+",
      "bpjsStatus": "AKTIF",
      "bpjsNumber": "0001234567890",
      "allergies": [
        {
          "id": "alg-1",
          "substance": "Amoksisilin",
          "severity": "BERAT",
          "reaction": "Anafilaksis & Urtikaria Akut",
          "createdAt": "2023-01-15T10:00:00Z"
        }
      ],
      "fallRisk": "SEDANG",
      "pastVisits": [
        {
          "encounterId": "enc-901",
          "date": "2024-01-14",
          "poli": "Poli Umum",
          "doctor": "dr. Siti Rahmawati, Sp.PD",
          "primaryDiagnosis": "J00 - Nasofaringitis Akut (Common Cold)",
          "medications": ["Paracetamol 500 mg", "Cetirizine 10 mg"]
        }
      ]
    }
  }
  ```

---

### 1.3 Registrasi Pasien Baru (Pendaftaran)
* **Method:** `POST`
* **Path:** `/patients`
* **Request Body:**
  ```json
  {
    "nik": "3171019909990001",
    "name": "Ny. Siti Nurhaliza",
    "gender": "P",
    "birthDate": "1992-08-14",
    "bloodType": "B+",
    "phone": "081399887766",
    "address": "Jl. Melati No. 12, Jakarta Selatan",
    "paymentType": "BPJS",
    "bpjsCardNumber": "0001928374650",
    "initialAllergies": [
      {
        "substance": "Penisilin",
        "severity": "BERAT",
        "reaction": "Sesak napas dan bengkak bibir"
      }
    ],
    "targetPoli": "POLI_UMUM"
  }
  ```
* **Response `201 Created`:**
  ```json
  {
    "success": true,
    "code": 201,
    "message": "Pasien baru berhasil didaftarkan",
    "data": {
      "patientId": "pat-891",
      "mrn": "00-13-45",
      "ihsNumber": "P09988776655",
      "queueNumber": "A-09",
      "bpjsTaskId": 2,
      "registeredAt": "2026-09-21T11:50:00Z"
    }
  }
  ```

---

## 🩺 2. Modul Kunjungan & CPPT / SOAP (`/encounters`)

### 2.1 Get Encounter Aktif Dokter
* **Method:** `GET`
* **Path:** `/encounters/{id}`
* **Response `200 OK`:**
  ```json
  {
    "success": true,
    "code": 200,
    "data": {
      "id": "enc-101",
      "patientId": "pat-001",
      "status": "IN_CONSULTATION",
      "queueNumber": "A-01",
      "poliCode": "POLI_UMUM",
      "doctor": {
        "id": "doc-01",
        "name": "dr. Siti Rahmawati, Sp.PD",
        "sip": "446/SIP-D/2022",
        "ihsNumber": "10001982736"
      },
      "arrivedAt": "2026-09-21T08:30:00Z",
      "consultationStartedAt": "2026-09-21T08:40:00Z",
      "vitals": {
        "systolic": 120,
        "diastolic": 80,
        "heartRate": 82,
        "respiratoryRate": 18,
        "temperature": 36.8,
        "spo2": 98,
        "weightKg": 68.0,
        "heightCm": 170.0,
        "painScale": 2
      },
      "soap": {
        "id": "soap-01",
        "status": "DRAFT",
        "subjective": "Batuk pilek sejak 3 hari...",
        "objective": "Keadaan umum sedang, faring hiperemis...",
        "assessment": "J06.9 - Infeksi Saluran Pernapasan Atas Akut (ISPA)",
        "plan": "Istirahat cukup, hidrasi hangat...",
        "icd10Code": "J06.9",
        "icd10Name": "Infeksi Saluran Pernapasan Atas Akut (ISPA)"
      }
    }
  }
  ```

---

### 2.2 Simpan Draft SOAP & TTV (Autosave / Manual Save)
* **Method:** `PUT`
* **Path:** `/encounters/{id}/soap`
* **Request Body:**
  ```json
  {
    "vitals": {
      "systolic": 120,
      "diastolic": 80,
      "heartRate": 82,
      "respiratoryRate": 18,
      "temperature": 36.8,
      "spo2": 98,
      "weightKg": 68.0,
      "heightCm": 170.0,
      "painScale": 2
    },
    "soap": {
      "subjective": "Batuk berdahak sejak 3 hari...",
      "objective": "Faring hiperemis (+)...",
      "assessment": "J06.9 - Infeksi Saluran Pernapasan Atas Akut",
      "plan": "Istirahat cukup 3 hari...",
      "icd10Code": "J06.9",
      "icd10Name": "Infeksi Saluran Pernapasan Atas Akut (ISPA)"
    }
  }
  ```
* **Response `200 OK`:**
  ```json
  {
    "success": true,
    "code": 200,
    "message": "Draft SOAP berhasil disimpan",
    "data": {
      "savedAt": "2026-09-21T11:51:30Z"
    }
  }
  ```

---

### 2.3 Selesai Periksa & Finalisasi (Locking & Sync Trigger)
* **Method:** `POST`
* **Path:** `/encounters/{id}/complete`
* **Request Body:**
  ```json
  {
    "prescriptions": [
      {
        "kfaCode": "93001019",
        "name": "Paracetamol 500 mg Tablet",
        "signa": "3 x 1 tablet sesudah makan",
        "quantity": 10,
        "unit": "Tablet"
      }
    ],
    "allergyOverrideReason": null
  }
  ```
* **Response `200 OK`:**
  *(Commit lokal instan < 200ms, sync ke BPJS & SATUSEHAT didelegasikan ke queue)*
  ```json
  {
    "success": true,
    "code": 200,
    "message": "Pemeriksaan selesai dan terkunci. Sinkronisasi latar belakang dijadwalkan.",
    "data": {
      "encounterId": "enc-101",
      "status": "COMPLETED",
      "lockedAt": "2026-09-21T11:52:00Z",
      "queueJobs": {
        "bpjsTaskId": "job-bpjs-881",
        "satusehatBundleId": "job-satusehat-412"
      }
    }
  }
  ```

---

## 💊 3. Modul Terminologi Cepat (`/terminology`)

### 3.1 Pencarian ICD-10 (Fuzzy Search < 50ms)
* **Method:** `GET`
* **Path:** `/terminology/icd10`
* **Query Params:**
  * `q` (string, required): Kode atau nama penyakit (contoh: `ispa` atau `J06`)
* **Response `200 OK`:**
  ```json
  {
    "success": true,
    "code": 200,
    "data": [
      {
        "code": "J06.9",
        "nameId": "Infeksi Saluran Pernapasan Atas Akut (ISPA)",
        "nameEn": "Acute upper respiratory infection, unspecified"
      },
      {
        "code": "J00",
        "nameId": "Nasofaringitis Akut (Common Cold)",
        "nameEn": "Acute nasopharyngitis"
      }
    ]
  }
  ```

---

### 3.2 Pencarian Obat KFA Kemenkes
* **Method:** `GET`
* **Path:** `/terminology/kfa`
* **Query Params:**
  * `q` (string, required): Nama obat atau zat aktif (contoh: `paracetamol`)
* **Response `200 OK`:**
  ```json
  {
    "success": true,
    "code": 200,
    "data": [
      {
        "kfaCode": "93001019",
        "name": "Paracetamol 500 mg Tablet",
        "activeSubstance": "Paracetamol",
        "form": "Tablet",
        "defaultSigna": "3 x 1 tablet sesudah makan (bila demam/nyeri)"
      },
      {
        "kfaCode": "93000841",
        "name": "Cetirizine 10 mg Tablet",
        "activeSubstance": "Cetirizine HCl",
        "form": "Tablet",
        "defaultSigna": "1 x 1 tablet malam hari"
      }
    ]
  }
  ```

---

## 🛡️ 4. Modul Bridging BPJS & SATUSEHAT

### 4.1 Update Waktu Antrean Online BPJS (Task 1–7)
* **Method:** `POST`
* **Path:** `/bridging/bpjs/antrean/task`
* **Request Body:**
  ```json
  {
    "kodebooking": "BK20260921001",
    "taskid": 4,
    "waktu": 1726912345000,
    "jenisresep": "NonRacikan"
  }
  ```
* **Response `200 OK`:**
  ```json
  {
    "success": true,
    "code": 200,
    "message": "Task ID 4 berhasil dilaporkan ke BPJS"
  }
  ```

---

### 4.2 Cek Kepesertaan BPJS by NIK
* **Method:** `GET`
* **Path:** `/bridging/bpjs/peserta/{nik}`
* **Response `200 OK`:**
  ```json
  {
    "success": true,
    "code": 200,
    "data": {
      "nik": "3171012304790002",
      "noKartu": "0001234567890",
      "nama": "BUDI SANTOSO",
      "statusPeserta": {
        "kode": "0",
        "keterangan": "AKTIF"
      },
      "hakKelas": "KELAS 1",
      "faskesRujukan": "KLINIK PRATAMA SEHAT"
    }
  }
  ```

---

### 4.3 Trigger Sync FHIR SATUSEHAT
* **Method:** `POST`
* **Path:** `/bridging/satusehat/encounters/{id}/sync`
* **Response `200 OK`:**
  ```json
  {
    "success": true,
    "code": 200,
    "data": {
      "encounterId": "enc-101",
      "fhirEncounterId": "c4d5e6f7-1234-5678-90ab-cdef12345678",
      "resourcesSynced": [
        "Encounter",
        "Condition/Diagnosis-Primer",
        "Observation/Systolic",
        "Observation/Diastolic",
        "Observation/HeartRate",
        "MedicationRequest/Paracetamol"
      ],
      "syncedAt": "2026-09-21T11:52:05Z"
    }
  }
  ```
