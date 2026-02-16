# Helping Tribe - LMS Platform

A custom Learning Management System (LMS) and Community Platform for the "HELP Foundations Training" program—a 9-week course on counseling, ethics, and trauma support.

## 🎯 Core Mission

To equip and certify individuals in foundational helping skills through a structured, rigorous, yet communal digital environment.

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn UI
- **Icons:** Lucide React
- **Database/Auth:** Supabase (Auth, Database, Storage)
- **State Management:** Zustand

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Student dashboard
│   ├── course/            # Course player
│   ├── journal/           # Learning journal
│   └── ...
├── components/
│   ├── ui/                # Shadcn UI components
│   └── lms/               # LMS-specific components
├── lib/
│   ├── supabase/          # Supabase client utilities
│   ├── utils/             # Helper functions
│   └── store/             # Zustand stores
├── types/                 # TypeScript type definitions
└── supabase/
    └── migrations/        # Database migration files
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (required for approvals + password setup tokens)

3. **Set up the database:**
   - Run the migration file in `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor
   - Or use Supabase CLI: `supabase db push`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 🔒 Access Control

- Public routes: `/apply` (application form), `/student/login`, `/staff/login`, `/set-password`.
- All other routes (including deep links like `/learner/...`) are protected server-side via `proxy.ts` + `lib/supabase/middleware.ts`.
- Unauthenticated visitors are redirected to `/apply`.

## 🧑‍🎓 Student onboarding (Matric + self-set password)

1. Visitor submits the public application on `/apply` → stored as `applicants (PENDING)`.
2. Admin reviews `Admin → Applicants` (`/admin/applicants`) and clicks **Approve**.
3. System generates a unique matric number (`HF-CT-YYYY-####`) + a one-time set-password link.
4. Student sets their password via `/set-password?token=...` and then logs in at `/student/login` using **Matric Number + Password**.

## 📚 Key Features

### 1. Landing Page
- Hero section: "Equipping the Hands That Help"
- Faculty grid: Dynamic display of mentors
- Curriculum preview: Timeline showing 9 modules

### 2. Student Dashboard ("Locker Room")
- Progress tracker: Visual bar showing completion % (0-100%)
- Sequential learning: Module 1 must be completed to unlock Module 2
- Learning journal: Text editor for private reflections

### 3. Course Player ("Classroom")
- Sidebar navigation for Modules 1-9
- Main content area:
  - HTML content for lesson text
  - Video embed placeholder (for converted PPTs)
  - Audio player (for Role Play scenarios)
- Worksheet component: Form submission required to mark lesson as "Complete"

### 4. Assessment Engine ("Exam Hall")
- Quiz logic: 10-question multiple-choice quiz at end of each module
- Gating: >80% score required to pass
- Final exam: File upload dropzone for "Case Study Analysis" at end of Week 9

### 5. Certification System
- Auto-generation of PDF certificate upon completion of all 9 modules + Final Exam

## 🗄️ Database Schema

The database includes:
- **profiles** - User profiles extending Supabase auth
- **cohorts** - Course cohorts/groups
- **modules** - 9 course modules
- **lessons** - Lessons within modules
- **user_progress** - Individual lesson progress
- **module_progress** - Module-level progress and quiz scores
- **quizzes** & **quiz_questions** - Assessment structure
- **learning_journals** - Student reflections
- **final_exam_submissions** - Final exam uploads
- **certificates** - Generated certificates

## 🎨 Design Theme

The platform uses a calming, professional color palette (Blues, Teals, Whites) fitting for a counseling/mental health academy.

## 📝 License

Private - HELP Foundations Training Program

## Application Flow (Updated)

Public routes:
- `/` unified marketing + intake homepage
- `/apply` multi-step application wizard
- `/apply/resume` resume draft flow
- `/apply/success?id=<applicationId>` submission confirmation
- `/privacy`, `/terms`, `/contact`
- `/student/login`, `/staff/login`, `/student/set-password` (and `/set-password` alias)

Application journey:
1. Applicant starts on `/apply`, completes multi-step form, and drafts autosave to DB (`application_drafts`).
2. Final submit posts to `/api/apply/submit`, server-validates with Zod, checks honeypot + rate limit, and inserts `applicants` row with status `PENDING`.
3. User is redirected to `/apply/success` with application ID.
4. Admin reviews in `/admin/applicants`, approves/rejects.
5. Approved applicant receives payment instructions; after payment verification, set-password link is generated.
6. Set-password links are issued at `/student/set-password?token=...` and also logged to `email_outbox`.
7. Student logs in via matric number on `/student/login`.

## Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYSTACK_SECRET_KEY` (for live paystack initialization/verification)
- `PAYSTACK_WEBHOOK_SECRET` (recommended for webhook verification)
- `BASE_URL` (recommended in production for callback/link generation)

## New/Updated DB Tables

- `application_drafts`
  - `id`, `status`, `email`, `form_data`, `last_step`, timestamps
- `email_outbox`
  - `id`, `recipient_email`, `subject`, `body`, `kind`, `applicant_id`, `student_id`, `created_at`
- `applicant_status` enum updated to include `DRAFT` (migration 033)

Run migration:
- `supabase/migrations/033_application_drafts_and_outbox.sql`

## Reset Test Data Safely

Use the built-in reset script before handover or production launch cleanup.

1. Dry run:
   - `CONFIRM=YES DRY_RUN=1 node scripts/reset-test-data.mjs`
2. Execute:
   - `CONFIRM=YES DRY_RUN=0 node scripts/reset-test-data.mjs`

Notes:
- The script keeps staff/admin access by default and removes test user/application data.
- Schema and migrations are not deleted.
- Optional `WIPE_REFERENCE_DATA=YES` also clears seeded content tables.
- See `HANDOVER.md` for full reset scope and post-reset account notes.
