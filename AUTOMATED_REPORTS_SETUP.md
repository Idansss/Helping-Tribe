# Automated Reports Setup (Admins & Mentors)

This project includes a **weekly report API endpoint** that aggregates the
most important platform metrics. You can connect this to a cron job (Vercel
Cron, GitHub Actions, or any scheduler) to generate email reports.

---

## 1. API Endpoint

The route is:

```text
GET /api/admin/weekly-report
```

It returns JSON shaped like:

```json
{
  "generated_at": "2026-01-27T10:30:00.000Z",
  "totalStudents": 120,
  "activeStudents": 85,
  "averageProgress": 67,
  "completionRate": 42,
  "averageQuizScore": 78
}
```

These numbers mirror the logic in the `AnalyticsPage`:

- `totalStudents`: count of `profiles` with `role = 'student'`
- `activeStudents`: distinct students who logged in during the last 7 days
  using `user_activity`
- `averageProgress`: average `completion_percentage` in `module_progress`
- `completionRate`: percentage of module_progress rows with
  `completion_percentage = 100`
- `averageQuizScore`: mean of non-null `quiz_score` in `module_progress`

> Note: The endpoint runs on the server using `lib/supabase/server.ts` so it
> always has access to the latest database state.

---

## 2. Hooking This into a Cron (Example: Vercel)

If you deploy on Vercel, you can use
`vercel.json` or the Vercel UI to define a cron job:

```json
{
  "crons": [
    {
      "path": "/api/admin/weekly-report",
      "schedule": "0 7 * * 1"
    }
  ]
}
```

This calls the endpoint **every Monday at 07:00 UTC**.

You can then:

- Pipe the JSON into an email-sending service (SendGrid, Postmark, etc.)
- Store snapshots into a separate `weekly_reports` table in Supabase
- Forward the payload to a Slack/Teams webhook

---

## 3. Optional: Persist Weekly Snapshots

If you want to keep a history of generated reports, you can add a simple
table in Supabase (run this in the SQL Editor):

```sql
CREATE TABLE IF NOT EXISTS public.weekly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL
);
```

Then update the API route to `INSERT` the JSON payload into this table
each time it runs before returning the response.

---

## 4. Emailing the Report (High-Level)

Because this project is framework-agnostic about your email provider, the
recommended pattern is:

1. Use a serverless function or external worker that:
   - Calls `/api/admin/weekly-report`
   - Formats the JSON into a human-readable email
   - Sends via your preferred provider (SendGrid, Postmark, SES, etc.)
2. Schedule that worker with:
   - Vercel Cron
   - GitHub Actions
   - A hosted cron service (e.g. cron-job.org)

This keeps the **LMS codebase clean** while still giving you a ready-made
data source for weekly analytics.

---

With this endpoint and guide in place, the **“Automated Reports”** feature is
fully wired from the LMS side — you only need to connect your preferred
scheduler and email provider. 

