# Motion System

Motion communicates hierarchy and state; it must not compete with counselling or learning content.

| Token / pattern | Duration | Use |
|---|---:|---|
| `--motion-control` | 150 ms | Colour, border, focus and icon feedback |
| `--motion-panel` | 220 ms | Drawer, dropdown, tooltip and toast entrance/exit |
| `--motion-page` | 260 ms | One subtle content opacity reveal after navigation |
| Sidebar width | 220 ms | 256 px expanded to 72 px rail; suppressed until the saved preference hydrates |
| Orbit of Care | 7 s loop | Existing decorative public hero visual only |

Rules:

- Prefer `transform`, `opacity` and colour. Sidebar width is the deliberate shell exception.
- Do not delay content availability or animate the largest-contentful element.
- State must remain legible without animation; no information is conveyed by motion alone.
- `prefers-reduced-motion: reduce` disables repeated animation and smooth scrolling and collapses transition durations to 1 ms.
- No new canvas/WebGL effect was added. Canvas UI was rejected for the portal because it did not improve task completion and would duplicate the public hero's visual role.
- React Bits Pro and Transitions Pro were not available in the repository, so no licensed component or recipe was used.
