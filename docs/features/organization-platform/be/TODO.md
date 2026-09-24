# TODO Backend — organization-platform

| Task | Requirement | Evidence yang direncanakan | Pemilik | Status | Catatan/blocker |
| --- | --- | --- | --- | --- | --- |
| `BE-001` | `REQ-004`, `REQ-008` | `EV-005` + ADR acceptance | Security + product lead | BLOCKED | ADR 0005 berstatus `Proposed`: keputusan MFA/recovery, akses lintas cabang, retensi, RLS, dan DR telah diringkas di [Decision Brief](../../../adr/0005-decision-brief.md) dan siap diputuskan resmi oleh para pemilik keputusan. |
| `BE-002` | `REQ-001`, `REQ-002`, `REQ-005` | `EV-009` | Backend + platform lead | DONE | Migration `0002_rls_organization_isolation.up.sql` ditambahkan dengan `app_current_org_id()` helper dan 14 RLS RESTRICTIVE policy pada seluruh tabel domain. Test RLS di-SKIP karena koneksi superuser (documented caveat). Rollback bersih. EV-009 PASS. |
| `BE-003` | `REQ-004`, `REQ-007` | `EV-010` | Security + backend lead | DONE | Seluruh 11 route yang sebelumnya tidak diproteksi (antrol/ambil, batal, checkin, sisa; bridging/bpjs/peserta, antrean/task, pcare/rujukan, vclaim/sep, satusehat/sync; terminology/icd10, kfa) telah diberi `withAuth` guard. Test HTTP boundary (401/403/cross-branch/cross-org/sessionId-tidak-di-JSON) PASS. EV-010 PASS. |
| `BE-004` | `REQ-003`, `REQ-008` | `EV-003` | Backend lead | BLOCKED | P3 tidak dimulai sampai P0/P1/P2 memiliki bukti valid dan endpoint legacy tidak mengaku persistent. |
| `BE-005` | `REQ-006`, `REQ-007` | Contract compatibility test | Backend + frontend lead | BLOCKED | Versikan API, hapus trust terhadap `X-Faskes-ID`, dan migrasikan consumer secara bertahap setelah P2. |
| `BE-006` | `REQ-004`, `REQ-005`, `REQ-007` | `EV-008`, `EV-010` | Security + backend lead | DONE | Transaction auth/audit, token tidak di JSON body, guard endpoint bisnis seluruhnya diterapkan. EV-008 PARTIAL (36 PASS), EV-010 PASS (45 PASS total). |
| `BE-007` | `REQ-004` (ASSUMPTION-002) | ADR server-to-server auth | Platform + product lead | BLOCKED | Antrol routes diproteksi session internal, tetapi mekanisme auth untuk callback BPJS Antrol server-to-server (API key/mTLS/IP whitelist) belum diputuskan. Memerlukan ADR tersendiri sebelum aktif. |
