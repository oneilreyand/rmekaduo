# Panduan Ringkas untuk AI dan Programmer

Dokumen ini sengaja ringkas agar aturan kerja tidak terpecah. Sumber prosedur lengkap adalah [FEATURE_WORKFLOW.md](FEATURE_WORKFLOW.md); standar kode adalah [CODE_STANDARDS.md](CODE_STANDARDS.md); kebijakan keselamatan dan otoritas sumber adalah [GOVERNANCE.md](GOVERNANCE.md).

## Urutan baca sebelum bekerja

1. `AGENTS.md`
2. `docs/GOVERNANCE.md`
3. `docs/SDLC_KNOWLEDGE_MAP.md` untuk menemukan sumber yang relevan
4. `docs/FEATURE_WORKFLOW.md`
5. `docs/SDLC_WORKFLOW_AND_ROLES.md` serta `docs/QA_TRACEABILITY.md` bila perubahan melalui review, retest, atau release
6. `docs/features/<feature-id>/DRD.md`
7. TODO FE atau BE yang relevan, ADR diterima, dan kontrak/domain terkait.

## Aturan cepat

- Jangan mulai implementasi sebelum DRD berstatus `READY` dan task menunjuk `REQ-###`.
- Jangan membuat claim lebih kuat daripada Evidence ledger.
- Catat assumption; block perubahan yang menyentuh pasien, data, security, authorization, audit, contract, routing, cost, atau integrasi bila belum ada keputusan.
- Perbarui DRD/TODO/ADR/contract pada commit yang sama dengan perubahan perilaku.
- Jangan menimpa perubahan agent lain; re-read target dan laporkan konflik.

Untuk template dan registry fitur, lihat `docs/features/README.md`.
