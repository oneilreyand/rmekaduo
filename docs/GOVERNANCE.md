# RME Engineering & AI Governance

## 1. Purpose and authority

This document is the operating source of truth for people and AI agents making changes in RME. Its goal is repeatable, evidence-based delivery that protects patient safety, privacy, clinical correctness, and repository integrity.

When sources conflict, use this order:

1. The newest explicit user instruction.
2. Applicable law, security requirements, and patient-safety constraints.
3. Approved ADRs and approved API/database/integration contracts.
4. This governance document and `AGENTS.md`.
5. Domain and architecture documents in `docs/`.
6. Existing implementation, only when it does not conflict with a higher source.
7. A clearly labelled, reversible assumption that does not change clinical, data, authorization, or public behavior.

If a conflict changes clinical behavior, patient data, authorization, routing, integration, or persistence, stop and request a decision. Do not resolve it by guessing.

## 2. Document registry

| Source | Authority | Required when |
| --- | --- | --- |
| `AGENTS.md` | Universal repository rules | Every change |
| `docs/GOVERNANCE.md` | Delivery, evidence, and decision rules | Every change |
| `docs/FEATURE_WORKFLOW.md` | Canonical feature lifecycle, DRD, TODO, and evidence ledger | Every substantive feature change |
| `docs/CODE_STANDARDS.md` | Code-writing and documentation-update rules | Every code or contract change |
| `docs/features/<feature-id>/DRD.md` | Feature source of truth | Every change within that feature |
| `docs/features/<feature-id>/fe/TODO.md`, `be/TODO.md` | Layer-owned implementation plan | Frontend or backend work |
| `docs/SDLC_KNOWLEDGE_MAP.md` | Navigation map to existing SDLC sources; it creates no competing policy | Cross-role delivery or SDLC documentation work |
| `docs/SDLC_GAP_ASSESSMENT.md` | Audited documentation parity and explicitly undecided SDLC gaps | SDLC process planning or before proposing a new gate/tool |
| `docs/SDLC_WORKFLOW_AND_ROLES.md` | Delivery responsibilities, handoff, QA traceability, and release-record boundary; lifecycle remains in Feature Workflow | Cross-role delivery, review, or release decision work |
| `docs/QA_TRACEABILITY.md` | Documentation convention for test cases, defects, retests, and release evidence | QA planning, validation, defect, or retest work |
| `docs/DEPLOYMENT_AND_ENVIRONMENTS.md` | Environment labels, preflight, release records, and evidence boundaries | Environment, deployment, migration, or rollback work |
| `docs/INCIDENT_AND_HOTFIX.md` | Incident triage, hotfix, and follow-up procedure | Suspected safety, privacy/security, data, integration, or release incident |
| `docs/POLICY_REGISTRY.md` | Stable IDs that point to canonical rules without competing with them | Plans, DRDs, handoffs, and ADRs crossing policy boundaries |
| `docs/DEV_HUB.md` | RME domain map and patient journey | Domain/module work |
| `docs/API_CONTRACT.md` | API contract | API, UI data, or integration work |
| `docs/DATABASE_SCHEMA.md` | Persistence and audit schema | Data/migration work |
| `docs/BPJS_*.md`, `docs/SATUSEHAT_FHIR.md` | External integration rules | Bridging work |
| `docs/STARKES_COMPLIANCE.md` | Clinical compliance safeguards | Clinical record, audit, safety work |
| `docs/UI_UX_DESIGN_SYSTEM.md` | Clinical UI rules and visual tokens | UI work |
| `docs/FRONTEND_ARCHITECTURE.md` | Next.js, route, navigation, and component boundaries | Frontend work |
| `docs/adr/*.md` | Approved durable decisions | Any potentially conflicting proposal |

Each substantive document must state facts, not unverified implementation claims. `FEATURE_WORKFLOW.md` is the canonical delivery procedure; do not duplicate a competing feature workflow elsewhere. A document update is required whenever its governed behavior changes.

## 3. Decision governance (ADR)

Create an ADR before or alongside a durable decision that changes any of the following:

- navigation, routing, or component ownership;
- data lifecycle, persistence, retention, or audit behavior;
- clinical workflow, safety checks, medical-record locking, or authorization;
- API/public contract, external dependency, BPJS, or SATUSEHAT integration;
- a repository-wide quality gate or agent workflow.

Name ADRs as `NNNN-short-kebab-title.md`. An ADR must have: status, date, context, decision, evidence, alternatives, consequences, and implementation/validation links. Only `Accepted` ADRs are binding. Superseded ADRs must name their replacement.

