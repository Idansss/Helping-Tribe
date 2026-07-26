# Route and Feature Audit

Audit date: 26 July 2026. Source: App Router filesystem and production build output. Total rendered `page.tsx` routes: **117**.

## Coverage profiles

| Profile | Audience / access | Shared shell | Primary states | Responsive risk | Upgrade status |
|---|---|---|---|---|---|
| PUB | Anonymous | Landing nav/footer | default, menu, theme | hero copy, footer email | Upgraded |
| APP | Applicant / returning applicant | Public top nav | idle, validation, saving, submitting, success | long options and review values | Upgraded; workflow preserved |
| AUTH | Anonymous or invited user | Minimal auth shell | validation, recovery, redirect | form width, keyboard | Behaviour preserved; token compatibility applied |
| LRN | Authenticated learner | Learner header/sidebar/bottom nav | loading, empty, populated, error, locked | dense module rows, mobile navigation | Shell and dashboard upgraded; shared state coverage retained |
| MEN | Authenticated mentor | Mentor shell | loading, empty, populated, error | tables, grading controls | Shell upgraded; feature behaviour preserved |
| ADM | Authenticated administrator | Admin header/sidebar | loading, empty, populated, error | data tables, dialogs, filters | Shell upgraded; feature behaviour preserved |
| LEG | Compatibility alias | Existing legacy learner shell | route-specific | duplicate information architecture | Preserved; migration candidate |

Access gates were inspected in `app/learner/layout.tsx`, `app/mentor/layout.tsx` and `app/admin/layout.tsx`. Unauthenticated users still redirect to application/login entry points; non-matching roles still redirect to their authorised portal.

## Complete rendered route inventory

Each route below inherits the access, shell, state and responsive characteristics of its profile. Dynamic parameters are shown literally.

| Profile | Routes |
|---|---|
| PUB | `/`, `/landing`, `/contact`, `/privacy`, `/terms` |
| APP | `/apply`, `/apply/resume`, `/apply/success`, `/pay` |
| AUTH | `/login`, `/logout`, `/forgot-password`, `/reset-password`, `/set-password`, `/mentor-login`, `/staff/login`, `/student/login`, `/student/set-password` |
| LRN | `/learner/dashboard`, `/learner/assessments`, `/learner/assessments/[assessmentId]`, `/learner/backpack`, `/learner/calendar`, `/learner/cases`, `/learner/cases/[id]`, `/learner/catalog`, `/learner/certificate`, `/learner/circles`, `/learner/course/modules`, `/learner/course/module/[moduleId]`, `/learner/course/module/[moduleId]/quiz`, `/learner/cpd-snippets`, `/learner/discussions`, `/learner/discussions/[moduleId]`, `/learner/final-projects`, `/learner/final-projects/[projectId]`, `/learner/journal/entries`, `/learner/messages`, `/learner/practice/chat`, `/learner/quizzes`, `/learner/quizzes/[quizId]`, `/learner/quizzes/[quizId]/results`, `/learner/resources`, `/learner/settings`, `/learner/skills` |
| MEN | `/mentor`, `/mentor/calendar`, `/mentor/case-studies`, `/mentor/catalog`, `/mentor/conferences`, `/mentor/courses`, `/mentor/cpd-snippets`, `/mentor/discussions`, `/mentor/grading`, `/mentor/groups`, `/mentor/journals`, `/mentor/learning-paths`, `/mentor/messages`, `/mentor/practice`, `/mentor/quizzes`, `/mentor/reports`, `/mentor/resources`, `/mentor/settings`, `/mentor/skills`, `/mentor/students` |
| ADM | `/admin`, `/admin/applicants`, `/admin/automations`, `/admin/branches`, `/admin/calendar`, `/admin/case-studies`, `/admin/courses`, `/admin/course-store`, `/admin/cpd-snippets`, `/admin/discussions`, `/admin/discussions/[promptId]`, `/admin/groups`, `/admin/journals`, `/admin/learning-paths`, `/admin/messages`, `/admin/newsletter`, `/admin/notifications`, `/admin/outbox`, `/admin/profile`, `/admin/quizzes`, `/admin/quizzes/[quizId]/responses`, `/admin/reports`, `/admin/resources`, `/admin/settings`, `/admin/skills`, `/admin/subscription`, `/admin/users` |
| LEG | `/analytics`, `/assessments`, `/assessments/[assessmentId]`, `/assignments`, `/assignments/[assignmentId]`, `/case-studies`, `/case-studies/[id]`, `/catalog`, `/certificate`, `/course/module/[moduleId]`, `/course/module/[moduleId]/quiz`, `/dashboard`, `/discussions`, `/discussions/[moduleId]`, `/final-projects`, `/final-projects/[projectId]`, `/journal`, `/messages`, `/my-training`, `/peer-circles`, `/practice-client`, `/profile`, `/resources`, `/skills`, `/tools` |

## Feature and risk notes

- Public: the navigation linked to `#faq` but the FAQ was not mounted. It is now mounted and keyboard reachable.
- Curriculum: numbered rows could force narrow layouts. Rows now stack at mobile widths and constrain child text with `min-width: 0`.
- Application: save/resume, validation, submission and registration branches were left intact; only layout and terminology changed.
- Learner: desktop-only navigation was replaced with grouped desktop navigation and a four-item mobile bottom bar plus searchable “More” sheet.
- Mentor/admin: role gates and feature URLs are unchanged. Shared shells now use the same brand and theme controls.
- Legacy aliases: retain for backward compatibility. Consolidating or redirecting them requires analytics and product approval.
- User-owned database work in the quiz module was present before this upgrade and is excluded from the UI change set.
