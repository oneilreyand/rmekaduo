# DRD — Bridging SATUSEHAT

- **Feature ID:** `satusehat-bridging`
- **Status:** `DISCOVERY`
- **Owner:** Integration lead dan compliance owner
- **Tanggal dibuat / terakhir diperbarui:** 2026-09-22
- **Target rilis:** Setelah onboarding sandbox dan resource mapping disetujui

## Ringkasan untuk manusia

SATUSEHAT bukan sekadar membuat ID lokal atau menandai encounter selesai. Bridging harus memperoleh token dari partner terverifikasi, memetakan data ke resource FHIR yang tepat, mengirim ke environment yang disetujui, dan menyimpan hasil provider yang dapat direkonsiliasi.

## Scope

- **Termasuk:** Onboarding/Organization prerequisite, OAuth client credentials, token handling, Patient/IHS lookup, FHIR mapping, outbox/retry, response/error mapping, audit, dan mode mock/sandbox/live.
- **Tidak termasuk:** Menyatakan resource telah terkirim karena objek FHIR berhasil dibuat di memori.
- **Batas FE/BE:** BE mengelola credential, request, response, mapping, dan audit; FE hanya membaca status terotorisasi dari BE.
- **Data/safety/integration impact:** Sangat tinggi; NIK, IHS, data klinis, dan credential harus dilindungi/redaksi.

## Sumber dan keputusan

| ID | Jenis | Sumber yang dapat diperiksa | Ringkasan fakta/keputusan | Status |
| --- | --- | --- | --- | --- |
| `SRC-001` | Sumber primer | [Autentikasi SATUSEHAT](https://satusehat.kemkes.go.id/platform/docs/id/api-catalogue/authentication/) | OAuth `client_credentials` hanya untuk partner terverifikasi; credential bersifat rahasia dan terikat Organization ID. | Confirmed |
| `SRC-002` | Sumber primer | [Endpoint information](https://satusehat.kemkes.go.id/platform/docs/id/postman-workshop/endpoint-information/) dan [Interoperabilitas](https://satusehat.kemkes.go.id/platform/docs/id/api-catalogue/integrations/) | Sandbox dan production terpisah; request FHIR memakai Bearer token. | Confirmed |
| `SRC-003` | Sumber primer | [Patient API](https://satusehat.kemkes.go.id/platform/docs/id/api-catalogue/onboardings/apis/patient/) | Lookup Patient dapat menggunakan identifier NIK dengan Bearer token. | Confirmed |
| `SRC-004` | Source audit | `src/server/integrations/satusehat/satusehat-client.ts`, `src/app/api/v1/bridging/satusehat/encounters/[id]/sync/route.ts` | Client dapat membuat token/IHS/hasil sync sintetis dan route menandai selesai tanpa bukti request bundle ke provider. | Confirmed |

## Requirements dan acceptance criteria

| Requirement | Owner | Hasil yang dapat diamati | Metode bukti wajib | Status |
| --- | --- | --- | --- | --- |
| `REQ-001` | BE | Credential diambil dari secret store server-side, terikat Organization ID, tidak pernah fallback ke token sintetis pada sandbox/live. | Config/secret scan + sandbox OAuth success/error test. | OPEN |
| `REQ-002` | BE | Lookup IHS mengembalikan hasil provider atau error eksplisit; ID lokal tidak boleh diperlakukan sebagai IHS. | Sandbox Patient lookup contract test. | OPEN |
| `REQ-003` | BE | Bundle/resource FHIR sesuai use case dan profil resmi yang versinya dicatat; response provider, error, dan correlation ID disimpan. | Validasi FHIR/profile + sandbox transaction test. | OPEN |
| `REQ-004` | BE | Retry/outbox/idempotency/reconciliation aman dan teraudit; kegagalan sinkronisasi tidak mengubah status menjadi selesai. | Failure/retry/restart test. | OPEN |
| `REQ-005` | FE | UI menyatakan `mock`, `sandbox`, `queued`, `failed`, atau `accepted` sesuai read model; tidak ada success cue palsu. | Controlled-response browser/accessibility test. | OPEN |

## Keputusan, asumsi, dan blocker

| ID | Jenis | Pernyataan | Dampak | Pemilik keputusan | Status |
| --- | --- | --- | --- | --- | --- |
| `BLOCKER-001` | Blocker | Partner/Organization onboarding, sandbox credential, dan resource/use-case yang berlaku belum dibuktikan. | Tidak ada akses atau claim sinkronisasi SATUSEHAT. | Integration + compliance owner | Open |
| `BLOCKER-002` | Blocker | Client saat ini fail-open dengan token/ID/hasil sinkronisasi sintetis. | Harus diganti fail-closed sebelum sandbox/live. | Backend lead | Open |
| `BLOCKER-003` | Blocker | Tidak ada suite FHIR profile/transaction/retry test dan evidence ter-redaksi. | Tidak dapat menilai validitas klinis atau interoperabilitas. | Integration lead | Open |

## Kontrak dan desain

- **API/data contract:** Batas internal harus memisahkan command `enqueue sync` dari status hasil provider; resource/profile/version dicatat per job.
- **Authorization/audit:** Credential hanya server-side; akses sync dan status mengikuti role; request/response logging harus ter-redaksi.
- **UI/accessibility:** Lihat `patient-registration` `REQ-006`; UI tidak memanggil SATUSEHAT langsung.
- **ADR yang diperlukan:** Ya — credential/token lifecycle, FHIR use case/resource mapping, outbox/retry, dan data retention.
- **Migrations/recovery:** Job dapat diulang idempotent dan direkonsiliasi tanpa menggandakan resource/provider write.

## Evidence ledger

| Evidence ID | Requirement | Metode / perintah tepat | Input atau fixture ter-redaksi | Hasil yang diharapkan | Hasil aktual | Status | Pelaksana & waktu |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `EV-001` | `REQ-001`, `REQ-002` | Sandbox OAuth + Patient lookup dari source primer SATUSEHAT. | Credential test dan NIK sintetis/ter-redaksi. | Token/provider response atau error nyata direkam tanpa rahasia. | Sandbox onboarding/credential tidak tersedia. | NOT AVAILABLE | — |
| `EV-002` | `REQ-003`, `REQ-004` | FHIR profile validation dan sandbox transaction/failure/retry test. | Bundle sintetis/ter-redaksi. | Provider response/error dan outbox audit dapat direkonsiliasi. | Harness dan environment belum tersedia. | NOT AVAILABLE | — |
| `EV-003` | `REQ-005` | Browser controlled-response test. | Data sintetis. | UI tidak menyatakan sync berhasil atas response mock/error. | Belum direncanakan sebagai suite test. | PLANNED | — |

## Release checklist

- [ ] Onboarding/Organization dan sandbox credential diverifikasi pemilik integrasi.
- [ ] Tidak ada token/IHS/hasil sync sintetis pada jalur sandbox/live.
- [ ] OAuth, FHIR profile, transaction/error/retry evidence PASS.
- [ ] Redaction/secret scan dan audit trail PASS.
- [ ] UI status provider dibuktikan dari read model.

## Changelog

| Tanggal | Perubahan | Oleh |
| --- | --- | --- |
| 2026-09-22 | DRD discovery dibuat dari audit code dan dokumentasi primer SATUSEHAT. | Codex |
