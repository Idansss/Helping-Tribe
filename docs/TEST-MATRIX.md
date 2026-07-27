# Test Matrix

Final run date: 27 July 2026.

| Layer | Command / method | Result |
|---|---|---|
| Baseline lint | `npm run lint` | Pass |
| Baseline type safety | `npm run typecheck` | Pass |
| Baseline unit/contract | `npm test` | 15 files, 41 tests pass |
| Baseline production build | `npm run build` | Pass; Next.js 16.2.12; 64 route outputs |
| Corrective lint | `npm run lint` | Pass after shared-shell implementation |
| Corrective type safety | `npm run typecheck` | Pass after shared-shell implementation |
| Final unit/contract | `npm test` | 16 files, 44 tests pass |
| Final browser E2E | `npm run test:e2e` | 15 pass; 1 intentional desktop mobile-menu skip |
| Final production build | `npm run build` | Pass; Next.js 16.2.12; 64 static pages generated |
| Live learner routes | Dashboard, Skills, Backpack, Calendar, Messages | Context header/route presentation checked; Backpack produced no dev overlay or application console error |
| Desktop collapse | Live authenticated browser | 256 px → 72 px; persisted after reload; zero overflow |
| Mobile drawer | 390×844 | Dialog present, accessible close, Escape closes, zero overflow |
| Theme | Live light/dark toggle | Class, semantic background/foreground and accessible name update correctly |

## Responsive viewport matrix

Live authenticated learner dashboard measurements:

| Viewport | Shell mode | Horizontal overflow |
|---|---|---:|
| 320×568 | Drawer | 0 px |
| 360×800 | Drawer | 0 px |
| 390×844 | Drawer | 0 px |
| 412×915 | Drawer | 0 px |
| 768×1024 | Drawer | 0 px |
| 820×1180 | Drawer | 0 px |
| 1024×768 | Desktop rail/sidebar | 0 px |
| 1280×720 | Desktop rail/sidebar | 0 px |
| 1440×900 | Desktop rail/sidebar | 0 px |
| 1920×1080 | Desktop rail/sidebar | 0 px |

The sticky header measured 73 px and the main content began at 73 px at every viewport when scrolled to the top.

## Runtime-error evidence

The anonymous read-only RPC probe returned HTTP 404 with PostgreSQL code `42P01`: `relation "module_progress" does not exist`. The prior SQL also selected `mp.completed`, while the baseline schema uses `is_completed`. The client no longer writes this recoverable service condition to `console.error`; the local repair migration is `044_repair_activity_gate_progress_schema.sql`.

## Staging acceptance still required

- Authenticated admin and facilitator visual matrices with seeded accounts and representative records.
- Application submission/resume email with provider test credentials.
- Paystack initialisation, webhook and return flow in test mode.
- Learner completion, locked/unlocked modules, quiz submission and facilitator grading with seeded data.
- Screen-reader checks and 200% zoom on representative authenticated pages.
