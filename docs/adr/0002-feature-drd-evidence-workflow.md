# ADR 0002: Feature DRD and evidence workflow

- **Status:** Accepted
- **Date:** 2026-09-22
- **Decision owners:** Repository maintainers

## Context

Requirement, implementation notes, FE/BE work, and test evidence previously lived in different places. That makes it easy for a person or model to treat an assumption as a fact, to mark a task complete without reproducible proof, or to update code while leaving the governing documentation behind.

The repository needs one human-readable feature record that is also precise enough for automated checking.

## Decision

Every substantive feature uses `docs/features/<feature-id>/` with exactly these planning records:

- `DRD.md` — the feature source of truth: scope, sources, decisions, requirements, blockers, evidence ledger, and release checklist.
- `fe/TODO.md` — frontend tasks, each linked to a DRD requirement and evidence ID.
- `be/TODO.md` — backend tasks, each linked to a DRD requirement and evidence ID.

`docs/FEATURE_WORKFLOW.md` is the canonical lifecycle and evidence policy. `docs/CODE_STANDARDS.md` is the canonical code and documentation-writing standard. The active feature registry is `docs/features/README.md`.

An item is not `VALIDATED` or `RELEASE_READY` unless its DRD ledger records an exact validation method, safe input/fixture, expected result, actual result, result status, executor, and date. Missing infrastructure is recorded as a blocker and `NOT AVAILABLE`; it is not silently treated as passing. `docs/evidence/` is retained only as a historical archive.

## Evidence

- User requirement, 2026-09-22: one evidence-based feature document, DRD, FE/BE TODOs, strict measurable testing, and a shared method for developers and models.
- `docs/features/feature-governance/DRD.md`, requirements `REQ-001` through `REQ-004`.
- `npm run check:features` validates required feature-document structure and registry membership.

## Alternatives considered

1. Keep a standalone evidence file for each work item: rejected because requirement, TODO, and proof remain separated.
2. Use FE/BE TODOs without a DRD: rejected because there is no single source for decisions, safety boundaries, or release readiness.
3. Make a process document only: rejected because it cannot make per-feature claims inspectable or structurally verifiable.

## Consequences

- New substantive work has a small documentation setup cost before implementation begins.
- Existing historical evidence does not automatically validate an existing feature; it must be reconciled into a DRD before new feature work continues.
- The structural checker proves documentation shape and references, not application behavior. Runtime, security, accessibility, contract, and clinical claims still require the validation evidence specified by each DRD.

## Implementation and validation links

- [Feature workflow](../FEATURE_WORKFLOW.md)
- [Code standards](../CODE_STANDARDS.md)
- [Feature registry](../features/README.md)
- [Governance-system DRD](../features/feature-governance/DRD.md)
- Validation command: `npm run check:features`
