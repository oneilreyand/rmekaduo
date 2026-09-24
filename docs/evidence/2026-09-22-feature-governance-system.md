# Feature Evidence Record — Feature governance system

- **Date:** 2026-09-22
- **Owner / agent:** Codex
- **Status:** Validated (historical implementation record)
- **Scope:** Consolidate feature planning, FE/BE TODOs, DRDs, code standards, evidence, and documentation-update rules into a single human-readable operating system for developers and AI agents.

## Sources and decisions

- **User requirement:** Every model and programmer must use one evidence-based, measurable, and strictly tested feature document. Each feature needs a DRD plus FE and BE TODOs in one feature folder. Code and documentation updates must follow one shared method.
- **Governing documents:** `AGENTS.md`, `docs/GOVERNANCE.md`, `docs/AI_WORKFLOW.md`, `docs/FRONTEND_ARCHITECTURE.md`, accepted ADRs, and applicable domain contracts.
- **Decision boundary:** This is documentation/process architecture only. It does not validate, approve, or alter existing clinical, integration, or API implementations.

## Acceptance criteria

| Criterion | Evidence/result | Status |
| --- | --- | --- |
| One canonical feature workflow is defined | `docs/FEATURE_WORKFLOW.md` and ADR 0002 define the lifecycle and evidence rules. | PASS |
| Every active feature has a human-readable DRD and separated FE/BE TODOs | `npm run check:docs` returned `Feature documentation checked: 5 feature(s). Documentation links checked: 30.` | PASS |
| Claims are distinguishable from measured evidence | DRD templates require source IDs, requirement IDs, decision/assumption/blocker IDs, and evidence IDs with expected vs actual results. | PASS |
| Code and documentation update rules are explicit | `docs/CODE_STANDARDS.md`, `AGENTS.md`, and `docs/GOVERNANCE.md` point to one workflow. | PASS |
| Existing governance links to the new structure without duplication | Governance, AI workflow, Dev Hub, frontend architecture, and README point to the canonical feature workflow. | PASS |

## Validation record

| Command / review | Expected | Actual | Result |
| --- | --- | --- | --- |
| `npm run check:docs` | Every active feature folder has DRD, FE TODO, BE TODO, required headings, IDs, status/registry consistency, registry membership, and valid local Markdown links. | `Feature documentation checked: 5 feature(s). Documentation links checked: 30.` | PASS |
| Entry-point link review | Human and agent entry points lead to the same workflow. | `AGENTS.md`, README, Governance, AI workflow, Dev Hub, and frontend architecture were reconciled. | PASS |

New feature work must record evidence in its DRD ledger. This file remains as the historical record of the governance-system rollout.
