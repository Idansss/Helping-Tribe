# Supabase Scripts

## Profiles table (“Could not find the table 'public.profiles'”)

If you see **Could not find the table 'public.profiles' in the schema cache**, use one of these approaches.

### Option A: Table does not exist (fresh project)

1. **Create the table**  
   In **Supabase Dashboard → SQL Editor**, run the contents of:
   ```
   supabase/scripts/create_profiles_table.sql
   ```
   That script creates `public.profiles`, enables RLS, adds policies, and sets up the trigger that creates a profile when a user signs up.

2. **Reload the schema cache**  
   **Settings (gear) → API → Reload schema cache**.

3. **Restart the app**  
   Stop the dev server (Ctrl+C) and run `npm run dev` again.

### Option B: Table already exists (e.g. from `001_initial_schema.sql`)

1. **Apply the alignment migration**  
   In **Supabase Dashboard → SQL Editor**, run:
   ```
   supabase/migrations/028_align_profiles_schema.sql
   ```
   That adds `email`, `phone_number`, `whatsapp_number` and the INSERT policy if needed.

2. **Reload the schema cache**  
   **Settings (gear) → API → Reload schema cache**.

3. **Restart the app**  
   Stop the dev server (Ctrl+C) and run `npm run dev` again.

### If “relation public.profiles already exists”

You already have a `profiles` table. Use **Option B** (run `028_align_profiles_schema.sql`) and then reload the schema cache and restart the app.

---

## Mentor peer circles (add/remove learners)

If you see **relation "public.peer_circle_members" does not exist**, the peer circles tables were never created. Run this **single script** in **Supabase Dashboard → SQL Editor**; it creates the tables and all RLS policies (including mentor add/remove):

```
supabase/scripts/create_peer_circles_and_mentor_policies.sql
```

Requires: `public.profiles` table. After running, mentors can create circles and add learners; learners see their circle and peers on their portal.

If the tables already exist (e.g. you ran migration `019_create_peer_circles.sql`) and you only need the mentor policies, run:

```
supabase/scripts/peer_circles_mentor_policies.sql
```

---

## Case Studies (learner Case Study Bank)

If learners see "Case Study Bank is not set up yet" or you get **relation "public.case_studies" does not exist**, run in **Supabase Dashboard → SQL Editor**:

```
supabase/scripts/create_case_studies_and_admin_policies.sql
```

This creates `case_studies` and `case_study_responses`, and RLS so all authenticated users can read case studies; learners can create/update their own responses; admins and mentors can create, update, and delete case studies and view all learner responses. After running, add case studies from **Admin → Case Studies**; they appear in the learner Case Study Bank and in **Mentor → Case Studies**.

---

## Resource Directory (Resources page)

If learners see "Resource Directory is not set up yet" or you get **relation "public.resources" does not exist**, run in **Supabase Dashboard → SQL Editor**:

```
supabase/scripts/create_resources_and_admin_policies.sql
```

This creates the `resources` table (if missing) and RLS so all authenticated users can read; admins and mentors can create, update, and delete. After running, add resources from **Admin → Resources**; they appear on the learner and mentor Resources pages.

---

## My Backpack (backpack_items)

If you get **relation "public.backpack_items" does not exist** or want My Backpack to sync across devices (instead of localStorage), run in **Supabase Dashboard → SQL Editor**:

```
supabase/scripts/create_backpack_items_and_policies.sql
```

This creates the `backpack_items` table (user_id, resource_type, resource_id, title, created_at) and RLS so users can only see and manage their own items. After running:

- **Learner → My Backpack** lists saved items from Supabase; add/remove from Resource Directory or Quick Reference Tools.
- Data survives clearing browser data and syncs across devices.

---

## Calendar (weekly events)

If learners see "Calendar is not set up yet" or you get **relation "public.weekly_events" does not exist**, run in **Supabase Dashboard → SQL Editor**:

```
supabase/scripts/create_weekly_events_and_admin_policies.sql
```

This creates the `weekly_events` table (if missing) and RLS so all authenticated users can read; admins and mentors can create, update, and delete. After running, add events from **Admin → Calendar**; they appear on the learner and mentor Calendar pages.

---

## Quizzes (mentor/admin set, learner takes once, answers locked)

If you get **relation "public.quizzes" does not exist** or want to enable the quiz feature, run in **Supabase Dashboard → SQL Editor**:

```
supabase/scripts/create_quizzes_and_policies.sql
```

