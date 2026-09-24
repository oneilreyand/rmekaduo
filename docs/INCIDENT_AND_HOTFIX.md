# Incident and Hotfix Procedure — RME

**Status:** Active documentation baseline under [ADR 0006](adr/0006-sdlc-operational-baseline.md)
**Scope:** Safe triage and evidence capture for suspected delivery incidents.
**Boundary:** This is not proof that monitoring, paging, feature flags, backups, contacts, or production access are configured.

## 1. When to open an incident record

Open an incident record when there is a credible report or observation of:

- potential patient-safety harm or misleading clinical information;
- possible privacy/security exposure or unauthorized access;
- data loss, corruption, auditability failure, or unsafe migration behavior;
- BPJS/SATUSEHAT or other integration behavior that can create duplicate, missing, or misleading clinical workflow outcomes;
- material service failure after a release.

Use synthetic or redacted information only. Do not paste patient identifiers, tokens, credentials, or raw sensitive payloads into the incident record.

## 2. Immediate triage

1. Record time, reporter, affected feature/environment if known, observed symptom, and evidence location.
2. Classify the suspected impact as patient safety, privacy/security, data integrity, integration, or service availability. This is a triage label, not a diagnosis or root-cause claim.
3. Pause the affected release decision. If a confirmed containment control exists, use it under the responsible operator's authority and record the actual action. If no control/contact is known, record `NOT AVAILABLE` and escalate to the product/release owner; do not invent an operational action.
4. Preserve audit-relevant evidence and avoid destructive cleanup. For record changes, respect locking/addendum requirements in the applicable clinical source.
5. Name an incident coordinator and decision owner. If either is unavailable, keep the incident open and record the blocker.

## 3. Investigation and hotfix

- Work from a feature DRD or create an incident-linked feature DRD before changing code or policy.
- State confirmed facts, unknowns, and hypotheses separately.
- A hotfix follows the same DRD, TODO, ADR, validation, and evidence requirements as other changes. Urgency does not authorize a silent bypass of authorization, auditability, or recovery planning.
- Link each defect/retest and deployed candidate through the [QA Traceability](QA_TRACEABILITY.md) convention.
- For data or integration repair, record idempotency, reconciliation, recovery/rollback, and any unprocessed or duplicate work that needs follow-up.

## 4. Closure and follow-up

An incident can be closed only when its observed containment/recovery, validation evidence, residual risk, and owner decision are recorded. Closure must not overwrite the original timeline.

Use this minimum record:

| Field | Record |
| --- | --- |
| Incident ID and linked feature/defect |  |
| Reporter, coordinator, and decision owner |  |
| Environment/candidate |  |
| Timeline of observed facts and actions |  |
| Patient-safety/privacy/data/integration impact |  |
| Containment and recovery action actually taken |  |
| Validation/retest evidence |  |
| Remaining risk and follow-up owner/date |  |
| Closure decision and rationale |  |

After closure, create a follow-up task for systemic remediation when the incident exposes a gap in policy, test coverage, environment controls, or observability.
