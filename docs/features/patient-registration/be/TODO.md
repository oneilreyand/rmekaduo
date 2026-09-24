# TODO Backend — patient-registration

| Task | Requirement | Evidence yang direncanakan | Pemilik | Status | Catatan/blocker |
| --- | --- | --- | --- | --- | --- |
| `BE-001` | `REQ-001`, `REQ-005`, `REQ-006`, `REQ-008` | `EV-006` / ADR 0003 acceptance record | Product + integration lead | BLOCKED | Review dan setujui/tolak ADR 0003 bersama compliance, facility owner, dan BPJS PIC. Jangan memilih FKTP/FKRTL, kode faskes, credential, atau scope provider dari UI/mock/default. |
| `BE-002` | `REQ-008` | `EV-005` | Backend lead | OPEN | Definisikan master faskes, poli, tenaga medis/dokter, jadwal, dan role; tidak memakai data profesional nyata pada fixture. |
| `BE-003` | `REQ-002`, `REQ-003` | `EV-001` + test suite baru | Backend lead | OPEN | Definisikan persistence, authorization, identity matching, duplicate resolution, audit, dan idempotency key. |
| `BE-004` | `REQ-004` | Contract test | Backend lead | OPEN | Pisahkan create pendaftaran mandiri dari request provider; jangan derive status BPJS dari payment type. |
| `BE-005` | `REQ-005` | `EV-002` | Integration lead | BLOCKED | Buat adapter P-Care fail-closed, outbox/retry/reconciliation, serta sandbox contract harness setelah keputusan FKTP diterima. |
| `BE-006` | `REQ-007` | `EV-003` | Integration lead | BLOCKED | Implementasikan adapter SATUSEHAT tersendiri setelah onboarding, credential boundary, dan resource mapping diterima. |
