# Feature Evidence Record — Kaduo UI System Consistency

- **Date:** 2026-09-22
- **Owner / agent:** Codex
- **Status:** Validated
- **Scope:** Consolidate the UI System catalogue to the approved Kaduo visual language and make light/dark treatment consistent for shared controls, data visualisations, and preview states.

## Sources and decisions

- **User requirement:** Clean the design catalogue, remove inconsistent AI-generated presentation, and ensure colour consistency in light/dark mode for controls including toggle, checkbox, and graphs.
- **Governing documents:** `AGENTS.md`, `docs/GOVERNANCE.md`, `docs/FRONTEND_ARCHITECTURE.md`, `docs/UI_UX_DESIGN_SYSTEM.md`.
- **ADRs:** `docs/adr/0001-contextual-rme-navigation.md`; no routing or ownership decision changes are planned.
- **Assumptions and why they are safe/reversible:** Kaduo’s previously agreed white, navy, orange, peach, and black-dark palette is authoritative for this visual cleanup. Safety red, amber, and green remain reserved for explicitly labelled clinical status only.
- **Unresolved decisions / required approval:** Header clinic identity will not be changed in this work; it is reported separately as a remaining naming decision.

## Acceptance criteria

| Criterion | Evidence/result | Status |
| --- | --- | --- |
| One Kaduo token set drives light and dark surfaces | CSS variables define white/navy/orange/peach light and black/white/orange dark surfaces | Complete |
| Buttons, inputs, checkbox, toggle, progress, spinner, and keyboard hints have visible state contrast | Shared atoms/molecules now consume semantic variables; browser exposed labels and state values | Complete |
| Graphs use Kaduo primary colour with labelled safety/semantic series | Sparkline defaults to `--chart-primary`; organism graph uses Kaduo chart variables and labels | Complete |
| Catalogue contains no QlickHub QA, OAuth, Stripe, or task-management examples | Catalogue previews now show only non-patient RME UI examples | Complete |
| Catalogue copy is consistently Indonesian | Catalogue labels and descriptions were rewritten in Bahasa Indonesia | Complete |

## Change record

- **Files changed:** `src/app/globals.css`; shared atoms/molecules; `ui-system-catalogue`; `reference-organisms`; header, settings, and template shell; `docs/UI_UX_DESIGN_SYSTEM.md`.
- **Data/API/authorization impact:** None; this is presentation-only.
- **Synthetic data declaration:** Any catalogue values are non-patient UI examples and do not represent clinical records.
- **Migration or recovery impact:** CSS and components remain reversible through Git history.

## Validation evidence

| Check | Exact command/environment | Result | Notes |
| --- | --- | --- | --- |
| Type check | `npx tsc --noEmit` | Passed | 0 errors. |
| Production build | `npm run build` | Passed | Next.js 15.5.25 compiled and generated static routes successfully. |
| Tests | `NOT AVAILABLE` | No test runner configured | No Jest, Vitest, or Playwright script is configured in `package.json`. |
| Browser/accessibility | Chrome, `http://localhost:3002/` | Passed at desktop viewport | Katalog visible; light/dark toggle changed accessible value and label; checkbox, switch, tab, slider, progressbar, inputs, and disabled button exposed semantic accessible states. Controlled narrow viewport check is not available in the connected browser session. |
| Source consistency | `rg -n "sky-|#0077b6|#0ea5e9|#006bbb|#30a0e0" src/components/atoms src/components/molecules src/components/organisms src/components/templates --glob '!components/qlik/**'` | Passed | No conflicting blue product token remains outside archived Qlik source. |
| Whitespace | `git diff --check` | Passed | No whitespace errors. |

## Risks, gaps, and follow-up

- **Known risk:** The workspace still has prior uncommitted clinical UI additions. This work aligns their shared presentation tokens but does not validate clinical workflow rules or integration behavior.
- **Skipped validation and impact:** Controlled mobile-width browser check is unavailable in this browser connection; the responsive header implementation remains in source and requires a future device-width check.
- **Next action:** Obtain explicit review of the refreshed visual direction before committing the combined uncommitted work.

## Final report

- **Delivered behavior:** The catalogue is a Kaduo UI reference with consistent Indonesian copy, semantic light/dark tokens, RME-relevant non-patient examples, and shared components for every displayed control.
- **Evidence location/links:** `docs/UI_UX_DESIGN_SYSTEM.md`; this record.
- **Handoff notes:** The active page entry is `src/components/templates/single-page-shell.tsx`. The theme class remains `rme-dark` on the document root.
