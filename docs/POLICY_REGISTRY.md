# RME Policy Registry

**Status:** Active index under [ADR 0006](adr/0006-sdlc-operational-baseline.md)
**Purpose:** Stable identifiers for canonical rules. This registry never overrides or duplicates the linked source.

## Governance and documentation

| Policy ID | Canonical rule summary | Source |
| --- | --- | --- |
| `GOV-001` | Resolve conflicts by the documented source-precedence order. | [Governance §1](GOVERNANCE.md#1-purpose-and-authority) |
| `GOV-002` | Unresolved assumptions affecting clinical behavior, data, authorization, audit, contracts, routing, cost, or integrations block work. | [Feature Workflow §3](FEATURE_WORKFLOW.md#3-aturan-anti-asumsi) |
| `DOC-001` | Each substantive feature has DRD and linked FE/BE TODOs. | [Feature Workflow §1](FEATURE_WORKFLOW.md#1-struktur-wajib) |
| `DOC-002` | Evidence must record method, safe input, expected/actual result, status, and executor/time. | [Feature Workflow §4](FEATURE_WORKFLOW.md#4-evidence-ledger-yang-terukur) |
| `DOC-003` | An ADR is required for durable architecture, data, clinical, public-contract, integration, or quality-gate decisions. | [Governance §3](GOVERNANCE.md#3-decision-governance-adr) |

## Quality, QA, and release

| Policy ID | Canonical rule summary | Source |
| --- | --- | --- |
| `QA-001` | A test plan is not evidence until a linked ledger entry contains actual execution data. | [QA Traceability §2](QA_TRACEABILITY.md#2-test-case-planning) |
| `QA-002` | Retest creates new evidence; it must not rewrite the original failed result. | [QA Traceability §3](QA_TRACEABILITY.md#3-defect-and-retest-log) |
| `REL-001` | `RELEASE_READY` requires an approved release-owner decision and evidence appropriate to the feature risk. | [Governance §9](GOVERNANCE.md#9-definition-of-done) |
| `REL-002` | A release record names candidate, environment, release owner, evidence, risks, and recovery/rollback reference. | [ADR 0006](adr/0006-sdlc-operational-baseline.md) |
| `ENV-001` | An environment may be called configured or used only with recorded configuration and redacted validation evidence. | [Deployment and Environments §1](DEPLOYMENT_AND_ENVIRONMENTS.md#1-environment-register) |
| `OPS-001` | Incident and hotfix actions must be recorded as observed facts; unknown controls are `NOT AVAILABLE`. | [Incident and Hotfix §2](INCIDENT_AND_HOTFIX.md#2-immediate-triage) |

## Clinical, data, and integrations

| Policy ID | Canonical rule summary | Source |
| --- | --- | --- |
| `SAFE-001` | Patient safety, privacy, clinical correctness, and repository integrity outrank visual novelty or unsupported claims. | [Governance §1](GOVERNANCE.md#1-purpose-and-authority) |
| `SAFE-002` | Authorization is enforced at the backend/service boundary; UI visibility is not authorization. | [Governance §7](GOVERNANCE.md#7-data-privacy-and-safety-gates) |
| `DATA-001` | Do not place patient data, credentials, secrets, or unredacted sensitive evidence in source or documentation. | [Governance §7](GOVERNANCE.md#7-data-privacy-and-safety-gates) |
| `INT-001` | External integrations need official-contract, authorization, retry/idempotency, error-mapping, and redacted evidence. | [Feature Workflow §5](FEATURE_WORKFLOW.md#5-validation-plan-per-lapisan) |

## Registry rules

1. Cite a Policy ID when a plan, DRD, handoff, or ADR crosses that rule boundary.
2. Add an ID only after the canonical source exists and is approved where approval is required.
3. Change the target source first; then update this summary/link in the same change.
4. Do not use an ID to claim that runtime enforcement or an external environment has been verified.
