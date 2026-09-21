# ADR 0001: Contextual navigation for RME modules

- **Status:** Accepted
- **Date:** 2026-09-21

## Context

The prior frontend architecture limited the application to a UI System catalogue with no sidebar or internal navigation. The explicit product direction now requires RME module navigation and a contextual submenu beside the active module, while retaining a single Next.js route.

## Decision

Keep one Next.js route (`/`) and use template-owned client state for internal menu selection. The header exposes RME modules derived from `docs/API_CONTRACT.md`: Pasien & Admisi, Kunjungan & CPPT/SOAP, Terminologi Klinis, and Bridging BPJS & SATUSEHAT. Each active module may render a contextual sidebar. The UI System remains an internal component reference.

## Evidence

- Explicit user direction to create RME menus and contextual side navigation.
- `docs/API_CONTRACT.md` sections 1–4 define the module boundaries.
- `docs/DEV_HUB.md` defines the patient journey across admisi, poli, and farmasi.

## Alternatives considered

1. Keep the UI System-only, no-sidebar layout. Rejected because it no longer matches explicit product direction.
2. Add URL routes immediately. Deferred because route behavior, guards, and data contracts need a separate approved decision.

## Consequences

- Internal navigation must not imply authorization or load clinical data without authenticated contracts.
- New modules must comply with `docs/GOVERNANCE.md` and carry their own evidence record.
- `docs/FRONTEND_ARCHITECTURE.md` is updated to remove the obsolete no-sidebar statement.
