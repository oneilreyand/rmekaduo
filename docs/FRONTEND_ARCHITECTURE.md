# Frontend Architecture

## Scope

The frontend is a single Next.js route. It exposes the RME module shell, contextual module sidebars, and the UI System catalogue through template-owned internal state; it has no URL-driven internal navigation. Clinical modules remain presentation shells until connected to authenticated contracts.

## Composition model

| Layer | Responsibility | May import |
| --- | --- | --- |
| Atoms | Reusable primitive controls and typography | Types, icons, utilities only |
| Molecules | One focused interaction built from atoms | Atoms |
| Organisms | Reusable screen region | Atoms and molecules |
| Templates | Screen arrangement and page state | Atoms, molecules, organisms |
| App | Next.js route entry and metadata | Templates |

Dependencies only flow downward in this table. A lower layer must never import a higher layer.

## UI System

The header provides Kaduo branding, global search affordance, utility controls, and module navigation. Contextual sidebars are available per active module under ADR 0001. The UI System catalogue remains available as an internal component reference. No URL-driven application routing is introduced.

The UI System catalogue is a production consumer of the shared components. A preview never reimplements a button, badge, or input with duplicate markup.

## Evidence and decisions

Before implementation, agents must identify the relevant requirement in the repository and use official documentation for framework behavior. If a decision is neither specified nor evidenced, record the assumption in the task report and request clarification for behavior that affects users, clinical safety, data, routes, or dependencies. Durable architectural decisions belong in `docs/adr/`.

Every substantive work item must have an evidence record under `docs/evidence/` as defined by `docs/GOVERNANCE.md`.

## Verification

For every UI change, run TypeScript and the production build. Check keyboard focus, accessible labels for icon-only controls, and responsive behavior. Components that gain domain behavior require behavior-focused tests before they become clinical workflow components.
