# Deployment and Environments — RME

**Status:** Active documentation baseline under [ADR 0006](adr/0006-sdlc-operational-baseline.md)
**Scope:** Environment naming, evidence boundaries, release preflight, and recovery records.
**Important:** This repository does not yet document a configured preview, staging, or production deployment target. This runbook does not assert that one exists.

## 1. Environment register

| Label | Repository evidence | What may be claimed today | Required evidence before use for a release |
| --- | --- | --- | --- |
| `local` | `npm run dev`, `.env.example`, local migration/test scripts | Local workflow is documented; no shared service is implied | Command, commit/candidate, safe configuration source, and observed result |
| `test` | Tests read `RME_TEST_DATABASE_URL`; CI defines a PostgreSQL `rme_test` service | CI configuration is present; remote execution remains unverified | Redacted database identity, migration result, test pass/fail/skip count from a remote run |
| `sandbox` | BPJS/SATUSEHAT documents mention external non-production modes | No configured sandbox identity or credentials are recorded here | Official environment identity, authorization, redacted request correlation, result |
| `staging` | No repository runbook/configuration proof found | `NOT AVAILABLE` | Deployment target, configuration owner, preflight and recovery evidence |
| `production` | No repository runbook/configuration proof found | `NOT AVAILABLE` | Approved release owner, candidate, deployment record, health/functional checks, recovery evidence |

Never record secret values in a DRD, report, CI log, issue, screenshot, or this runbook. Record variable names, owner, environment label, and redacted correlation only.

## 2. Configuration boundaries

- Configuration is environment-specific. Do not reuse a production database, integration credential, or patient data as a local/test fixture.
- `RME_TEST_DATABASE_URL` must point to a disposable test database following the test helper's name guard. The CI workflow creates `rme_test` only for its job; it does not prove staging or production readiness until a remote execution is recorded.
- Database migration, backup, and restore commands are repository capabilities. They are not a recovery proof until executed in a named environment and recorded in the feature Evidence ledger.
- External BPJS/SATUSEHAT behavior is proven only by the integration evidence required in the feature DRD. A local mock or demo label is not an external verification.

## 3. Release preflight

Before a release owner records a release decision:

1. Identify the feature, candidate (commit/tag/build), intended environment, and named release owner.
2. Confirm the DRD status and requirement/evidence coverage; include all failures, skipped tests, and `NOT AVAILABLE` entries.
3. Verify the configuration source is approved for the named environment without exposing secret values.
4. For data changes, record migration order, backward compatibility, backup/recovery procedure, and the observed result if tested.
5. For clinical, privacy/security, or integration changes, check the applicable canonical documents and record the risk/limitation.
6. Confirm an operational rollback or containment action is actually available. If untested or unknown, write `NOT AVAILABLE` and let the release owner decide whether release remains blocked.
7. Store the decision in the DRD or [delivery handoff](templates/DELIVERY_HANDOFF_TEMPLATE.md).

## 4. Deployment record

Use this table in a release handoff. Do not fill values by inference.

| Field | Actual value |
| --- | --- |
| Feature and candidate |  |
| Environment and configuration owner |  |
| Release owner and decision time |  |
| Commands/checks and result |  |
| Migration/backup/recovery evidence |  |
| Integration mode and redacted correlation |  |
| Known risks, open defects, and limitations |  |
| Rollback/containment action and test status |  |

## 5. Recovery and rollback principles

- Stop a release decision when an unresolved clinical safety, privacy/security, data-integrity, or integration risk exceeds its recorded acceptance.
- Prefer additive, backward-compatible migrations. Do not use a destructive database rollback as an improvised incident response.
- For an actual incident, follow [Incident and Hotfix](INCIDENT_AND_HOTFIX.md) and record the observed action, not a claimed action.
- A previous build, backup, feature flag, or traffic-control mechanism is only a rollback option if its availability is confirmed in the named environment.
