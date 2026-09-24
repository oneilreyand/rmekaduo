# Registry Fitur

Setiap direktori di sini adalah satu unit kerja yang dapat ditinjau manusia, programmer, dan AI dengan cara yang sama. `DRD.md` adalah titik mulai dan sumber kebenaran; `fe/TODO.md` serta `be/TODO.md` adalah rencana kerja menurut pemilik lapisan.

## Feature registry

| Feature ID | Status | DRD | Catatan |
| --- | --- | --- | --- |
| `feature-governance` | `BLOCKED` | [DRD](feature-governance/DRD.md) | PostgreSQL disposable CI sudah didefinisikan; menunggu bukti run GitHub untuk test database. |
| `ui-system` | `DISCOVERY` | [DRD](ui-system/DRD.md) | Katalog komponen dan token visual; evidence historis wajib diaudit ulang. |
| `patient-journey` | `DISCOVERY` | [DRD](patient-journey/DRD.md) | Alur admisi, antrean, triase, konsultasi, farmasi, dan kasir perlu direkonsiliasi terhadap kontrak dan safety gate. |
| `organization-platform` | `VALIDATED` | [DRD](organization-platform/DRD.md) | ADR 0004 diterima; ADR 0005 masih Proposed. P1/P2 VALIDATED (prototype): RLS 14 policy (EV-009), seluruh 21 endpoint diproteksi withAuth, HTTP boundary test 401/403/cross-branch/cross-org PASS (EV-010). Production-ready setelah ADR 0005 diterima. |
| `patient-registration` | `DISCOVERY` | [DRD](patient-registration/DRD.md) | M0 memakai [ADR 0003 Proposed](../adr/0003-pcare-first-registration-decision-pack.md); pendaftaran baru/lama, mandiri, dan JKN tetap tanpa klaim bridging yang belum terbukti. |
| `bpjs-bridging` | `DISCOVERY` | [DRD](bpjs-bridging/DRD.md) | P-Care, V-Claim, dan Antrol memerlukan bukti contract/auth/integration sebelum dapat diklaim terhubung. |
| `satusehat-bridging` | `DISCOVERY` | [DRD](satusehat-bridging/DRD.md) | OAuth, IHS, dan FHIR perlu bukti sandbox sebelum dapat diklaim tersinkronisasi. |
| `queue-display-tv` | `DISCOVERY` | [DRD](queue-display-tv/DRD.md) | Tampilan TV antrean membutuhkan acceptance UI, sumber data, dan validasi state yang jelas. |

Fitur lama yang hanya memiliki file di `docs/evidence/` belum otomatis memenuhi sistem ini. Sebelum perubahan lanjutan, migrasikan ke folder fitur dan ubah statusnya menjadi `DISCOVERY` sampai requirement dan buktinya direkonsiliasi.

## Membuat fitur

1. Salin `docs/features/_template/` menjadi `docs/features/<feature-id>/`.
2. Isi DRD hingga status `READY`; jangan mulai implementasi sebelumnya.
3. Tambahkan baris ke registry ini.
4. Buat task FE dan/atau BE yang menunjuk `REQ-###` dari DRD.
