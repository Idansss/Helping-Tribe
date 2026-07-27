# Implementation Plan

## Delivery sequence

1. **Baseline and inventory** — preserve user work, branch, install, lint, typecheck, test, build, route scan and before screenshots.
2. **Content safety** — centralise brand/programme facts; remove unverified fees, dates, urgency and faculty claims.
3. **Foundations** — semantic colour tokens, type system, theme provider, focus/reflow/reduced-motion rules and shared controls.
4. **Public and application** — editorial public home, Orbit of Care, stable navigation, mounted FAQ and responsive application presentation while preserving workflow logic.
5. **Role shells** — grouped learner/admin/mentor navigation, mobile bottom navigation, theme controls and learner dashboard hierarchy.
6. **Verification** — lint, typecheck, tests, production build, responsive/light/dark screenshots, overflow checks and repository-diff review.
7. **Handoff** — change log, content decisions, test matrix, deployment/rollback notes and explicit environment-dependent follow-ups.

## Guardrails

- No deployment.
- No blind dependency upgrades or audit fix.
- No schema, payment or authentication behaviour changes as part of the UI branch.
- Pre-existing quiz schema/UI edits remain user-owned and outside commits for this upgrade.
- Codacy analysis is required by repository guidance but no Codacy MCP capability is available in this environment; native checks and the limitation are recorded instead.