This creates `quizzes`, `quiz_questions`, `quiz_attempts`, and `quiz_question_responses`, and RLS so:

- Admins and mentors can create, update, and delete quizzes and questions (and set the correct answer per question).
- Learners can read published quizzes and questions (correct answers are never sent to the client).
- Learners can create one attempt per quiz and submit one answer per question via **POST /api/quiz/submit-answer**; answers cannot be changed after submit.

After running, create quizzes and questions from **Admin → Quizzes** or **Mentor → Quizzes**; publish a quiz to show it on **Learner → Quizzes**. Learners take the quiz once; each answer is locked and marked correct or incorrect by the server.

---

## Messages (Learner ↔ Mentor/Admin)

If you get **relation "public.messages" does not exist** or want to enable direct messaging, run in **Supabase Dashboard → SQL Editor**:

```
supabase/scripts/create_messages_and_policies.sql
```

This creates the `messages` table (sender_id, recipient_id, body, read_at, created_at) and RLS so:

- Users can see messages they sent or received.
- Authenticated users can send messages (as sender).
- Recipients can mark messages as read (update read_at).

After running: **Learner → Messages** shows the inbox and thread view; **Mentor → Messages** and **Admin → Messages** show the same inbox plus "New message" to pick a learner/user. Mentors can also click "Message" on **Mentor → Learners**; admins can click "Message" on **Admin → Users**.

---

## Discussion prompts management (Admin & Mentor)

If you get **permission denied** when creating/editing discussion prompts, or the forum shows "No discussion prompts yet" and you want to fix it from the UI (without touching the DB by hand), run in **Supabase Dashboard → SQL Editor**:

```
supabase/scripts/create_discussion_prompts_admin_policies.sql
```

This script:

- Adds a **sort_order** column to `discussion_prompts` if missing (for display order).
- Lets **admin, mentor, and faculty** create, update, and delete discussion prompts (RLS policies).

Requires: `discussion_prompts` and `discussion_responses` (from migration `009_create_discussions.sql`) and `profiles` with a role column (for `get_my_profile_role()`).

After running:

- **Admin → Discussions** and **Mentor → Discussions** list prompts, with **Add prompt**, **Edit**, **Delete**, link to module, and **Order** (up/down and sort_order). The forum preview appears below.
- The learner forum orders prompts by `sort_order` then `posted_at`, so you can fix "No discussion prompts yet" by adding prompts from Admin or Mentor.

---

## Admin Users (list and edit profiles)

The **Admin → Users** page lists users from Supabase `profiles` and lets admins edit role, display name, and active flag. For admins to **see all profiles** and **update any profile**, run in **Supabase Dashboard → SQL Editor**:

```
supabase/scripts/admin_profiles_policies.sql
```

This script:

- Adds an **is_active** column to `profiles` if missing (default `true`).
- Ensures **get_my_profile_role()** exists.
- **SELECT:** users see own profile; admin/mentor/faculty see all profiles.
- **UPDATE:** users can update own profile; **admins** can update any profile (role, full_name, is_active).

After running, **Admin → Users** will list real users, filter by role (Learner / Mentor / Faculty / Admin), and allow Edit (role, display name, active). If your `profiles.role` column is an enum that does not include `mentor`, add it with: `ALTER TYPE user_role ADD VALUE 'mentor';` (or use a TEXT role column).

---

## Notifications (bell dropdown)

If you get **relation "public.notifications" does not exist** or want the header bell to show real alerts, run in **Supabase Dashboard → SQL Editor**:

```
supabase/scripts/create_notifications_and_policies.sql
```

This creates the `notifications` table (user_id, type, title, body, link, read_at, created_at) and RLS so:

- Users see only their own notifications and can mark them read.
- Any authenticated user can insert notifications (e.g. for the recipient of a message).

After running:

- **Admin** and **Mentor** headers use `NotificationBell` (already wired).
- **Learner** header uses `NotificationBell` with unread count, list, “Mark all read”, and links to the target page.

Notifications are created when:

- **New message:** recipient gets a notification (from MessageInbox).
- **Discussion reply:** the author of the replied-to post gets a notification (from DiscussionThread).
- **Quiz results:** when a learner completes a quiz, they get a “Quiz results ready” notification (from learner quiz page).

**Assignment feedback:** When mentor/admin grading writes to `assignment_submissions` (e.g. sets `graded = true` and `feedback`), add an insert into `notifications` for that submission’s `user_id` with type `assignment_feedback`, title “Assignment feedback”, and a link to the assignment or submissions page.
