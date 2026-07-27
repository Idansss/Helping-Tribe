# Responsive Audit

## Viewports and method

Public home was inspected in the running application at 375×667, 390×844, 768×1024 and 1440×900. The implementation target additionally covers 320 px minimum width, 200% text zoom, landscape phones, reduced motion and safe-area insets.

| Surface | Baseline issue | Resolution | Verification |
|---|---|---|---|
| Public footer | 768 px page overflow; email ended at x=803 on a 753 px client | `overflow-wrap:anywhere`, constrained flex children and simpler footer grid | No page overflow at all four captured widths |
| Public hero | Generic copy and dense small-screen composition | Responsive editorial copy and CSS orbit artwork | Captured at four widths |
| Curriculum | Number/title row vulnerable to clipping | Stacked mobile row; horizontal layout only from `sm` | Code + lint/typecheck |
| Application choices | Labels could squeeze or overflow | `min-w-0`, wrapping labels and responsive option cards | Code inspection |
| Learner navigation | Desktop sidebar absent on phones | Fixed bottom navigation with safe area and accessible More sheet | Code inspection; authenticated visual pass requires seeded account |
| Nine-week tracker | Nine cramped columns on mobile | Three columns on mobile, nine on desktop, 44 px targets | Code inspection |
| Dialogs | Fixed width could exceed short/narrow screens | Viewport width cap, max height and internal scrolling | Shared primitive updated |

## Responsive rules

- Page gutters use `clamp()` tokens rather than page-specific pixel padding.
- Grid cards collapse to one column before content becomes unreadable.
- Text containers and flex children use `min-width: 0`; user content can wrap anywhere where necessary.
- Persistent mobile navigation reserves bottom content space and honours `env(safe-area-inset-bottom)`.
- No information depends on hover; all interactive targets have visible keyboard focus.

## Remaining environment-dependent checks

Authenticated tables, populated course media and payment-provider return screens require representative Supabase data and provider test credentials. Their shared shells and responsive primitives are covered, but data-dependent visual acceptance should be repeated in staging.
