# RME Agent Guide

## Purpose and source of truth

RME is an Indonesian electronic medical-record product. Preserve patient safety, privacy, and clinical clarity over visual novelty. Read `docs/GOVERNANCE.md`, `docs/FEATURE_WORKFLOW.md`, the active feature DRD, the relevant domain document, and applicable ADRs before changing behavior. Product requirements, approved ADRs, API contracts, and applicable regulations are evidence; guesses are not.

## Mandatory workflow

1. Inspect the affected code and identify its owning layer.
2. Read `docs/GOVERNANCE.md`, `docs/FEATURE_WORKFLOW.md`, the active feature DRD, matching domain document, relevant ADRs, and existing component examples.
3. Create or update `docs/features/<feature-id>/DRD.md` and the relevant `fe/TODO.md` or `be/TODO.md` before substantive work. Each implementation task must point to a `REQ-###` and planned Evidence ID.
4. State any assumption that is not supported by repository evidence or an approved official source. Assumptions affecting patients, data, authorization, audit, contracts, routing, cost, or integrations are blockers until explicitly decided.
5. Make the smallest complete change possible.
6. Verify according to `docs/FEATURE_WORKFLOW.md`; jalankan `npm run check:docs` untuk setiap perubahan dokumentasi. TypeScript dan production build wajib untuk perubahan frontend.
7. Update the DRD, TODO, governing contract, and ADR when architecture, public component API, workflow, navigation, or data behavior changes.
8. Record changed behavior, exact validation inputs/expected/actual results, assumptions, and remaining risks in the DRD Evidence ledger. Do not mark work validated without the required proof.

Do not invent clinical rules, API fields, regulatory claims, patient data, or integration behavior. Ask for a decision when evidence is absent.

## Shared-workspace protection

This workspace may be changed by a user, another agent, or a running development server at any time. Before editing a file, inspect its current contents and modification time. Immediately before a large replacement or deletion, re-read the target and confirm it still contains the state you inspected.

- Never restore, overwrite, or delete another implementation merely because it conflicts with an earlier task summary.
- If a newer change changes the page entry point, layout, component ownership, or visual direction, stop and report the conflict with file names and evidence. Continue only after the user explicitly chooses the intended direction.
- Treat a running server's rendered UI as evidence of a specific process, not automatically as the current workspace source. Confirm the port, source entry point, and current file contents before drawing conclusions.
- Prefer additive, isolated work while another change is active. Destructive cleanup requires explicit user authorization and a final reference search.
- At handoff, report the feature ID, changed page-entry/configuration files, Evidence IDs, unresolved blockers, and the next TODO so another agent can avoid undoing it.

## Frontend architecture

Use Atomic Design with a one-way dependency graph:

`atoms -> molecules -> organisms -> templates -> app`

- `atoms` are context-free primitives. They must not import molecules, organisms, templates, or app modules.
- `molecules` combine atoms for one focused interaction.
- `organisms` compose molecules and atoms into independently usable UI regions.
- `templates` arrange organisms and hold page-level client state.
- `src/app` only composes a template and defines Next.js entry points.

Avoid duplicate markup for a component showcase: previews must use the same production components. Use explicit typed props, accessible names for controls, keyboard focus states, and semantic HTML.

## Routing and dependencies

This project intentionally exposes a single Next.js route: `/`. Internal module navigation and contextual sidebars are template-owned state under ADR 0001. Do not add pages, route segments, `next/link`, redirects, or URL-driven router state without a new ADR and user approval. Do not add a dependency when a platform API or an existing package solves the need. Explain and document every approved new dependency.

## Data and safety

Never place real patient data, credentials, or secrets in source, fixtures, documentation, screenshots, or logs. Label synthetic data clearly. Clinical safety cues must use text and icons in addition to color. Preserve auditability and do not silently discard user-entered clinical data.

## Quality bar

Run `npm run check:docs` after documentation changes, and run `npx tsc --noEmit` plus `npm run build` after frontend changes. Record exact outcomes and unavailable test environments in the feature DRD. Resolve errors rather than suppressing them with broad casts, disabled lint rules, or `@ts-ignore`. Keep components small, remove unused code in the same change, and prefer tests that prove observable behavior over implementation details. Follow `docs/CODE_STANDARDS.md` for all code and documentation updates.
