# Learner sidebar routing (one-click to main view)

Sidebar links go **directly** to the main functional view. No intermediate landing page.

| Sidebar item       | Route (direct link)   | Main view / Notes |
|--------------------|-----------------------|-------------------|
| **Home**           | `/dashboard`          | Dashboard overview (welcome + quick links). |
| **My Course**      | `/course/module/1`    | First module content. `/course` redirects here (Option B). Final Exam via **Modules \| Final Exam** tabs on course pages. |
| **Learning Journal** | `/journal`          | Journal page with module selector + prompts (first module auto-selected when data exists). |
| **Practice Client**  | `/practice-client`  | AI client chat (main practice view). |
| **Peer Circles**     | `/peer-circles`     | List of circles (main view). Detail: `/peer-circles/[circleId]`. |
| **Case Studies**     | `/case-studies`     | Case study bank (main view). Detail: `/case-studies/[caseId]`. |
| **Resources**        | `/resources`        | Resource directory (main view). |
| **My Backpack**      | `/backpack`         | Saved bookmarks (main view). |
| **Calendar**        | `/calendar`         | Weekly calendar (main view). |

## Implementation

- **Option A:** Sidebar `href` values point to the routes above (e.g. My Course → `/course/module/1`).
- **Option B:** Parent route `/course` redirects to `/course/module/1` in `app/course/page.tsx`.
- **Sub-features:** Final Exam is reached via the **Modules \| Final Exam** tabs shown on any course route (`/course/*`). Other sections (e.g. journal history, circle detail) are reached from the main page (tabs, list rows, or internal links).

## Files

- Sidebar nav: `components/lms/LearnerLayout.tsx` (and matching `CourseLayout.tsx`).
- Course redirect: `app/course/page.tsx`.
- Dashboard card “My Course” link: `app/dashboard/page.tsx` → `/course/module/1`.
