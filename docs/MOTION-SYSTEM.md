# Motion System

Motion communicates hierarchy and state; it must never compete with clinical or learning content.

| Pattern | Duration / behaviour | Use |
|---|---|---|
| Control feedback | 120–180 ms | colour, border and small press scale |
| Panel/dialog entrance | 180–240 ms | opacity plus short transform; focus moves immediately |
| Navigation shell | 200 ms | sidebar width/margin transitions |
| Orbit of Care | 7 s loop | slow decorative float on the public hero only |
| Skeleton | restrained pulse | loading state only |

Rules:

- Animate `transform` and `opacity` where possible; do not animate layout-heavy properties on content lists.
- Avoid entrance animation on the largest-contentful element.
- Do not delay content availability for animation.
- `prefers-reduced-motion: reduce` shortens transitions and disables repeated animation and smooth scrolling globally.
- Autoplay media must remain paused by default; no essential information may depend on motion.
