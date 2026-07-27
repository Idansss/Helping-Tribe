# UI Upgrade Progress

Last updated: 27 July 2026.

| Workstream | Status | Evidence |
|---|---|---|
| Baseline and regression checks | Complete | Existing branch retained; lint, typecheck, unit tests and production build passed before the corrective pass |
| Dark-mode repair | Complete | Semantic surface/state tokens plus a portal-scoped compatibility layer replace the pale-on-white legacy combinations |
| Shared portal shell | Complete | Admin, facilitator and learner layouts now use `PortalShell`, `PortalHeader`, `PortalSidebar` and one role configuration |
| Desktop navigation | Complete | Expanded 256 px sidebar and persistent 72 px icon rail using `ht-portal-sidebar-collapsed` |
| Mobile/tablet navigation | Complete | Radix dialog drawer with overlay, focus management, Escape close and route-change close below 1024 px |
| Contextual header | Complete | Route-specific title, description, search, theme, notifications and profile controls are shared across roles |
| State presentation | Complete | Empty, table hover, notification, toast and activity-gate states use semantic light/dark surfaces |
| Runtime error diagnosis | Fixed in client; migration ready | `get_activity_gate_status` failed with PostgreSQL `42P01` because `module_progress` was missing; the old RPC also queried `mp.completed` rather than `is_completed` |
| Motion restraint | Complete | Tokenised navigation/panel/page feedback, reduced-motion fallback, no new continuous canvas effect |
| Live responsive verification | Complete for available learner session | 10 viewport sizes from 320×568 to 1920×1080, zero horizontal overflow; collapse, reload, drawer and theme verified |
| Authenticated role acceptance | Partial | Learner account was available; admin/facilitator URLs correctly redirected under that role, so seeded accounts remain a staging gate |
| Final automated verification | Complete | Lint/typecheck/build pass; 44 tests and 15 browser checks pass |

## Root causes corrected

1. Legacy portal pages mixed dark-aware text classes with fixed `bg-white` and pale slate surfaces. Global text compatibility therefore produced low-contrast pale cards in dark mode.
2. Admin, facilitator and learner maintained independent headers and sidebars. Admin/facilitator collapse used width zero, route titles were stale, and JavaScript breakpoints disagreed with CSS.
3. `useActivityGate` failed open but logged the RPC object with `console.error`. Next.js converted that recoverable service failure into the visible development error overlay.
4. The database repair migration was missing, and migration 038 expected both a table that was absent remotely and a progress column name that did not match the baseline schema.

## Source decisions

- Transitions.dev informed the shared duration/easing scale, panel reveal and reduced-motion rules.
- React Bits was reviewed for tasteful interaction patterns. The free catalogue was available, but the repository had no licensed Pro registry or key; no Pro source was copied.
- Canvas UI was reviewed and rejected for this pass. The product already has one restrained public hero visual, and another WebGL/canvas effect would add cost without improving portal task clarity.
- David Haz/React Bits references informed restraint and composition only; no source was copied.

## Remaining release gates

- Deploy `supabase/migrations/044_repair_activity_gate_progress_schema.sql` to the target Supabase project. Until then, the client fails open and reports a calm service warning where the gate is mounted.
- Repeat visual acceptance with seeded admin and facilitator accounts and representative data.
- Run NVDA/VoiceOver and 200% zoom checks on representative authenticated pages.
- Complete provider-backed application email and payment flows with test credentials.

Pre-existing quiz page/schema work remains preserved and outside this corrective pass.
