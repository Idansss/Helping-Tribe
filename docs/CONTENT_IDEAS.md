# Content Ideas for Learner Sections

Ideas for what to put inside each section of the Helping Tribe learner portal.

---

## 1. **HOME** (`/dashboard`)

**Purpose:** Central landing and quick access.

**Ideas to include:**
- **Welcome message** with learner name and short motivational line.
- **Quick stats:** e.g. “X modules completed”, “Y journal entries”, “Next session in Z days”.
- **Shortcuts:** Cards or links to My Course, Learning Journal, Practice Client, Calendar.
- **Don’t miss:** Upcoming deadlines, next live session, unread discussions.
- **Recent activity:** Last lesson viewed, last journal save, last practice session.
- **Announcements:** One or two platform-wide or course-wide announcements.

---

## 2. **MY COURSE** (`/course`)

**Purpose:** Entry point to the main training curriculum.

**Ideas to include:**
- **Course overview:** Title, short description, total duration (e.g. 9 weeks).
- **Modules list:** All modules with titles, week numbers, completion status (not started / in progress / completed).
- **Final exam:** Single card or link to final exam (e.g. Case Study Analysis) with “Open” or “Go to Final Exam”.
- **Progress:** Overall % complete and/or progress bar.
- **Prerequisites:** If any (e.g. “Complete Module 3 before Module 4”).

**Sub-routes:**
- **Module page** (`/course/module/[id]`): Lessons, videos, readings, reflection prompts, “Mark complete”, next/previous.
- **Final exam page** (`/course/final-exam`): Instructions, submission form, deadline.

---

## 3. **LEARNING JOURNAL** (`/journal`)

**Purpose:** Reflection and insight capture tied to the course.

**Ideas to include:**
- **Module selector:** Dropdown or list to pick which module the entry is for.
- **Guided prompts:** Per-module reflection questions (e.g. “What was most challenging?” “What will you try differently?”).
- **Free-form area:** Large text area for open reflection.
- **Voice notes:** Optional short voice reflections (if you have VoiceNoteRecorder).
- **Save / auto-save:** Clear “Save” and “Saved” state.
- **Past entries:** List or calendar of previous journal entries by module/date, with “Edit” or “View”.
- **Export:** Optional “Download my journal” (PDF or text).

---

## 4. **PRACTICE CLIENT** (`/practice-client`)

**Purpose:** Safe, repeated practice of counseling conversations.

**Ideas to include:**
- **Client choice:** Pick a scenario (e.g. Chika, Amina, Tunde) with short description.
- **Chat interface:** Message history and input; optional “Restart conversation”.
- **Brief guidelines:** “Listen first,” “Use open questions,” “Avoid advice-giving,” etc.
- **Debrief:** After the conversation: “What went well?” “What would you do differently?” (optional short form).
- **Difficulty / focus:** Optional tags like “Low/Medium difficulty” or “Grief / Youth / Stigma”.
- **History:** List of past practice sessions (date, client, duration) for reflection.

---

## 5. **PEER CIRCLES** (`/peer-circles`)

**Purpose:** Small-group peer learning and support.

**Ideas to include:**
- **List of circles:** Name, description, member count, linked module (if any), “Join” / “View”.
- **Create circle:** Form: name, description, max members, module (optional).
- **My circles:** Tabs or filter for “Circles I’m in” vs “Discover”.
- **Circle detail:** Members, upcoming sessions, discussion thread or agenda, “Leave circle”.
- **Sessions:** Schedule peer circle meetings (date, time, link); optional notes/recordings.

---

## 6. **CASE STUDIES** (`/case-studies`)

**Purpose:** Scenario-based skill practice with structure.

**Ideas to include:**
- **Bank/list:** Filter by module, difficulty, tags; search by title.
- **Card per case:** Title, short scenario preview, difficulty, “Start” or “Resume”.
- **Case study view:** Full scenario, guided questions, hints (optional), answer areas, reflection box.
- **Save / submit:** Save draft; submit when ready; show “Submitted” and date.
- **Link to Practice Client:** “Practice this scenario with the AI client” where relevant.

---

## 7. **RESOURCES** (`/resources`)

**Purpose:** Reference and signposting (crisis, mental health, community).

**Ideas to include:**
- **Categories:** e.g. Emergency, Mental health hotlines, Hospitals, NGOs, Faith-based, International.
- **Per resource:** Name, short description, phone, email, address, website, “Save to Backpack”.
- **Search and filters:** By category, location, tag.
- **Disclaimer:** Short text that this is for reference only and not a substitute for professional help.

---

## 8. **MY BACKPACK** (`/backpack`)

**Purpose:** One place for saved items across the platform.

**Ideas to include:**
- **Grouped list:** By type: Lessons, Case studies, Resources, Discussions, Assignments.
- **Per item:** Title, type, link to open, “Remove from Backpack”.
- **Empty state:** “No saved items yet — use the bookmark icon on lessons and resources.”
- **Optional:** “Add note” or “Remind me” for a saved item (future).

---

## 9. **CALENDAR** (`/calendar`)

**Purpose:** See what’s happening and when.

**Ideas to include:**
- **Week view:** Current week with events per day.
- **Event types:** e.g. Discussion, Peer circle, Facilitator session, Quiz, Assignment due, Info session.
- **Per event:** Title, time, type, link (e.g. to session or assignment).
- **Navigation:** Previous/next week; optional “Today”.
- **Filters:** By type (e.g. only peer circles, only deadlines).
- **Sync:** Optional “Add to my calendar” (e.g. .ics export).

---

## Summary table

| Section        | Main content focus                                      |
|----------------|---------------------------------------------------------|
| **Home**       | Welcome, quick stats, shortcuts, announcements          |
| **My Course**  | Modules list, progress, final exam link                 |
| **Learning Journal** | Prompts, free-form reflection, past entries      |
| **Practice Client**  | Client scenarios, chat, debrief                  |
| **Peer Circles**     | List, create, join, sessions, members           |
| **Case Studies**     | Bank, filters, scenario + questions + submit     |
| **Resources**        | Categories, contact info, save to Backpack       |
| **My Backpack**      | Saved lessons, cases, resources, remove           |
| **Calendar**         | Week view, event types, links, filters            |

You can implement these in small steps: start with one section (e.g. Home or My Course), then add features from this list as you go.