## 4. Mandatory delivery lifecycle

Every work item follows this lifecycle.

1. **Discover** — Read the registry sources that govern the work. Inspect current source ownership and working-tree state.
2. **Feature DRD** — Create or update `docs/features/<feature-id>/DRD.md` and the applicable FE/BE TODO before substantive implementation. Record scope, sources, assumptions, blockers, measurable acceptance criteria, and planned Evidence IDs.
3. **Decide** — Add or update an ADR if the work crosses an ADR boundary. Obtain user direction for unresolved material choices.
4. **Implement** — Change the smallest owning layer. Preserve unrelated work and never copy production patient data into examples, tests, screenshots, or logs.
5. **Validate** — Run the matrix in section 5. Record exact commands, inputs, expected/actual results, and pass/fail/skip counts in the DRD Evidence ledger.
6. **Review** — Check the acceptance criteria, errors, empty/loading/disabled states, authorization boundary, and accessibility where applicable.
7. **Report** — Update feature status, DRD, FE/BE TODO, changed files, evidence, assumptions, known gaps, and next action. A change is not done merely because code compiles.

Historical records remain under `docs/evidence/`. New work stores its evidence ledger in the feature DRD. Do not store secrets, access tokens, real patient data, or externally sensitive screenshots in either location.

## 5. Validation matrix

| Change class | Minimum validation evidence |
| --- | --- |
| Documentation only | Cross-links checked; affected policy/ADR references reconciled |
| UI/component | Type check, production build, wide and narrow browser check, keyboard focus/accessibility names |
| UI with interaction | UI/component checks plus observable interaction test; loading, empty, error, and disabled states where relevant |
| Clinical workflow | Feature tests plus authorization, safety cues, audit behavior, record locking/addendum impact, and explicit synthetic-data declaration |
| API/contract | Contract tests, request validation, authorization tests, error response tests, and compatibility review |
| Database/migration | Migration from clean disposable database, rollback/recovery plan where destructive, audit-trail verification |
| BPJS/SATUSEHAT | Official contract verification, signature/auth test, retry/idempotency behavior, redacted integration evidence |

For frontend changes, `npx tsc --noEmit` and `npm run build` are mandatory. The complete validation plan, evidence fields, and status gates are defined in `FEATURE_WORKFLOW.md`. If a required test runner or integration environment does not exist, record it as `NOT AVAILABLE` with the impact; never imply that an unavailable test passed.

## 6. Evidence standard

Evidence must be reproducible and recorded in the feature DRD ledger. It must include:

- feature ID, date, owner/agent, and lifecycle status;
- source references and policy/ADR identifiers used;
- acceptance criteria and the observable result for each;
- exact commands, input/fixture, expected and actual outcome, and relevant pass/fail/skip count;
- browser/device width or environment used for visual checks;
- synthetic-data declaration when example data exists;
- assumptions, risks, skipped checks, and follow-up work.

Build output alone is not complete evidence for a clinical, data, integration, or authorization change. A mock adapter only proves the mock adapter unless the ledger identifies a verified external environment.

## 7. Data, privacy, and safety gates

- Never use real patient data, NIK, medical record numbers, credentials, tokens, or unredacted clinical screenshots in source, fixtures, evidence, or prompts.
- A UI cue is never authorization. The backend/service boundary must enforce access.
- Critical allergy, fall-risk, and other patient-safety states require text and icons in addition to color.
- Medical-record updates must preserve auditability. Locked records require the documented addendum process; no silent overwrite or deletion.
- External integration operations must be safe to retry and must not block clinical completion paths.

## 8. Conflict and handoff rules

- Re-read a target immediately before a broad edit. If ownership or direction changed, stop and report the conflict with file evidence.
- A browser tab is not source-of-truth evidence until its server port, route entry, and on-disk source are confirmed.
- Handoffs must name changed entry points, configuration changes, commands run, evidence location, and known risks.
- No model may claim compliance, test success, deployment success, patient-safety readiness, external integration, record locking, or authorization without recorded evidence at the corresponding boundary.

## 9. Definition of done

A work item is `VALIDATED` only when its DRD requirements and FE/BE TODO are reconciled, applicable ADRs/docs are aligned, required validation evidence is recorded, no known critical safety/security gap remains, and the final report names any non-blocking limitations. `RELEASE_READY` additionally requires an approved release owner decision. A missing test environment keeps the relevant requirement blocked unless explicitly waived.
