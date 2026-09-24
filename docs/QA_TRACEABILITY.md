# QA Traceability — RME

**Status:** Active documentation convention under [ADR 0006](adr/0006-sdlc-operational-baseline.md)
**Scope:** Test design, executed evidence, defect/retest, and their links to a feature DRD.
**Not a runtime system:** This document does not create a test-management database, issue tracker, QA application role, or external integration.

## 1. Traceability chain

```text
REQ-### / optional AC-###
  → optional TC-### test case
  → Evidence ledger EV-### actual execution
  → optional BUG-### when outcome fails
  → a new EV-### retest after repair
  → release record / known limitation
```

`REQ-###` and `EV-###` remain mandatory. `AC-###`, `TC-###`, and `BUG-###` are optional identifiers used only when they make a feature easier to review. They are unique within one feature DRD unless a future persistent system defines another namespace.

## 2. Test-case planning

Use this table in the feature DRD when one requirement has multiple scenarios or a formal test case improves review.

| Test case | Requirement / AC | Precondition and synthetic/redacted input | Steps | Expected observable result | Evidence ID | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `TC-001` | `REQ-001` |  |  |  | `EV-001` | `PLANNED` |

Test case status is separate from feature status. Allowed documentation values are `PLANNED`, `PASS`, `FAIL`, `BLOCKED`, `NOT AVAILABLE`, and `SUPERSEDED`. A test plan is not evidence until the linked ledger row contains actual execution data.

## 3. Defect and retest log

Record a defect in the feature DRD when a test or review finds an observable mismatch. Do not place patient data, credentials, raw integration payloads, or unredacted screenshots in this log.

| Defect | Requirement / test | Severity and impact | Evidence / external tracker reference | Fix evidence | Retest evidence | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `BUG-001` | `REQ-001` / `TC-001` |  | `EV-001` |  |  | `OPEN` |

- Severity describes observed impact for prioritization; it is not a clinical diagnosis or automatic release decision.
- A defect is `VERIFIED` only after a new retest evidence entry passes. The original failed result remains historical evidence.
- If the same person implements and retests, record that limitation. For high-risk clinical, data, authorization, or integration changes, seek a separately named verifier or leave the limitation visible to the release owner.

## 4. Evidence quality by test type

| Change type | Minimum test traceability |
| --- | --- |
| Documentation | Cross-link, registry/ADR reconciliation, actual command output |
| UI | Viewport/browser, state tested, keyboard/accessibility name, expected/actual |
| API | Request validation, success/error contract, authorization, compatibility |
| Data/migration | Disposable database, migration state, recovery/rollback reference, audit integrity |
| Clinical | Synthetic/redacted input, safety cue, authorization, audit, record lifecycle impact |
| BPJS/SATUSEHAT | Official contract, environment/mode, redacted correlation, retry/idempotency, error mapping |

The full validation matrix is in [Sistem Kerja Fitur](FEATURE_WORKFLOW.md). `NOT AVAILABLE` must include why it is unavailable, the impact, and what is needed to run it.

## 5. Release evidence snapshot

For a release decision, add a short snapshot to DRD or the handoff:

| Field | Record |
| --- | --- |
| Candidate identity | Commit/tag/build identifier, or `NOT AVAILABLE` |
| Environment | `local`, `test`, `sandbox`, `staging`, or `production`; include configuration evidence reference |
| Requirement coverage | `REQ`/`TC`/`EV` references and any exclusion |
| Open defects | `BUG` identifiers, impact, owner, and decision |
| Verification limitation | Missing test, same-person verification, unavailable environment, or `None recorded` |
| Release decision | Named release owner, date, `approved` / `rejected` / `blocked`, and rationale |
| Recovery | Runbook/ADR reference and whether it was actually tested |

An empty field is not proof of absence. Use `NOT AVAILABLE` when the fact has not been established.
