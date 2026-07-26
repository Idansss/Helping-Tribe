# Deployment and Rollback

No deployment was performed.

## Pre-deployment gate

1. Confirm fee, cohort dates, faculty profiles and any accreditation language with the client.
2. Run `npm ci`, lint, typecheck, unit tests, E2E tests and build in CI.
3. Re-audit the three outstanding production dependency advisories against the latest compatible Next.js release.
4. Exercise application, email, Paystack and each role portal in staging using test credentials.
5. Back up the Supabase database and verify the target environment variables.
6. Review the pre-existing quiz migration separately; it is not owned by this UI branch.

## Deployment notes

- The project builds with `output: 'standalone'`. A container/self-hosted release should run `.next/standalone/server.js` and copy `public` plus `.next/static` into the standalone artefact. Managed Next.js platforms may use their native adapter.
- Keep `BASE_URL`, Supabase, Paystack, Resend and role/auth secrets environment-specific.
- Do not expose service-role or payment secret keys to client bundles.
- Run a post-deploy smoke of `/`, `/apply`, role logins and provider callbacks.

## Rollback

- Application rollback: redeploy the last known-good commit/artefact.
- Content rollback: restore the previous approved central configuration only; do not reintroduce unverified claims.
- Database rollback: none is required for this UI implementation. If the separate quiz migration is deployed, follow its own reviewed rollback plan.
- After rollback, verify auth redirects, application resume, payment initialisation and learner access before reopening traffic.
