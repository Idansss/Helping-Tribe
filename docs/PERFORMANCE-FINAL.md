# Performance Final

Final local production audit: 26 July 2026. Full Lighthouse JSON is stored in `docs/lighthouse-home.json`.

## Lighthouse mobile simulation

| Category / metric | Result |
|---|---|
| Performance | 68 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| First Contentful Paint | 1.25 s |
| Largest Contentful Paint | 5.00 s |
| Total Blocking Time | 527 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 1.46 s |

This is a local synthetic, throttled run and not field Core Web Vitals. CLS is within target; LCP and TBT remain optimisation priorities. The largest-contentful element is the hero heading and its delay is primarily render/main-thread time under emulation.

## Improvements delivered

- Removed an authentication request from the public navigation path.
- Moved grounding support to the authenticated learner shell and dynamically loads its Supabase client only when telemetry is needed.
- Replaced public native logo images with `next/image`.
- Reduced final production compile time from the approximately 49-second baseline to 21.7 seconds in the last same-machine run (build duration remains environment dependent).
- Kept the landing artwork in CSS/HTML rather than shipping a large hero image.

## Dependency position

Safe semver-compatible updates moved Next.js to 16.2.12, jsPDF to 4.2.1, PostCSS to 8.5.23 and Resend to 6.18.0. Production advisories reduced from 9 identified during final audit to 3 high advisories reported against the current Next.js dependency tree (`next`, bundled `postcss`, bundled `sharp`). npm’s suggested resolution is an invalid major downgrade, so no automated force-fix was applied. Track upstream releases and reassess before deployment.

## Next performance work

1. Collect real-user Core Web Vitals in staging/production.
2. Profile public hydration and split non-critical accordion/menu JavaScript further.
3. Repeat three Lighthouse runs in CI and use the median rather than a single local run.
