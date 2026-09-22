# Feature Evidence Record — End-to-End Patient Journey Lifecycle Workspaces

- **Date:** 2026-09-22
- **Owner / agent:** Antigravity (Senior UI/UX & Clinical Systems Architect)
- **Status:** Complete
- **Scope:** Implement the complete end-to-end patient lifecycle workspaces in the RME single-page application conforming to `docs/DEV_HUB.md`, `docs/BPJS_ANTROL_MJKN_INTEGRATION.md`, and ADR 0001:
  1. Shared Patient Journey in-memory state (`patient-journey-context.tsx`)
  2. Admission & Patient Registration workspace (`AdmissionWorkspace`)
  3. Waiting Room TV Queue Display (`QueueDisplayWorkspace`)
  4. Nurse Triage & STARKES Screening workspace (`TriageWorkspace`)
  5. Pharmacy & Cashier Dual-Tab Workspace (`PharmacyCashierWorkspace`)
  6. Header Role Switcher & Menu Navigation in `AppHeader` and `SinglePageShell`

## Sources and decisions

- **User requirement:** 
  - Alur pendaftaran pasien dan perubahan status: Menunggu Antrean -> Dilayani Suster -> Dilayani Dokter -> Apotek -> Kasir.
  - Terminologi medis resmi dan plan penerapan UI/UX.
  - Prioritas urutan: Admisi -> Antrean Display -> Triase Perawat -> Farmasi & Kasir.
  - Auth/Role mode: Role-switch dropdown di header (demo/prototype tanpa backend auth).
  - Apotek & Kasir digabung dalam 1 view (2 tab).
- **Governing documents:** `AGENTS.md`, `docs/GOVERNANCE.md`, `docs/DEV_HUB.md`, `docs/BPJS_ANTROL_MJKN_INTEGRATION.md`, `docs/API_CONTRACT.md`, `docs/STARKES_COMPLIANCE.md`, `docs/UI_UX_DESIGN_SYSTEM.md`.
- **ADRs:** `docs/adr/0001-contextual-rme-navigation.md` (Strict single Next.js route `/`, template-owned navigation state).
- **Assumptions and why they are safe/reversible:**
  - In-memory React Context provides live state for queue progression without requiring persistent backend database during prototype verification.
  - All mock patients are clearly synthetic (e.g. "Tn. Budi Santoso", "Ny. Siti Nurhaliza", "An. Dimas Pratama").
  - BPJS Task IDs 1 to 7 are visually mapped and documented in the UI and state transitions.

## Acceptance criteria

| Criterion | Evidence/result | Status |
| --- | --- | --- |
| Single-route compliance preserved | `src/app/page.tsx` unchanged; all views rendered through `SinglePageShell` | Complete |
| Patient Journey context created | `src/context/patient-journey-context.tsx` with full status machine (`BOOKED` -> `IN_QUEUE` -> `IN_CONSULTATION` -> `PHARMACY_QUEUE` -> `COMPLETED`) | Complete |
| Admission Workspace implemented | `src/components/organisms/admission-workspace.tsx` with search, BPJS check, poli selection, queue ticket generation | Complete |
| Queue Display Workspace implemented | `src/components/organisms/queue-display-workspace.tsx` waiting room TV dashboard with live calling indicators | Complete |
| Triage Workspace implemented | `src/components/organisms/triage-workspace.tsx` nurse assessment with vital signs and mandatory STARKES screening | Complete |
| Pharmacy & Cashier Workspace implemented | `src/components/organisms/pharmacy-cashier-workspace.tsx` dual tab (Dispensing e-Resep & Billing/Kasir SEP clearance) | Complete |
| Clinical Consultation Workspace updated | `src/components/organisms/clinical-consultation-workspace.tsx` connected to shared queue context to load triaged patients | Complete |
| Role switcher in Header | `src/components/molecules/role-switcher.tsx` embedded in `AppHeader` to switch between Loket Admisi, TV Antrean, Triase, Dokter, Farmasi & Kasir | Complete |
| Quality Gates | `npx tsc --noEmit` and `npm run build` pass cleanly | Complete |

## Change record

- **Files changed:**
  - `src/types/rme.ts`: Enhanced `Encounter` and added `BillingInfo` interface.
  - `src/context/patient-journey-context.tsx`: [NEW] In-memory queue & lifecycle state provider.
  - `src/components/atoms/queue-number-badge.tsx`: [NEW] Queue ticket number badge with state color-coding.
  - `src/components/molecules/patient-search-autocomplete.tsx`: [NEW] NIK and RM autocomplete for admission.
  - `src/components/molecules/queue-ticket-card.tsx`: [NEW] Queue ticket card with status & call triggers.
  - `src/components/molecules/role-switcher.tsx`: [NEW] Dropdown selector to switch between clinical personas.
  - `src/components/organisms/admission-workspace.tsx`: [NEW] Phase 1 outpatient registration workspace.
  - `src/components/organisms/queue-display-workspace.tsx`: [NEW] Waiting room TV display with audio announcement simulation.
  - `src/components/organisms/triage-workspace.tsx`: [NEW] Phase 2 nurse triage with TTV and STARKES screening.
  - `src/components/organisms/pharmacy-cashier-workspace.tsx`: [NEW] Phase 4 & 5 medication dispensing & cashier clearance.
  - `src/components/organisms/app-header.tsx`: Added new `AppMenu` options, embedded `RoleSwitcher` and nav pills.
  - `src/components/organisms/clinical-consultation-workspace.tsx`: Synchronized with `PatientJourneyContext` and added patient queue selector strip.
  - `src/components/templates/single-page-shell.tsx`: Integrated all new workspaces wrapped in `PatientJourneyProvider`.

## Validation evidence

| Check | Exact command/environment | Result | Notes |
| --- | --- | --- | --- |
| Type Check | `npx tsc --noEmit` | Exit code 0 | Zero TypeScript compilation errors |
| Production Build | `npm run build` | Exit code 0 | Next.js 15.5.25 compiled in 2.5s, route `/` is 31.8 kB |
| Governance Policy | Architectural inspection | Compliant | Single-route policy (ADR 0001) strictly preserved |
