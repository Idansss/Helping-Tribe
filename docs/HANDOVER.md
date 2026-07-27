# HANDOVER

## Production cleanup completed

Cleanup was executed on Supabase project `hfrznvvpuyrzvypekqns` on **February 16, 2026** using:

```bash
CONFIRM=YES DRY_RUN=0 node scripts/reset-test-data.mjs
```

The script preserved staff/admin access and removed test user/application data.

## Preserved access accounts (email only)

These accounts were retained:

- `abufaatimah07@gmail.com`
- `blakmoh06@gmail.com`
- `abassibrahim591@gmail.com`
- `jesselingard990@gmail.com`

No passwords are stored in the repository.

## Reset script

File: `scripts/reset-test-data.mjs`

Safety guard:

- requires `CONFIRM=YES`

Recommended usage:

1. Dry run:

```bash
CONFIRM=YES DRY_RUN=1 node scripts/reset-test-data.mjs
```

2. Execute reset:

```bash
CONFIRM=YES DRY_RUN=0 node scripts/reset-test-data.mjs
```

Optional flags:

- `WIPE_REFERENCE_DATA=YES` to also clear seeded/reference content (modules/resources/etc.)
- `RESET_PRESERVE_STAFF=NO` to keep only explicit admin email(s)
- `RESET_ADMIN_EMAIL=admin@yourdomain.com` to ensure one known admin account exists
- `RESET_ADMIN_PASSWORD=...` required only when creating that admin account
- `RESET_KEEP_AUTH_EMAILS=email1,email2` for additional auth users to keep
- `RESET_CLEAR_STORAGE=NO` to skip bucket cleanup

## What the reset deletes

By default, the script clears test/user-generated records from tables like:

- `applicants`, `students`, `password_setup_tokens`, `payments`
- `application_drafts`, `email_outbox`
- `messages`, `notifications`
- learner activity/progress/response tables (`quiz_attempts`, `learning_journals`, etc.)
- `matric_sequences` (resets matric sequence state)
- non-preserved `profiles`
- non-preserved Supabase auth users
- storage objects in discovered buckets (via `emptyBucket`)

Schema/migrations are not deleted.

## New staff/admin setup steps

1. If you need a new admin account:

```bash
node scripts/create-admin.mjs --email admin@yourdomain.com --password "StrongPassword123!" --name "Platform Admin"
```

2. Add any additional staff through your admin flow (`/admin/users`) or Supabase Auth + `profiles` role.

## UI cleanup done

- Removed mock rows from `app/messages/page.tsx` and `app/discussions/page.tsx`
- Removed seeded demo grading items from `app/mentor/grading/page.tsx`
- Removed hardcoded sample login/profile emails in:
  - `app/student/login/student-login-form.tsx`
  - `app/admin/profile/page.tsx`
  - `app/mentor/settings/page.tsx`
- Updated remaining demo wording in admin/mentor UI to neutral production copy.
