# Test Matrix

Final run date: 26 July 2026.

| Layer | Command / method | Result |
|---|---|---|
| Lint | `npm run lint` | Pass |
| Type safety | `npm run typecheck` | Pass |
| Unit/contract | `npm test` | 15 files, 41 tests pass |
| Browser E2E | `npm run test:e2e` | 15 pass; 1 intentional desktop skip |
| Production build | `npm run build` | Pass; Next.js 16.2.12; 64 static pages generated |
| Production home smoke | HTTP request to `/` | 200 and expected headline present |
| Responsive | 320, 390, 768, 1440 | No public home/application page overflow |
| Theme | light/dark toggle + reload | Pass at all E2E projects |
| Mobile navigation | open, dialog visibility, Escape, focus return | Pass at 320, 390 and 768 |
| Public content | FAQ, CTA destinations, no unresolved fee/faculty value | Pass via E2E and unit tests |
| Lighthouse | local production mobile simulation | 68 performance; 100 accessibility; 100 best practices; 100 SEO |

## Workflow protection evidence

Existing tests continue to cover admin access, application resume, API contracts, course access, learner onboarding, Paystack verification, rate limiting, payment status and weekly unlock behaviour. UI changes did not modify database schema, payment request construction, application submission or role-gate logic.

## Staging acceptance still required

- Complete application submission and resume-email delivery with provider test credentials.
- Approved applicant payment initialisation, webhook and return flow in Paystack test mode.
- Learner course completion, locked/unlocked module data and quiz submission with representative records.
- Mentor grading and admin data-table workflows with seeded role accounts.
- Screen-reader passes in NVDA/VoiceOver and 200% zoom on representative authenticated pages.

These checks need credentials and production-like records that are not available in the local workspace; they are release gates, not simulated passes.
