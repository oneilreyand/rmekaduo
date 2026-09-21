# 🏥 Panduan Teknis SATUSEHAT Kemenkes RI (HL7 FHIR R4)

Dokumen ini menjelaskan integrasi resmi ke platform interoperabilitas nasional **SATUSEHAT** Kementerian Kesehatan Republik Indonesia menggunakan standar internasional **HL7 FHIR Release 4**.

---

## 🌐 Endpoint Resmi SATUSEHAT DTO Kemenkes

| Lingkungan | Base URL Auth (OAuth2) | Base URL FHIR R4 |
| :--- | :--- | :--- |
| **Development / Staging** | `https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1` | `https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1` |
| **Production** | `https://api-satusehat.kemkes.go.id/oauth2/v1` | `https://api-satusehat.kemkes.go.id/fhir-r4/v1` |

---

## 🔑 1. Autentikasi OAuth 2.0 & Token Caching

Kemenkes menggunakan *Client Credentials Grant*. Token yang diterbitkan memiliki masa aktif 3600 detik (1 jam). **Wajib di-cache** di Redis agar sistem tidak membuang kuota request autentikasi.

### Implementasi TypeScript Token Manager:
```typescript
import axios from 'axios';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function getSatuSehatToken(): Promise<string> {
  const cacheKey = 'satusehat:token';

  // 1. Cek token di Redis
  const cachedToken = await redis.get(cacheKey);
  if (cachedToken) {
    return cachedToken;
  }

  // 2. Request token baru jika cache kosong / expired
  const authUrl = `${process.env.SATUSEHAT_AUTH_URL}/accesstoken?grant_type=client_credentials`;
  
  const params = new URLSearchParams();
  params.append('client_id', process.env.SATUSEHAT_CLIENT_ID!);
  params.append('client_secret', process.env.SATUSEHAT_CLIENT_SECRET!);

  const response = await axios.post(authUrl, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  const { access_token, expires_in } = response.data;

  // 3. Simpan token di Redis dengan TTL 3500 detik (safety margin 100 detik)
  await redis.set(cacheKey, access_token, 'EX', expires_in - 100);

  return access_token;
}
```

---

## 🆔 2. Pencarian Nomor IHS (Pasien & Dokter)

Sebelum mengirimkan data klinis, sistem wajib memetakan NIK pasien dan NIK dokter menjadi **IHS Number**.

### A. Lookup IHS Pasien by NIK:
* **Method:** `GET`
* **URL:** `{{SATUSEHAT_FHIR_URL}}/Patient?identifier=https://fhir.kemkes.go.id/id/nik|3171012345670001`
* **Response Snippet:**
```json
{
  "resourceType": "Bundle",
  "total": 1,
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "id": "P01234567890",
        "name": [{ "text": "BUDI SANTOSO" }]
      }
    }
  ]
}
```
*(Ambil `entry[0].resource.id` sebagai ID Pasien SATUSEHAT).*

### B. Lookup IHS Praktisi/Dokter by NIK:
* **Method:** `GET`
* **URL:** `{{SATUSEHAT_FHIR_URL}}/Practitioner?identifier=https://fhir.kemkes.go.id/id/nik|3201011102850002`
* **Response Snippet:**
```json
{
  "entry": [
    {
      "resource": {
        "resourceType": "Practitioner",
        "id": "10001982736",
        "name": [{ "text": "dr. Siti Rahmawati, Sp.PD" }]
      }
    }
  ]
}
```

---

## 📦 3. Struktur FHIR Resources Wajib (Ruang Rawat Jalan)

### Resource 1: `Encounter` (Kunjungan Pasien)
```json
{
  "resourceType": "Encounter",
  "status": "finished",
  "class": {
    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
    "code": "AMB",
    "display": "ambulatory"
  },
  "subject": {
    "reference": "Patient/P01234567890",
    "display": "BUDI SANTOSO"
  },
  "participant": [
    {
      "type": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
              "code": "ATND",
              "display": "attender"
            }
          ]
        }
      ],
      "individual": {
        "reference": "Practitioner/10001982736",
        "display": "dr. Siti Rahmawati, Sp.PD"
      }
    }
  ],
  "period": {
    "start": "2024-09-21T08:30:00+07:00",
    "end": "2024-09-21T08:45:00+07:00"
  },
  "serviceProvider": {
    "reference": "Organization/10000004"
  }
}
```

---

### Resource 2: `Condition` (Diagnosis Primer & Sekunder ICD-10)
```json
{
  "resourceType": "Condition",
  "clinicalStatus": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
        "code": "active",
        "display": "Active"
      }
    ]
  },
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/condition-category",
          "code": "encounter-diagnosis",
          "display": "Encounter Diagnosis"
        }
      ]
    }
  ],
  "code": {
    "coding": [
      {
        "system": "http://hl7.org/fhir/sid/icd-10",
        "code": "J06.9",
        "display": "Acute upper respiratory infection, unspecified"
      }
    ]
  },
  "subject": {
    "reference": "Patient/P01234567890"
  },
  "encounter": {
    "reference": "Encounter/{{ENCOUNTER_ID_SATUSEHAT}}"
  }
}
```

---

### Resource 3: `Observation` (Tanda-Tanda Vital & Skrining)

Mapping Kode Standar LOINC untuk TTV:
* **Tekanan Darah Sistolik:** LOINC `8480-6`
* **Tekanan Darah Diastolik:** LOINC `8462-4`
* **Frekuensi Nadi (Heart Rate):** LOINC `8867-4`
* **Frekuensi Napas (RR):** LOINC `9279-1`
* **Suhu Tubuh:** LOINC `8310-5`
* **Saturasi Oksigen (SpO2):** LOINC `59408-5`

#### Contoh JSON Observasi Suhu Tubuh:
```json
{
  "resourceType": "Observation",
  "status": "final",
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/observation-category",
          "code": "vital-signs",
          "display": "Vital Signs"
        }
      ]
    }
  ],
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "8310-5",
        "display": "Body temperature"
      }
    ]
  },
  "subject": {
    "reference": "Patient/P01234567890"
  },
  "encounter": {
    "reference": "Encounter/{{ENCOUNTER_ID_SATUSEHAT}}"
  },
  "effectiveDateTime": "2024-09-21T08:35:00+07:00",
  "valueQuantity": {
    "value": 36.8,
    "unit": "C",
    "system": "http://unitsofmeasure.org",
    "code": "Cel"
  }
}
```

---

### Resource 4: `MedicationRequest` (E-Resep Obat KFA)
```json
{
  "resourceType": "MedicationRequest",
  "status": "completed",
  "intent": "order",
  "medicationCodeableConcept": {
    "coding": [
      {
        "system": "http://sys-ids.kemkes.go.id/kfa",
        "code": "93001019",
        "display": "Paracetamol 500 mg Tablet"
      }
    ]
  },
  "subject": {
    "reference": "Patient/P01234567890"
  },
  "encounter": {
    "reference": "Encounter/{{ENCOUNTER_ID_SATUSEHAT}}"
  },
  "authoredOn": "2024-09-21T08:40:00+07:00",
  "requester": {
    "reference": "Practitioner/10001982736"
  },
  "dosageInstruction": [
    {
      "text": "3 x 1 tablet sehari sesudah makan",
      "timing": {
        "repeat": {
          "frequency": 3,
          "period": 1,
          "periodUnit": "d"
        }
      }
    }
  ],
  "dispenseRequest": {
    "quantity": {
      "value": 10,
      "unit": "TAB"
    }
  }
}
```
