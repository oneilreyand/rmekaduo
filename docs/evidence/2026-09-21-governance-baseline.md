# Feature Evidence Record — Governance Baseline

- **Date:** 2026-09-21
- **Owner / agent:** Codex
- **Status:** Validated
- **Scope:** Establish repository-wide governance, evidence records, ADR conventions, and reconcile navigation documentation with the accepted current direction.

## Sources and decisions

- **User requirement:** Create clear governance so future models use the same evidence-based planning, validation, testing, and reporting process.
- **Governing documents:** `AGENTS.md`, `docs/AI_WORKFLOW.md`, `docs/FRONTEND_ARCHITECTURE.md`, `docs/API_CONTRACT.md`, `docs/DEV_HUB.md`.
- **ADR:** `docs/adr/0001-contextual-rme-navigation.md`.
- **Assumptions:** Documentation-only work does not require a production build; this follows the new validation matrix. No clinical or patient data was changed.

## Acceptance criteria

| Criterion | Evidence/result | Status |
| --- | --- | --- |
| One governance source defines evidence and conflict rules | `docs/GOVERNANCE.md` created | Complete |
| Agents receive the same mandatory workflow | `AGENTS.md` and `docs/AI_WORKFLOW.md` reference governance and evidence records | Complete |
| Durable navigation decision is documented | ADR 0001 records evidence, alternatives, and consequences | Complete |
| Work evidence is repeatable | Feature evidence and ADR templates added | Complete |
| Documentation no longer states the obsolete no-sidebar direction | `docs/FRONTEND_ARCHITECTURE.md` reconciled to ADR 0001 | Complete |

## Change record

- **Files changed:** `AGENTS.md`, `docs/GOVERNANCE.md`, `docs/AI_WORKFLOW.md`, `docs/FRONTEND_ARCHITECTURE.md`, `docs/DEV_HUB.md`, `docs/adr/README.md`, `docs/adr/0001-contextual-rme-navigation.md`, `docs/templates/*`, `docs/evidence/*`.
- **Data/API/authorization impact:** None. Documentation and governance only.
- **Synthetic data declaration:** No patient or synthetic clinical records introduced.
- **Migration/recovery impact:** None.

## Validation evidence

| Check | Exact command/environment | Result | Notes |
| --- | --- | --- |
| Document consistency | `rg -n -i "GOVERNANCE.md|evidence record|ADR 0001" AGENTS.md docs` and `rg -n -i "no sidebar" docs/FRONTEND_ARCHITECTURE.md AGENTS.md` | Passed | Governance references and ADR 0001 are present; no obsolete no-sidebar rule remains in the active architecture or agent guide. |
| Automated tests | `NOT AVAILABLE` | Not available | `package.json` has no test script or configured application test runner. |

## Risks, gaps, and follow-up

- Existing application changes made before this governance baseline do not yet have evidence records.
- A future CI/test setup should enforce the validation matrix and evidence/ADR checks.
- The next substantive module work must create its evidence record before implementation.

## Final report

- Governance baseline is documented; enforcement is procedural until CI gates are added.
- Evidence location: this file.
