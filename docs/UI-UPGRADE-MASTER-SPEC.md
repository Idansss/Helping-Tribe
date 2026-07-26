# Helping Tribe Academy UI Upgrade — Master Specification

## Product intent

Helping Tribe Academy is a clinical-academic learning environment for counsellors and facilitators. The upgrade should feel calm, humane, rigorous and safe: editorial typography, restrained teal accents, deep-ink contrast, generous spacing and motion that explains state rather than decorates it.

## Non-negotiables

- Preserve Supabase authentication, role redirects, application persistence, payment initiation, course progress and administration behaviour.
- Treat the public site, application, learner portal, mentor portal and admin portal as one product family.
- Meet WCAG 2.2 AA for colour, focus, keyboard access, labelling, reflow and reduced motion.
- Support 320 px through large desktop without page-level horizontal scrolling.
- Keep public content honest. Unresolved dates, fees and staff credentials must remain marked for client confirmation.
- Use British/Nigerian English in new interface copy while keeping database and API identifiers stable.

## Experience principles

1. **Clarity before density.** One dominant action and a readable information hierarchy per view.
2. **Progress is visible.** Learners should always know where they are, what is complete and what comes next.
3. **Care without softness.** Warm language and generous rhythm, supported by academically credible structure.
4. **Safe defaults.** Stable public navigation, explicit errors, reversible actions and no invented claims.
5. **Mobile is a primary surface.** Bottom navigation, stacked course rows, safe-area padding and touch targets of at least 44 px.

## Visual direction

- Display type: Newsreader; interface type: DM Sans.
- Primary light canvas: warm parchment; primary dark canvas: deep ink.
- Brand accent: teal, with amber reserved for warnings and progress cues.
- Corners: 12–24 px by component scale; shadows are quiet and layered.
- Hero motif: the “Orbit of Care”, an original CSS/SVG composition of connected care nodes.

## Scope and acceptance

The scoped implementation covers shared tokens and controls; public home and application surfaces; role navigation shells; learner dashboard hierarchy; mobile navigation; dark-mode compatibility; FAQ discoverability; content verification; and audit/operational documentation. Acceptance evidence is recorded in `TEST-MATRIX.md` and the before/after screenshot folders.
