# Implementation Changelog

## Foundations

- Added semantic light/dark tokens, Newsreader/DM Sans typography, fluid gutters, focus treatment, reflow safety and reduced-motion behaviour.
- Added theme provider/toggle and compatibility styling for legacy data-heavy screens.
- Hardened shared buttons, cards, inputs and dialogs for touch, wrapping and viewport constraints.

## Public and application

- Rebuilt the home experience around calm editorial hierarchy and the original Orbit of Care composition.
- Mounted and rewrote FAQ content; fixed tablet footer overflow and mobile curriculum rows.
- Removed unverified public fee, urgency, scholarship and named-faculty claims.
- Centralised programme/content confidence in `lib/brand/site-config.ts`.
- Modernised application entry and form presentation while leaving save/resume/submission behaviour intact.

## Portals

- Added grouped learner, mentor and admin navigation shells.
- Added learner mobile bottom navigation with a searchable, focus-managed More sheet.
- Improved learner dashboard next-action hierarchy and the nine-week tracker’s mobile targets.
- Moved grounding support to the learner portal and split its data client from the public critical path.
- Added semantic loading and error-state compatibility.

## Quality and operations

- Added Playwright with 320/390/768/1440 browser projects and public/application smoke tests.
- Added content, navigation and Nigerian formatting unit tests.
- Added the complete audit/design/content/performance/test/deployment documentation set and before/after screenshots.
- Applied compatible security updates to Next.js, jsPDF, PostCSS and Resend; documented unresolved upstream advisories.

## Explicit exclusions

- No deployment, schema change, payment logic change or authentication flow rewrite.
- Pre-existing quiz module/migration changes remain user-owned and outside this change set.
- Authenticated, record-dependent visual acceptance remains a staging release gate.
