# ADR 0006: SDLC operational baseline for roles, evidence, and release records

- **Status:** Accepted
- **Date:** 2026-09-24
- **Decision owners:** User and repository maintainers

## Context

RME already has an evidence-first feature workflow: DRD, TODO FE/BE, Evidence ledger, lifecycle status, ADR, and documentation checks. The SDLC gap audit found that the repository did not yet have a canonical delivery-role matrix, QA traceability convention, environment/release runbook, incident/hotfix procedure, policy registry, handoff template, or CI workflow.

Qlickhub is useful as a reference for artifact completeness, but its application-specific roles, persistent QA model, deployment environment, and authorization model are not facts about RME. Copying them would create unsupported operational and clinical claims.

## Decision

1. `FEATURE_WORKFLOW.md` remains the sole canonical feature lifecycle. New SDLC documents may explain responsibilities or provide runbooks, but must link to it rather than define competing feature statuses.
2. Each feature records delivery responsibility in its DRD. The roles are **scope owner**, **implementation owner**, **verifier**, and **release owner**. They are delivery responsibilities only; this ADR does not create application roles, permissions, or authorization behavior.
3. A feature may use optional `TC-###`, `BUG-###`, and retest entries in its DRD to make `REQ → test → defect/retest → evidence` traceable. The Evidence ledger remains the authoritative record of executed validation. These identifiers do not create a persistent test-management or issue-tracking system.
4. A release decision is recorded in the feature DRD or its delivery handoff. It names a release owner, environment, candidate identity, evidence references, known limitations, rollback/recovery reference, and decision. Without a named release owner and evidence appropriate to the feature risk, the feature cannot claim `RELEASE_READY`, deployment, or production readiness.
5. `local`, `test`, `sandbox`, `staging`, and `production` are environment labels for documentation. Only an environment with recorded configuration and redacted validation evidence may be described as configured or used. No deployment platform is selected by this ADR.
6. Suspected clinical safety, privacy/security, data-integrity, or external-integration incidents follow the documented incident/hotfix procedure. A procedure document does not prove that any operational control, escalation contact, backup, or rollback path exists.
7. A repository CI workflow defines documentation checks, type checking, build, and tests. It provisions only a disposable `rme_test` PostgreSQL service for database suites; a successful CI execution proves only its recorded commands. Skipped or unavailable database/integration tests remain skipped or unavailable; they are not evidence of an external environment.
8. `POLICY_REGISTRY.md` is a stable index into canonical sources. It must not duplicate policy prose or override its target.

## Evidence

- User instruction, 2026-09-24: proceed with closing the audited SDLC documentation gaps.
- [SDLC gap assessment](../SDLC_GAP_ASSESSMENT.md).
- [Feature-governance DRD](../features/feature-governance/DRD.md), `REQ-007` through `REQ-010`.

## Alternatives considered

1. Copy Qlickhub workflow and data model verbatim: rejected because it would invent RME roles, environments, authorization, and runtime QA records.
2. Keep only an audit: rejected because the team would still lack reusable operational templates and a documented release boundary.
3. Create a database-backed QA/release system now: rejected because this is a scope expansion involving data lifecycle, authorization, retention, and UI/API contracts.
4. Treat CI green output as release approval: rejected because release, clinical safety, integration, and environment evidence have separate boundaries.

## Consequences

- Future DRDs can trace QA and release decisions consistently without claiming a new runtime platform exists.
- A release owner must be identified for each actual release decision; this ADR deliberately does not name a person.
- Product must still choose a deployment platform, issue tracker (if any), and operational contacts before actual deployment or incident response can be claimed.
- If a future implementation persists test cases, defects, release records, or role permissions, it needs its own ADR, contract, schema, authorization tests, and migration plan.

## Implementation and validation links

- [Delivery workflow and roles](../SDLC_WORKFLOW_AND_ROLES.md)
- [QA traceability](../QA_TRACEABILITY.md)
- [Deployment and environments](../DEPLOYMENT_AND_ENVIRONMENTS.md)
- [Incident and hotfix procedure](../INCIDENT_AND_HOTFIX.md)
- [Policy registry](../POLICY_REGISTRY.md)
- [Delivery handoff template](../templates/DELIVERY_HANDOFF_TEMPLATE.md)
- Validation: `npm run check:docs`, `npm run build`, `npx tsc --noEmit`, `npm test` (build precedes standalone type check because Next.js generates `.next/types` during build)
