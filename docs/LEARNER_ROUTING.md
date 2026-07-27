# Learner portal routing

Learner navigation is defined with the other role configurations in `components/portal/portal-config.ts` and rendered by the shared portal shell.

| Destination | Direct route |
|---|---|
| Dashboard | `/learner/dashboard` |
| My Course | `/learner/course/modules` |
| Quizzes | `/learner/quizzes` |
| Assessments | `/learner/assessments` |
| Skills | `/learner/skills` |
| Learning Journal | `/learner/journal/entries` |
| Practice Client | `/learner/practice/chat` |
| Peer Circles | `/learner/circles` |
| Discussions | `/learner/discussions` |
| Messages | `/learner/messages` |
| Resources | `/learner/resources` |
| Case Studies | `/learner/cases` |
| My Backpack | `/learner/backpack` |
| Final Projects | `/learner/final-projects` |
| Certificate | `/learner/certificate` |
| CPD Snippets | `/learner/cpd-snippets` |
| Calendar | `/learner/calendar` |
| Catalogue | `/learner/catalog` |
| Settings | `/learner/settings` |

Desktop uses the same links in a 256 px sidebar or 72 px icon rail. Mobile and tablet use a Radix dialog drawer; the existing learner bottom navigation retains the highest-frequency destinations.
