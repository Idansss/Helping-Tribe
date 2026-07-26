# Accessibility Audit

Target: WCAG 2.2 AA. Audit combines component inspection, keyboard semantics and responsive browser checks.

| Criterion area | Finding | Change / status |
|---|---|---|
| Bypass blocks | Skip link existed but styling was inconsistent | Tokenised, high-contrast focus treatment retained |
| Keyboard navigation | Custom mobile navigation risked unmanaged focus | Radix Dialog used for focus trap, Escape and close restoration |
| Focus visible | Mixed page-specific rings | Global `:focus-visible` ring plus component rings |
| Target size | Some compact progress controls | Buttons/inputs and week tracker target at least 44 px |
| Reflow | Tablet footer overflow and dense curriculum rows | Fixed; four viewport captures show no public page overflow |
| Text spacing | Fixed-width children and nowrap buttons could fail | Buttons wrap; flex/grid children constrained |
| Colour and themes | Hard-coded purple/light-only palette | Semantic light/dark tokens; status icons retain text labels |
| Motion | Continuous decorative motion | Reduced-motion media query disables it |
| Forms | Application behaviour and labels must remain stable | Existing labels/validation preserved; review values wrap |
| Errors | Recovery actions present but styling light-only | Shared semantic primitives now adapt to themes; full auth-data testing pending |

## Manual keyboard script

1. Tab from the browser chrome to the skip link and activate it.
2. Continue through primary navigation in logical visual order.
3. Open the mobile menu; confirm focus enters the dialog, cycles within it, Escape closes it and focus returns to the trigger.
4. Toggle colour theme and confirm the accessible name changes.
5. At 200% zoom, confirm no page-level horizontal scroll and no obscured focused control.
6. With reduced motion enabled, confirm the Orbit of Care is static.

Authenticated course players, quizzes and admin data grids need a staging audit with representative records and assistive technology before release.
