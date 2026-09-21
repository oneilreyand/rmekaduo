# AI Workflow for RME

## Read before changing code

1. `AGENTS.md` and `docs/GOVERNANCE.md` for universal repository rules and evidence requirements.
2. Relevant accepted ADRs, then `docs/FRONTEND_ARCHITECTURE.md` for UI ownership and routing limits.
3. The relevant domain document in `docs/` for clinical, BPJS, SATUSEHAT, API, or data work.
4. Existing component APIs and their callers.

## Evidence ladder

Use evidence in this order:

1. An explicit user requirement.
2. An approved repository decision or contract.
3. Official primary documentation for a framework, standard, or integration.
4. A clearly marked assumption that does not affect safety, data, or public behavior.

Never treat a code comment, placeholder, or generated example as a clinical requirement. Never fabricate a missing value to unblock a patient-facing flow.

## Implementation protocol

- Create or update a `docs/evidence/` record from `docs/templates/FEATURE_EVIDENCE_TEMPLATE.md` before substantive work.
- Make changes in the owning Atomic Design layer; do not bypass it by embedding large UI blocks in pages.
- Keep one concern per component and expose behavior through typed props.
- Include loading, disabled, error, focus, and empty states whenever the component's purpose requires them.
- Keep sensitive data out of mocks and use representative but synthetic values.
- Avoid routes and new dependencies unless explicitly approved and documented.

## Shared workspace and instruction resolution

Before changing an existing implementation, re-read the target files and record what currently owns the behavior. Do not use an old task summary, a stale preview, or an earlier browser tab as authority to overwrite newer code.

If requirements conflict, apply this order: the newest explicit user instruction; then approved ADRs/contracts; then current code only when it does not conflict. If a different agent's changes make the intended direction unclear, do not merge by guessing. Report the conflict, identify the affected entry points, and ask the user to choose.

A local server can be stale or can run from another process. Verify the active port, the rendered page, and the on-disk route entry before claiming that source code caused a visible UI. Do not kill another server or overwrite its corresponding source unless the user explicitly requests it.

## Completion protocol

- Complete the evidence record with sources, assumptions, affected files, exact command outcomes, browser/device checks, risks, and next action.
- Remove imports, styles, and types made obsolete by the change.
- Run `npx tsc --noEmit` and `npm run build`.
- For UI work, inspect the result in a browser at narrow and wide widths and test keyboard navigation.
- Report changed behavior, verification results, assumptions, and remaining risks.
