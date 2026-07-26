# Performance Baseline

Captured 26 July 2026 before modernisation changes.

## Environment

- Node.js 22.18.0
- npm 11.6.1
- Next.js 16.1.6 / React 19.2
- Local Windows development environment

## Reproducible checks

| Check | Baseline result |
|---|---|
| `npm ci` | Pass; 363 packages added, 364 audited |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm test` | Pass; 12 files, 34 tests |
| `npm run build` | Pass; compile reported approximately 49 seconds; 64 static pages generated |
| Dependency audit | 15 advisories: 1 low, 4 moderate, 8 high, 2 critical; 9 affected production dependencies in the later production-only audit |
| `npm outdated` | Updates available, including major-version upgrades |

No automated Lighthouse runner was configured in the repository. Browser visual/overflow checks therefore supplement the build baseline; final performance evidence is recorded separately. Dependency advisories are not auto-fixed because major upgrades could change authentication, payments or build behaviour.

## Baseline risks

- Native `<img>` usage remains in some authenticated avatar/content surfaces where remote-host configuration is data dependent.
- Repeated hard-coded colours increase CSS/theme maintenance cost.
- Several client-heavy feature components fetch after mount; query caching and server-component migration require a separate data architecture change.
- The public navigation previously performed authentication work despite presenting anonymous destinations; the upgraded public shell removes that request from its core hero/nav path.
