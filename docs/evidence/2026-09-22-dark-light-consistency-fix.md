# Feature Evidence Record — Dark/light consistency repair

- **Date:** 2026-09-22
- **Owner / agent:** Codex
- **Status:** Validated
- **Scope:** Remove competing light/dark colour mechanisms from active Kaduo RME components and make surfaces, typography, controls, charts, and labelled safety states draw from one semantic token set.

## Evidence and diagnosis

- **Reported behavior:** Dark and light colour treatment is inconsistent.
- **Reproduction:** The local application at `http://localhost:3002/` renders with `rme-dark` applied at the document root. Source inspection shows the semantic CSS variables in `src/app/globals.css` coexisting with legacy Tailwind `dark:*`, `bg-white`, and `text-slate-*` classes in active consultation, patient banner, floating dock, status, and search components.
- **Ranked hypotheses:**
  1. Legacy `dark:*` utilities override or diverge from semantic Kaduo tokens.
  2. Static light classes leave individual controls or cards unchanged in dark mode.
  3. Safety-status colours lack a shared, contrast-checked pair for each mode.
  4. The component layer and utility layer are being mixed on the same visual properties.
- **Decision:** Use semantic variables for every non-status surface, text, border, field, control, and chart. Give success, warning, danger, and neutral statuses named token pairs rather than mode-specific Tailwind utility strings. Keep colour-only status meanings paired with text/icons.

## Acceptance criteria

| Criterion | Evidence required |
| --- | --- |
| One source governs normal UI colours in both modes | No legacy `dark:*`, `bg-white`, or `text-slate-*` theme classes remain in active RME components. |
| Controls remain legible | Browser inspection of input, toggle, checkbox, buttons, tab, slider, and loading state in light and dark mode. |
| Charts remain legible | Sparkline stroke/grid/point use named chart tokens in light and dark mode. |
| Safety statuses remain distinguishable | Each status uses semantic foreground/background/border tokens and an accompanying label/icon. |
| No build regressions | `npx tsc --noEmit`, `npm run build`, and `git diff --check` pass. |

## Change record

- **Data/API/authorization impact:** None. Presentation-only; all displayed clinical content remains synthetic demo data.
- **Recovery:** All changes are local, uncommitted, and reversible through Git.

## Validation evidence

| Check | Exact result | Notes |
| --- | --- | --- |
| Source consistency | `rg -n "dark:|bg-white|text-slate|bg-slate|border-slate"` across active app, atom, molecule, organism, and template sources returned no matches | Archived Qlik source and two unused legacy components were excluded; they do not render from the single-page shell. |
| Type check | `npx tsc --noEmit` passed | 0 TypeScript errors. |
| Production build | `npm run build` passed | Next.js 15.5.25; route `/` generated successfully (18.3 kB, 121 kB first load). |
| Diff hygiene | `git diff --check` passed | No whitespace errors. |
| Browser, light mode | Local browser at `http://localhost:3002/` rendered the consultation workspace with white canvas/surfaces, navy text, orange action controls, readable fields, visible chart lines, labels, status badges, slider, dock, and header | The browser was opened in a fresh tab after an old development asset became stale. |
| Browser, dark mode | Semantic token declaration verified in source and production compilation: black canvas, `#121212` surface, white text, orange action, and paired status tokens | The connected browser automation focused the theme control but did not dispatch its click event in the final fresh-tab run, so a current dark screenshot could not be captured by that automation session. The prior browser session did render dark mode; a human click remains the final visual confirmation. |

## Final result

- Removed the competing `dark:*` and static slate/white presentation classes from every component rendered by the active single-page RME shell.
- Added named success, warning, danger, and neutral status tokens for both themes; warnings/errors keep accompanying text and icons.
- Removed static body background/text utilities that could override the theme outside the page surface.
- Changed clinical sparklines to `--chart-primary` and `--chart-normal`, so the chart palette responds with the rest of the theme.

## Follow-up — toggle refinement

- **Reported behavior:** The current toggle presentation is not visually appropriate.
- **Decision:** The shared toggle will expose a larger bordered track, a clearly travelling thumb, keyboard focus, and a visible label. The header theme action will become a distinct sun/moon switch with an accessible text label rather than an ambiguous square icon button.
- **Acceptance criteria:** State remains exposed through `role="switch"` and `aria-checked`; disabled, hover, focus, light, and dark states remain visible; the shared atom is reused in the catalogue and settings.

### Follow-up validation

| Check | Exact result | Notes |
| --- | --- | --- |
| Browser semantics | Local browser at `http://localhost:3002/` exposes the header control as `switch`, `Description: Ganti ke mode gelap`, `Value: 0` | Replaces the prior ambiguous checkbox/icon-button treatment. |
| Browser visual | Fresh local tab renders the rounded theme track with an orange sun thumb, plus the unchanged labelled controls in the consultation workspace | Verified after cache clear and development-server restart. |
| Type check | `npx tsc --noEmit` passed | 0 errors. |
| Production build | `npm run build` passed | Next.js 15.5.25 compiled and generated static routes successfully. The build was run while the development server was stopped to avoid cache corruption. |
| Diff hygiene | `git diff --check` passed | No whitespace errors. |

## Follow-up — visual restraint

- **Reported behavior:** Decorative gradients and repeated icons make the application look synthetic rather than like a calm clinical workspace.
- **Decision:** Remove all non-semantic gradients. Retain icons only when they materially clarify an action (for example, remove/add), a notification, or a safety state. Titles, branded identity, default avatars, navigation labels, and already-labelled actions use typography instead.
- **Acceptance criteria:** No `gradient` utility remains in rendered application components; each remaining icon has a functional or safety purpose; the consultation workspace and catalogue preserve their actions and accessible names.

### Follow-up validation

| Check | Exact result | Notes |
| --- | --- | --- |
| Source restraint | `rg -n "gradient|shadow-pulse"` across active application source returned no matches | The unused legacy module workspace and archived Qlik source are excluded from the rendered single-page application. |
| Browser | Fresh local browser tab at `http://localhost:3002/` rendered the flat `K` monogram, patient initials, text-only card headings, no decorative gradients, and retained action/safety icons | Browser accessibility tree confirms labelled add/remove actions and safety alerts remain available. |
| Type check | `npx tsc --noEmit` passed | 0 errors. |
| Production build | `npm run build` passed | Next.js 15.5.25; `/` generated successfully (16.3 kB, 119 kB first load). |
| Diff hygiene | `git diff --check` passed | No whitespace errors. |
