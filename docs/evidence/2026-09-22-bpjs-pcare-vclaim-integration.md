# Feature Evidence Record — BPJS P-Care and V-Claim Bridging Integration

- **Date:** 2026-09-22
- **Owner / agent:** Antigravity AI Pair Programmer
- **Status:** Complete
- **Scope:** BPJS P-Care (FKTP) and BPJS V-Claim (FKRTL) bridging data models, crypto utilities, service layers, interactive UI components, and facility mode configurations.

## Sources and decisions

- User requirement: "buatkan plan untuk fitur bpjs pcase dan vclaim" and auto-approved plan execution.
- Governing documents: `AGENTS.md`, `docs/GOVERNANCE.md`, `docs/BPJS_BRIDGING.md`, `docs/BPJS_ANTROL_MJKN_INTEGRATION.md`, `docs/API_CONTRACT.md`, `docs/ARCHITECTURE_AND_STACK.md`.
- ADRs: ADR 0001 (Contextual navigation for RME modules, single Next.js route `/`).
- Assumptions and why they are safe/reversible:
  - Default profile remains FKTP (Klinik Pratama Kaduo Sehat) with P-Care workflows, while adding a facility type switcher to FKRTL (Rumah Sakit) in Settings so V-Claim SEP workflows can be exercised interactively.
  - High-fidelity mock adapters provide reliable offline simulation without exposing live BPJS production credentials.
- Unresolved decisions / required approval: None (Plan approved by user review policy).

## Acceptance criteria

| Criterion | Evidence/result | Status |
| --- | --- | --- |
| Type definitions for P-Care and V-Claim contracts | Defined in `src/types/bpjs-core.ts`, `src/types/bpjs-pcare.ts`, `src/types/bpjs-vclaim.ts` | Pass |
| BPJS Cryptography & signature utilities | Implemented in `src/lib/bpjs/crypto.ts` supporting Web Crypto HMAC-SHA256 and header generator | Pass |
| P-Care service client & mock adapter | Implemented in `src/lib/bpjs/pcare-service.ts` and `src/lib/bpjs/mock-bpjs-data.ts` | Pass |
| V-Claim service client & mock adapter | Implemented in `src/lib/bpjs/vclaim-service.ts` supporting SEP and Surat Kontrol | Pass |
| Interactive UI in Admisi (Eligibility & SEP generation) | Integrated in `src/components/organisms/admission-workspace.tsx` & `src/components/molecules/` | Pass |
| Interactive UI in Konsultasi (P-Care submission & Rujukan RS) | Integrated in `src/components/organisms/clinical-consultation-workspace.tsx` & `src/components/molecules/` | Pass |
| Settings Facility Switcher (FKTP vs FKRTL & Credentials) | Integrated in `src/components/organisms/settings-workspace.tsx` | Pass |
| Type check clean | `npx tsc --noEmit` exited code 0 with 0 errors | Pass |
| Production build clean | `npm run build` compiled successfully in 2.3s | Pass |

## Change record

- Files changed:
  - `src/types/bpjs-core.ts` (NEW): Core security headers, metadata, and service types.
  - `src/types/bpjs-pcare.ts` (NEW): Full types for P-Care v2.0 (kunjungan, pelayanan, rujukan).
  - `src/types/bpjs-vclaim.ts` (NEW): Full types for V-Claim v2.0 (SEP, rujukan, surat kontrol).
  - `src/lib/bpjs/crypto.ts` (NEW): Universal HMAC-SHA256 and BPJS header generator.
  - `src/lib/bpjs/mock-bpjs-data.ts` (NEW): High-fidelity mock participants, referrals, and hospital quotas.
  - `src/lib/bpjs/pcare-service.ts` (NEW): P-Care client for eligibility, registration, encounter, and vertical referral.
  - `src/lib/bpjs/vclaim-service.ts` (NEW): V-Claim client for checking referral, SEP generation, and Surat Kontrol.
  - `src/components/molecules/bpjs-eligibility-card.tsx` (NEW): Visual safety-cued card for verified BPJS participants.
  - `src/components/molecules/vclaim-sep-modal.tsx` (NEW): Modal dialog for issuing and printing SEP with barcode.
  - `src/components/molecules/pcare-rujukan-modal.tsx` (NEW): Modal dialog for issuing P-Care vertical referral to RS with TACC criteria.
  - `src/components/organisms/admission-workspace.tsx` (MODIFY): Added BPJS eligibility check & V-Claim SEP modal trigger.
  - `src/components/organisms/clinical-consultation-workspace.tsx` (MODIFY): Added P-Care encounter sync, P-Care RS referral modal, and V-Claim Surat Kontrol trigger.
  - `src/components/organisms/settings-workspace.tsx` (MODIFY): Added FKTP vs FKRTL facility switcher and live BPJS HMAC-SHA256 signature ping test.
  - `docs/BPJS_BRIDGING.md` (MODIFY): Added sections 5 (P-Care v2.0) and 6 (V-Claim v2.0).
- Data/API/authorization impact: Purely additive and client-side simulation with typed service abstractions; does not leak credentials or patient data.
- Synthetic data declaration: All sample participants, card numbers, SEP numbers, and rujukan codes are synthetic mock data (`0001234567890`, `0123R001...`).
- Migration or recovery impact: None; no destructive database migrations.

## Validation evidence

| Check | Exact command/environment | Result | Notes |
| --- | --- | --- | --- |
| Type check | `npx tsc --noEmit` | Pass (0 errors) | Verified TypeScript 5.7 compatibility |
| Production build | `npm run build` | Pass (Compiled in 2.3s) | Verified Next.js 15.1.7 client bundle |

## Risks, gaps, and follow-up

- Known risk: Live TrustMark BPJS connectivity requires whitelisted IP and valid Cons-ID/User-Key from BPJS IT division; deterministic contract mock adapter is used for development/testing.
- Skipped validation and impact: Live BPJS API calls skipped due to absence of production credentials; simulated via deterministic contract mock adapter.
- Next action: Ready for staging deployment and review.

## Final report

- Delivered behavior: Complete dual-track BPJS bridging module (P-Care for FKTP and V-Claim for FKRTL) integrated seamlessly into the RME single-page workspace.
- Evidence location/links: `docs/evidence/2026-09-22-bpjs-pcare-vclaim-integration.md`
- Handoff notes: All new components adhere strictly to Atomic Design hierarchy, keyboard accessibility, and clinical safety color/text standards.
