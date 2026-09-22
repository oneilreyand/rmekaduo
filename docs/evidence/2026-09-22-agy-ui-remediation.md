# Feature Evidence Record — Agy UI remediation

- **Date:** 2026-09-22
- **Owner / agent:** Codex
- **Status:** Validated with a narrow viewport follow-up remaining
- **Scope:** Bring the newly added patient-journey demo surfaces back into the approved Kaduo UI system and remove unsupported integration/compliance cues.

## Sources and decisions

- **User requirement:** Update all recent changes to comply with this application's UI requirements.
- **Governing documents:** `AGENTS.md`, `docs/GOVERNANCE.md`, `docs/UI_UX_DESIGN_SYSTEM.md`, and `docs/adr/0001-contextual-rme-navigation.md`.
- **Decision:** These screens remain a local, clearly labelled demonstration. They must not claim an external BPJS/SATUSEHAT result, TTE certification, medical-record locking, or completed clinical transfer. The implementation uses Kaduo semantic tokens only; gradients and non-functional decorative icons are removed.
- **Synthetic-data declaration:** Demo rows use non-identifying labels and non-production identifiers only. No NIK, medical-record number, BPJS number, IHS number, or patient contact value is stored in fixtures.

## Acceptance criteria

| Criterion | Observable result required |
| --- | --- |
| Token consistency | No `sky`, `slate`, `indigo`, `cyan`, or product gradient utility remains in rendered Agy patient-journey components. |
| Calm clinical UI | Page surfaces, fields, selection, buttons, statuses, and dark mode read from Kaduo semantic tokens. |
| Honest demo language | Every local-only action names its simulated/local scope and does not report an external clinical or integration outcome. |
| Privacy | Fixture data contains no NIK, MRN, BPJS, IHS, phone, or realistic patient identity. |
| Atomic direction | Molecules do not import organisms or templates. |
| Validation | Type check, production build, whitespace check, and wide/narrow browser checks are recorded after the source change. |

## Initial audit findings

- The local browser currently fails with a missing Next.js server chunk; no successful visual result can be claimed until the generated build cache is refreshed.
- Existing patient-journey controls use local React state only. They must be labelled as a demo flow and must not imitate verified clinical/integration completion.

## Change record

- Replaced the role/persona dropdown with the existing explicit module navigation, so a UI control no longer implies authentication or clinical authority.
- Rebuilt admission, queue display, triage, and pharmacy/cashier as flat Kaduo-token workspaces. The shared queue badge, search molecule, patient banner, and action dock use the same token set.
- Removed product gradients and legacy blue/slate/indigo utility colour pairs from the rendered patient-journey files.
- Replaced integration, TTE, locking, and certification success language with explicit local-demo language. Local state transitions remain visual prototypes only.
- Replaced realistic fixture identifiers and names with non-identifying `DEMO` values and generic patient labels. Search data is now supplied by the organism instead of being duplicated inside a molecule.
- Added semantic workspace, field, label, selection, and demo-note classes to `src/app/globals.css` for consistent light and dark surfaces.
- Normalized the active menu layout contract: Admission, TV Antrean, Triase, Konsultasi, Farmasi & Kasir, Katalog, and Pengaturan now all use `ui-workspace` and `ui-workspace-inner` (one canvas padding scale and a 1280 px maximum content width).

## Validation evidence

| Check | Exact result | Notes |
| --- | --- | --- |
| Type check | `npx tsc --noEmit` passed | 0 TypeScript errors. |
| Production build | `npm run build` passed | Next.js 15.5.25; `/` generated at 23.9 kB (126 kB first load). |
| Diff hygiene | `git diff --check` passed | No whitespace errors. |
| Token/privacy scan | Scoped search found no direct blue/slate/indigo/cyan/gradient product utilities, realistic 12+ digit identifiers, or remaining `RoleSwitcher` import in the remediated patient-journey sources | Safety status tokens remain intentionally named and labelled. |
| Browser, light mode | Fresh local browser at `http://localhost:3002/` loaded successfully (`GET / 200`) | Admission workspace, accessible labelled fields, theme switch, navigation, demo notice, and queue preview were visible. |
| Browser, dark mode | Source tokens reviewed; the theme switch exposes `role="switch"` and `aria-checked` | A controlled narrow-width/dark screenshot could not be captured from the connected browser session; it remains a visual follow-up, not a passed check. |
| Layout consistency | Source inspection confirms all seven active menu roots use `ui-workspace`; each content container uses `ui-workspace-inner` | Shared responsive padding is 16 px on mobile, 24 px on small screens, and 32 px on desktop. |
| Final production build | `npm run build` passed after the layout normalization | Next.js 15.5.25; `/` generated at 23.7 kB (126 kB first load). |

## Remaining limitation

The patient journey is still an in-memory UI prototype. It is intentionally not a substitute for backend authorization, audit trails, record locking/addendum, BPJS, SATUSEHAT, KFA, or TTE integration.
