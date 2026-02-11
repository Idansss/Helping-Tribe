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
