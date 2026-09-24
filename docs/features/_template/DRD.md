# DRD — <Nama fitur>

- **Feature ID:** `<feature-id>`
- **Status:** `DISCOVERY`
- **Owner:**
- **Tanggal dibuat / terakhir diperbarui:**
- **Target rilis:**

## Ringkasan untuk manusia

Jelaskan masalah pengguna, hasil yang dicari, dan mengapa fitur ini dibutuhkan dalam bahasa non-teknis.

## Scope

- **Termasuk:**
- **Tidak termasuk:**
- **Batas FE/BE:**
- **Data/safety/integration impact:**

## Sumber dan keputusan

| ID | Jenis | Sumber yang dapat diperiksa | Ringkasan fakta/keputusan | Status |
| --- | --- | --- | --- | --- |
| `SRC-001` | User / ADR / kontrak / sumber primer |  |  |  |

## Requirements dan acceptance criteria

| Requirement | Owner | Hasil yang dapat diamati | Metode bukti wajib | Status |
| --- | --- | --- | --- | --- |
| `REQ-001` | FE / BE / FE+BE |  | Test / browser / contract / audit | `OPEN` |

## Keputusan, asumsi, dan blocker

| ID | Jenis | Pernyataan | Dampak | Pemilik keputusan | Status |
| --- | --- | --- | --- | --- | --- |
| `DEC-001` | Decision |  |  |  |  |
| `ASSUMPTION-001` | Assumption |  |  |  |  |
| `BLOCKER-001` | Blocker |  |  |  |  |

Assumption yang memengaruhi pasien, data, security, otorisasi, biaya, kontrak, atau integrasi harus berubah menjadi blocker sampai ada keputusan eksplisit.

## Kontrak dan desain

- **API/data contract:**
- **Authorization/audit:**
- **UI/accessibility:**
- **ADR yang diperlukan:**
- **Migrations/recovery:**

## QA traceability (bila relevan)

Gunakan format lengkap di `docs/QA_TRACEABILITY.md`. `REQ-###` dan `EV-###` tetap wajib; `AC-###`, `TC-###`, dan `BUG-###` hanya dipakai ketika membantu review.

| Test case | Requirement / AC | Precondition dan input sintetis/ter-redaksi | Expected | Evidence ID | Status |
| --- | --- | --- | --- | --- | --- |
| `TC-001` | `REQ-001` |  |  | `EV-001` | `PLANNED` |

| Defect | Requirement / test | Dampak | Fix evidence | Retest evidence | Status |
| --- | --- | --- | --- | --- | --- |
| `BUG-001` | `REQ-001` / `TC-001` |  |  |  | `OPEN` |

## Evidence ledger

| Evidence ID | Requirement | Metode / perintah tepat | Input ter-redaksi | Expected | Actual | Status | Pelaksana & waktu |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `EV-001` | `REQ-001` |  |  |  |  | `PLANNED` |  |

## Release record (bila relevan)

Gunakan `docs/DEPLOYMENT_AND_ENVIRONMENTS.md` dan `docs/templates/DELIVERY_HANDOFF_TEMPLATE.md`. Semua field yang belum dibuktikan ditulis `NOT AVAILABLE`, bukan dibiarkan seolah tidak ada risiko.

| Field | Actual value atau `NOT AVAILABLE` |
| --- | --- |
| Candidate (commit/tag/build) |  |
| Environment dan configuration owner |  |
| Release owner dan decision |  |
| Coverage evidence / open defect |  |
| Recovery/rollback reference dan test status |  |

## Release checklist

- [ ] Semua `REQ` memiliki evidence `PASS` yang sesuai.
- [ ] Semua task FE/BE selesai atau diberi blocker yang disetujui.
- [ ] Kontrak, ADR, skema, dan design system terdampak telah diperbarui.
- [ ] Tidak ada claim yang melebihi evidence.
- [ ] Risiko, limitation, dan rollback/recovery telah ditulis.

## Changelog

| Tanggal | Perubahan | Oleh |
| --- | --- | --- |
| YYYY-MM-DD | DRD dibuat |  |
