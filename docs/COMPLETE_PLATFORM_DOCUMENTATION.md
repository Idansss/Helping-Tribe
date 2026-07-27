# HELP Foundations Training Platform - Complete Documentation

## Table of Contents
1. [Platform Overview](#platform-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Architecture](#database-architecture)
5. [Authentication & Authorization](#authentication--authorization)
6. [Complete Feature List](#complete-feature-list)
7. [User Flows](#user-flows)
8. [API & Data Flow](#api--data-flow)
9. [Setup & Deployment](#setup--deployment)
10. [Future Enhancements](#future-enhancements)

---

## Platform Overview

The HELP Foundations Training Platform is a comprehensive Learning Management System (LMS) designed for a 9-week structured course on helping and counselling skills in low-resource contexts, specifically tailored for Nigeria. The platform integrates theory, practice, reflection, and peer learning to equip learners with culturally sensitive approaches for supporting individuals and communities.

### Core Purpose
- Deliver structured 9-week training program
- Facilitate peer learning and collaboration
- Track student progress and completion
- Provide resources and tools for helping professionals
- Enable assessment and evaluation

### Target Users
- **Students/Learners**: Primary users taking the course
- **Facilitators**: Course administrators (future enhancement)
- **System Administrators**: Platform managers

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **State Management**: React Hooks (useState, useEffect)

### Backend
- **Database**: PostgreSQL (via Supabase)
- **Backend Services**: Supabase
  - Authentication
  - Database (PostgreSQL)
  - Storage (File uploads)
  - Row Level Security (RLS)
- **API**: Supabase Client SDK (`@supabase/ssr`)

### Development Tools
- **Package Manager**: npm
- **Build Tool**: Next.js built-in
- **Linting**: ESLint
- **Version Control**: Git

---

## Project Structure

```
Helping Tribe/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── login/                   # Authentication
│   ├── dashboard/               # User dashboard
│   ├── course/                   # Course content
│   ├── calendar/                 # Weekly calendar
│   ├── discussions/             # Discussion forum
│   ├── assignments/             # Assignment system
│   ├── case-studies/            # Case study bank
│   ├── peer-circles/            # Peer learning circles
│   ├── final-projects/          # Final projects
│   ├── assessments/             # Assessment tools
│   ├── journal/                 # Learning journal
│   ├── resources/               # Resource directory
│   ├── tools/                   # Quick reference tools
│   └── certificate/             # Certificate page
├── components/
│   ├── ui/                      # Reusable UI components (Shadcn)
│   └── lms/                     # LMS-specific components
├── lib/
│   ├── supabase/                # Supabase client setup
│   │   ├── client.ts            # Client-side Supabase
│   │   ├── server.ts            # Server-side Supabase
│   │   └── middleware.ts       # Auth middleware
│   └── utils/                   # Utility functions
├── supabase/
│   └── migrations/              # Database migrations
├── types/
│   └── index.ts                 # TypeScript type definitions
├── public/                       # Static assets
├── .env.local                   # Environment variables
└── package.json                 # Dependencies
```

---

## Database Architecture

### Core Tables

#### 1. **profiles**
Stores user profile information linked to Supabase Auth.
- `id` (UUID, Primary Key) - Links to auth.users
- `full_name` (TEXT)
- `email` (TEXT)
- `role` (TEXT) - 'student', 'facilitator', 'admin'
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### 2. **modules**
Course modules (9 weeks).
- `id` (UUID, Primary Key)
- `week_number` (INTEGER) - 1-9
- `title` (TEXT)
- `description` (TEXT)
- `content` (JSONB) - Structured content
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### 3. **lessons**
Individual lessons within modules.
- `id` (UUID, Primary Key)
- `module_id` (UUID, Foreign Key → modules)
- `title` (TEXT)
- `content` (TEXT)
- `order` (INTEGER)
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### 4. **quizzes**
Quiz questions and answers.
- `id` (UUID, Primary Key)
- `module_id` (UUID, Foreign Key → modules)
- `question` (TEXT)
- `options` (JSONB) - Array of answer options
- `correct_answer` (INTEGER)
- `points` (INTEGER)
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### 5. **quiz_attempts**
Student quiz submissions.
- `id` (UUID, Primary Key)
- `quiz_id` (UUID, Foreign Key → quizzes)
- `user_id` (UUID, Foreign Key → profiles)
- `selected_answer` (INTEGER)
- `is_correct` (BOOLEAN)
- `attempted_at` (TIMESTAMPTZ)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### Feature-Specific Tables

#### Learning Journal
**learning_journals**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → profiles)
- `module_id` (UUID, Foreign Key → modules)
- `content` (TEXT) - Journal entry text
- `reflection_type` (TEXT) - 'module_reflection', 'end_of_course'
- `prompts_answered` (JSONB) - Structured prompt responses
- `attachments` (JSONB) - File attachments
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### Resource Directory
**resources**
- `id` (UUID, Primary Key)
- `category` (TEXT) - 'emergency', 'mental_health', 'hospital', 'ngo', etc.
- `title` (TEXT)
- `description` (TEXT)
- `contact_info` (JSONB) - Phone, email, address
- `website_url` (TEXT)
- `location` (TEXT)
- `tags` (TEXT[])
- `display_order` (INTEGER)
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### Quick Reference Tools
**quick_reference_tools**
- `id` (UUID, Primary Key)
- `tool_type` (TEXT) - 'stages', 'ethics', 'crisis', 'self_care', etc.
- `title` (TEXT)
- `content` (JSONB) - Structured tool content
- `module_id` (UUID, Foreign Key → modules, nullable)
- `display_order` (INTEGER)
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### Discussion Forum
**discussion_prompts**
- `id` (UUID, Primary Key)
- `module_id` (UUID, Foreign Key → modules)
- `prompt_text` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**discussion_responses**
- `id` (UUID, Primary Key)
- `prompt_id` (UUID, Foreign Key → discussion_prompts)
- `user_id` (UUID, Foreign Key → profiles)
- `response_text` (TEXT)
- `parent_response_id` (UUID, Foreign Key → discussion_responses, nullable) - For threading
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### Assignment System
**assignments**
- `id` (UUID, Primary Key)
- `module_id` (UUID, Foreign Key → modules)
- `title` (TEXT)
- `description` (TEXT)
- `assignment_type` (TEXT) - 'written', 'project', 'reflection'
- `due_date` (TIMESTAMPTZ)
- `max_points` (INTEGER)
- `instructions` (TEXT)
- `rubric` (JSONB)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**assignment_submissions**
- `id` (UUID, Primary Key)
- `assignment_id` (UUID, Foreign Key → assignments)
- `user_id` (UUID, Foreign Key → profiles)
- `submission_text` (TEXT)
- `file_url` (TEXT) - Supabase Storage URL
- `file_name` (TEXT)
- `submitted_at` (TIMESTAMPTZ)
- `graded` (BOOLEAN)
- `grade` (INTEGER)
- `feedback` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)
- UNIQUE(assignment_id, user_id)

#### Case Study Bank
**case_studies**
- `id` (UUID, Primary Key)
- `module_id` (UUID, Foreign Key → modules, nullable)
- `title` (TEXT)
- `scenario` (TEXT)
- `questions` (JSONB) - Array of question objects with hints
- `learning_objectives` (TEXT[])
- `difficulty_level` (TEXT) - 'beginner', 'intermediate', 'advanced'
- `tags` (TEXT[])
- `created_at`, `updated_at` (TIMESTAMPTZ)

**case_study_responses**
- `id` (UUID, Primary Key)
- `case_study_id` (UUID, Foreign Key → case_studies)
- `user_id` (UUID, Foreign Key → profiles)
- `responses` (JSONB) - {questionId: answer}
- `reflection` (TEXT)
- `submitted_at` (TIMESTAMPTZ)
- `created_at`, `updated_at` (TIMESTAMPTZ)
- UNIQUE(case_study_id, user_id)

#### Weekly Calendar
**weekly_events**
- `id` (UUID, Primary Key)
- `module_id` (UUID, Foreign Key → modules, nullable)
- `event_type` (TEXT) - 'discussion_prompt', 'peer_circle', 'facilitator_session', etc.
- `scheduled_date` (TIMESTAMPTZ)
- `title` (TEXT)
- `description` (TEXT)
- `meeting_link` (TEXT)
- `recording_url` (TEXT)
- `week_number` (INTEGER) - 0 for orientation, 1-9 for modules
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### Assessment Tools
**assessment_tools**
- `id` (UUID, Primary Key)
- `tool_type` (TEXT) - 'pre_training', 'post_training', 'session_feedback', 'final_evaluation'
- `title` (TEXT)
- `description` (TEXT)
- `questions` (JSONB) - Array of question objects
- `is_active` (BOOLEAN)
- `available_from` (TIMESTAMPTZ, nullable)
- `available_until` (TIMESTAMPTZ, nullable)
- `module_id` (UUID, Foreign Key → modules, nullable)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**assessment_responses**
- `id` (UUID, Primary Key)
- `assessment_id` (UUID, Foreign Key → assessment_tools)
- `user_id` (UUID, Foreign Key → profiles)
- `responses` (JSONB) - {questionId: answer}
- `submitted_at` (TIMESTAMPTZ)
- `created_at`, `updated_at` (TIMESTAMPTZ)
- UNIQUE(assessment_id, user_id)

#### Peer Learning Circles
**peer_circles**
- `id` (UUID, Primary Key)
- `name` (TEXT)
- `description` (TEXT)
- `module_id` (UUID, Foreign Key → modules, nullable)
- `max_members` (INTEGER) - Default: 6
- `is_active` (BOOLEAN)
- `created_by` (UUID, Foreign Key → profiles)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**peer_circle_members**
- `id` (UUID, Primary Key)
- `circle_id` (UUID, Foreign Key → peer_circles)
- `user_id` (UUID, Foreign Key → profiles)
- `role` (TEXT) - 'member', 'facilitator', 'leader'
- `joined_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)
- UNIQUE(circle_id, user_id)

**peer_circle_sessions**
- `id` (UUID, Primary Key)
- `circle_id` (UUID, Foreign Key → peer_circles)
- `session_date` (TIMESTAMPTZ)
- `title` (TEXT)
- `description` (TEXT)
- `agenda` (JSONB)
- `meeting_link` (TEXT)
- `recording_url` (TEXT)
- `notes` (TEXT)
- `created_by` (UUID, Foreign Key → profiles)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**peer_circle_presentations**
- `id` (UUID, Primary Key)
- `circle_id` (UUID, Foreign Key → peer_circles)
- `session_id` (UUID, Foreign Key → peer_circle_sessions, nullable)
- `presenter_id` (UUID, Foreign Key → profiles)
- `case_study_id` (UUID, Foreign Key → case_studies, nullable)
- `presentation_text` (TEXT)
- `presentation_file_url` (TEXT)
- `feedback` (JSONB)
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### Final Projects
**final_projects**
- `id` (UUID, Primary Key)
- `module_id` (UUID, Foreign Key → modules) - Should be Module 9
- `title` (TEXT)
- `description` (TEXT)
- `requirements` (JSONB) - {objectives, deliverables, rubric, guidelines}
- `due_date` (TIMESTAMPTZ)
- `max_points` (INTEGER) - Default: 100
- `is_active` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**final_project_submissions**
- `id` (UUID, Primary Key)
- `project_id` (UUID, Foreign Key → final_projects)
- `user_id` (UUID, Foreign Key → profiles)
- `submission_text` (TEXT)
- `submission_file_url` (TEXT)
- `submission_file_name` (TEXT)
- `presentation_url` (TEXT)
- `reflection` (TEXT)
- `submitted_at` (TIMESTAMPTZ)
- `graded` (BOOLEAN)
- `grade` (INTEGER)
- `feedback` (TEXT)
- `graded_by` (UUID, Foreign Key → profiles, nullable)
- `graded_at` (TIMESTAMPTZ, nullable)
- `created_at`, `updated_at` (TIMESTAMPTZ)
- UNIQUE(project_id, user_id)

**final_project_feedback**
- `id` (UUID, Primary Key)
- `submission_id` (UUID, Foreign Key → final_project_submissions)
- `reviewer_id` (UUID, Foreign Key → profiles)
- `feedback_text` (TEXT)
- `strengths` (TEXT)
- `improvements` (TEXT)
- `rating` (INTEGER) - 1-5
- `created_at`, `updated_at` (TIMESTAMPTZ)
- UNIQUE(submission_id, reviewer_id)

### Storage Buckets
- **assignments**: For assignment file uploads
- **final-exams**: For final exam submissions (future)

### Row Level Security (RLS)
All tables have RLS enabled with policies ensuring:
- Users can only view/modify their own data where appropriate
- Authenticated users can view shared content (discussions, resources, etc.)
- Circle members can view circle-specific content
- Facilitators/admins have elevated permissions (future enhancement)

---

## Authentication & Authorization

### Authentication Flow
1. User visits `/login`
2. Can toggle between Sign In and Sign Up
3. **Sign Up**:
   - Email and password required
   - Creates account in Supabase Auth
   - Automatically creates profile in `profiles` table
   - Redirects to dashboard
4. **Sign In**:
   - Email and password required
   - Validates credentials via Supabase Auth
   - Redirects to dashboard

### Session Management
- Uses Supabase SSR package for server-side session handling
- Middleware (`middleware.ts`) protects routes requiring authentication
- Client-side uses `createClient()` from `@supabase/ssr` for API calls

### Authorization Levels
- **Authenticated Users**: Can access all student features
- **Future: Facilitators**: Will have grading/administrative access
- **Future: Admins**: Full system access

---

## Complete Feature List

### 1. Enhanced Learning Journal

**Purpose**: Structured reflection tool for each module and end-of-course reflection.

**Components**:
- `components/lms/LearningJournal.tsx`
- `lib/utils/journal-prompts.ts` - Contains all structured prompts

**Features**:
- **Module Reflections**: 5 structured prompts per module
  - Key insights gained
  - Connection to personal/professional experience
  - Strengths noticed
  - Challenges faced
  - Application plans
- **End-of-Course Reflection**: 5 prompts for overall course reflection
- **Dual Mode**:
  - **Prompts Mode**: Answer structured prompts
  - **Freeform Mode**: Write freely
- **Auto-save**: Saves progress automatically
- **Module Selection**: Dropdown to select module (1-9) or "End of Course"
- **Visual Feedback**: Shows saved status

**Data Flow**:
1. User selects module
2. Component loads prompts from `JOURNAL_PROMPTS`
3. User fills in answers
4. Auto-saves to `learning_journals` table
5. `prompts_answered` stored as JSONB: `{promptId: answer}`

**Database**: `learning_journals` table

---

### 2. Resource Directory

**Purpose**: Comprehensive directory of Nigeria-specific resources for helpers.

**Components**:
- `components/lms/ResourceDirectory.tsx`
- `app/resources/page.tsx`

**Features**:
- **Categories**:
  - Emergency Services
  - Mental Health Hotlines
  - Hospitals and Psychiatric Services
  - NGOs and Community Support
  - Faith and Community-Based Resources
  - International Resources
- **Search**: Full-text search across title, description, tags
- **Category Filter**: Filter by resource category
- **Resource Cards**: Display contact info, location, website
- **Quick Copy**: Phone numbers easily accessible

**Data Flow**:
1. Component loads all resources from `resources` table
2. Filters by search query and category
3. Displays in card grid layout

**Database**: `resources` table (seeded with 30+ Nigeria-specific resources)

---

### 3. Quick Reference Tools

**Purpose**: 8 printable/downloadable quick reference tools for helpers.

**Components**:
- `components/lms/QuickReferenceTool.tsx` - Individual tool display
- `components/lms/QuickReferenceTools.tsx` - Tool list
- `app/tools/page.tsx`

**Tools Available**:
1. Stages of Helping (Exploration, Insight, Action)
2. Core Ethical Principles
3. Crisis Intervention Steps
4. Self-Care Checklist
5. Active Listening Skills
6. Grounding Techniques
7. Cultural Sensitivity
8. Feedback Tips

**Features**:
- **Tool List**: Grid view of all tools
- **Full View**: Detailed view of individual tool
- **Print**: Browser print functionality
- **Download**: Download as PDF (future: actual PDF generation)
- **Search**: Search tools by title/content
- **Structured Content**: Each tool has structured JSONB content

**Data Flow**:
1. Loads tools from `quick_reference_tools` table
2. Displays preview cards
3. Click to view full tool with structured content
4. Print/download functionality

**Database**: `quick_reference_tools` table

---

### 4. Discussion Forum

**Purpose**: Module-based discussion threads for peer learning.

**Components**:
- `components/lms/DiscussionForum.tsx` - Main forum listing
- `components/lms/DiscussionThread.tsx` - Individual thread view
- `app/discussions/page.tsx` - Main forum page
- `app/discussions/[moduleId]/page.tsx` - Module-specific discussions

**Features**:
- **Discussion Prompts**: One prompt per module (9 total)
- **Threaded Replies**: Support for nested responses
- **Response Count**: Shows number of responses per prompt
- **Module Association**: Each prompt linked to a module
- **Post/Edit/Delete**: Users can post, edit, and delete their own responses
- **Real-time Updates**: Component refreshes after posting

**Data Flow**:
1. Forum page loads all `discussion_prompts`
2. Shows response count for each
3. Click prompt → loads `discussion_responses` for that prompt
4. Users can post new responses or reply to existing ones
5. `parent_response_id` enables threading

**Database**: 
- `discussion_prompts` table
- `discussion_responses` table

---

### 5. Assignment System

**Purpose**: Submit assignments for each module with file uploads and grading.

**Components**:
- `components/lms/AssignmentList.tsx` - Assignment listing
- `components/lms/AssignmentCard.tsx` - Individual assignment card
- `components/lms/AssignmentSubmission.tsx` - Submission interface
- `app/assignments/page.tsx` - Main assignments page
- `app/assignments/[assignmentId]/page.tsx` - Individual assignment

**Features**:
- **Assignment List**: All 9 module assignments
- **Search & Filters**: 
  - Search by title/description
  - Filter by type (written, project, reflection)
  - Filter by status (pending, submitted, graded)
- **Assignment Details**:
  - Title, description, instructions
  - Due date with visual indicators (overdue, due soon)
  - Points, rubric
  - Submission status
- **Submission**:
  - Text submission (textarea)
  - File upload (PDF, DOC, etc.) via Supabase Storage
  - Update submission until due date
- **Grading**:
  - Grade display (when graded)
  - Feedback from facilitator
  - Submission timestamp

**Data Flow**:
1. Load assignments from `assignments` table
2. Check user's submissions in `assignment_submissions`
3. Display status (pending/submitted/graded)
4. On submit:
   - Upload file to Supabase Storage bucket "assignments"
   - Save submission to `assignment_submissions`
5. Facilitator grades (future: admin interface)

**Database**:
- `assignments` table (9 assignments, one per module)
- `assignment_submissions` table
- Supabase Storage: `assignments` bucket

---

### 6. Case Study Bank

**Purpose**: Interactive case studies for practice and analysis.

**Components**:
- `components/lms/CaseStudyBank.tsx` - Case study listing
- `components/lms/CaseStudyCard.tsx` - Individual case study card
- `components/lms/CaseStudyViewer.tsx` - Interactive case study interface
- `app/case-studies/page.tsx` - Main case studies page
- `app/case-studies/[caseId]/page.tsx` - Individual case study

**Case Studies Available** (5 total):
1. Student with Depression (Chika)
2. Mother with Grief (Amina)
3. Disability Stigma (Tunde)
4. Domestic Conflict (Ngozi)
5. Displaced Adolescent - Trauma (Musa)

**Features**:
- **Case Study List**: Grid view of all case studies
- **Search & Filter**:
  - Search by title, scenario, tags, learning objectives
  - Filter by difficulty (beginner, intermediate, advanced)
- **Case Study Viewer**:
  - Scenario display
  - Interactive questions with hints
  - Text input for each question
  - Reflection section
  - Save progress
  - Completion tracking
- **Hints System**: Each question has optional hints
- **Completion Status**: Shows if user has responded

**Data Flow**:
1. Load case studies from `case_studies` table
2. Check user's responses in `case_study_responses`
3. Display completion status
4. On view:
   - Load case study with questions (JSONB)
   - User answers questions
   - Saves to `case_study_responses` as JSONB: `{questionId: answer}`
5. Reflection saved separately

**Database**:
- `case_studies` table (5 case studies)
- `case_study_responses` table

---

### 7. Weekly Calendar

**Purpose**: Visual calendar showing all course events and deadlines.

**Components**:
- `components/lms/WeeklyCalendar.tsx`
- `app/calendar/page.tsx`

**Features**:
- **Weekly View**: 7-day calendar grid (Monday-Sunday)
- **Event Types** (color-coded):
  - Discussion Prompts (Blue)
  - Peer Circles (Purple)
  - Facilitator Sessions (Green)
  - Wrap-Up Sessions (Orange)
  - Quizzes (Yellow)
  - Assignment Due Dates (Red)
  - Info Sessions (Indigo)
  - Orientation (Teal)
- **Week Navigation**: Previous/Next week buttons
- **Today Button**: Jump to current week
- **Event Details**:
  - Title, description
  - Time
  - Module/week association
  - Meeting links (if available)
  - Links to related content (discussions, assignments)
- **Legend**: Shows all event type colors

**Data Flow**:
1. Loads all events from `weekly_events` table
2. Groups by date
3. Displays in calendar grid
4. Filters events for current week
5. Links to related pages (discussions, assignments)

**Database**: `weekly_events` table (seeded with all 9 weeks + orientation)

---

### 8. Assessment Tools

**Purpose**: Pre/post training questionnaires and feedback forms.

**Components**:
- `components/lms/AssessmentList.tsx` - Assessment listing
- `components/lms/AssessmentTool.tsx` - Individual assessment form
- `app/assessments/page.tsx` - Main assessments page
- `app/assessments/[assessmentId]/page.tsx` - Individual assessment

**Assessment Types** (4 total):
1. **Pre-Training Questionnaire**: Baseline knowledge and expectations
2. **Post-Training Questionnaire**: Measure knowledge gained and impact
3. **Session Feedback Form**: Continuous improvement after each module
4. **Final Course Evaluation Form**: Overall course effectiveness

**Features**:
- **Question Types**:
  - Textarea (long-form answers)
  - Scale/Rating (1-5 or 1-10 with labels)
  - Multiple Choice (checkboxes)
  - Single Choice (radio buttons)
- **Required Fields**: Validation for required questions
- **Response Tracking**: Shows if user has submitted
- **Edit Capability**: Can update responses
- **Completion Indicators**: Visual badges for completed assessments

**Data Flow**:
1. Loads assessments from `assessment_tools` table
2. Checks user's responses in `assessment_responses`
3. Displays completion status
4. On submit:
   - Validates required fields
   - Saves responses as JSONB: `{questionId: answer}`
   - Stores in `assessment_responses`
5. Can view/edit previous responses

**Database**:
- `assessment_tools` table (4 assessments)
- `assessment_responses` table

---

### 9. Peer Learning Circles

**Purpose**: Create and join peer learning groups for collaborative learning.

**Components**:
- `components/lms/PeerCircleList.tsx` - Circle listing
- `components/lms/PeerCircleDetail.tsx` - Individual circle details
- `app/peer-circles/page.tsx` - Main circles page
- `app/peer-circles/[circleId]/page.tsx` - Individual circle

**Features**:
- **Create Circles**: Any user can create a peer circle
- **Join/Leave**: Users can join or leave circles
- **Member Management**:
  - View all members
  - Member count (max 6 per circle)
  - Role display (member, facilitator, leader)
- **Session Scheduling**:
  - Create scheduled sessions
  - Date/time picker
  - Title and description
  - Meeting links
- **Module Association**: Optional link to specific module
- **Privacy**: Only members can view sessions

**Data Flow**:
1. Loads circles from `peer_circles` table
2. Checks user's membership in `peer_circle_members`
3. Shows join/leave buttons
4. On join: Adds to `peer_circle_members`
5. Circle detail page:
   - Shows members
   - Shows sessions (if member)
   - Allows creating new sessions
6. Sessions saved to `peer_circle_sessions`

**Database**:
- `peer_circles` table
- `peer_circle_members` table
- `peer_circle_sessions` table
- `peer_circle_presentations` table (for future case presentations)

---

### 10. Final Projects System

**Purpose**: Capstone project submissions for Module 9.

**Components**:
- `components/lms/FinalProjectList.tsx` - Project listing
- `components/lms/FinalProjectSubmission.tsx` - Submission interface
- `app/final-projects/page.tsx` - Main projects page
- `app/final-projects/[projectId]/page.tsx` - Individual project

**Features**:
- **Project Requirements**:
  - Learning objectives
  - Deliverables list
  - Guidelines
  - Rubric (structured JSONB)
- **Submission Interface**:
  - Large textarea for project report (1500-2000 words)
  - Reflection section
  - Presentation URL field
  - File upload support
- **Due Date Tracking**: Visual indicators for overdue/due soon
- **Grading**: Grade and feedback display (when graded)
- **Update Capability**: Can update until due date

**Data Flow**:
1. Loads project from `final_projects` table (Module 9)
2. Checks user's submission in `final_project_submissions`
3. Displays requirements and guidelines
4. On submit:
   - Uploads file to Supabase Storage (if provided)
   - Saves submission text, reflection, presentation URL
   - Stores in `final_project_submissions`
5. Facilitator grades (future: admin interface)

**Database**:
- `final_projects` table (1 project for Module 9)
- `final_project_submissions` table
- `final_project_feedback` table (for future peer feedback)

---

## User Flows

### New User Registration
1. User visits `/login`
2. Clicks "Sign Up" toggle
3. Enters email, password, full name
4. Submits form
5. Account created in Supabase Auth
6. Profile automatically created in `profiles` table
7. Redirected to `/dashboard`

### Completing a Module
1. User navigates to `/course`
2. Selects a module (e.g., Module 1)
3. Views module content and lessons
4. Completes activities:
   - Takes quiz (`/course/[moduleId]/quiz`)
   - Submits assignment (`/assignments`)
   - Participates in discussion (`/discussions/[moduleId]`)
   - Writes journal entry (`/journal`)
5. Views calendar for module events (`/calendar`)
6. Completes session feedback (`/assessments`)

### Submitting an Assignment
1. User navigates to `/assignments`
2. Views assignment list
3. Clicks on an assignment
4. Reads requirements and instructions
5. Writes submission text
6. Optionally uploads file
7. Clicks "Submit"
8. File uploaded to Supabase Storage
9. Submission saved to database
10. Status updates to "Submitted"

### Joining a Peer Circle
1. User navigates to `/peer-circles`
2. Views available circles
3. Clicks "Join" on a circle
4. Membership added to `peer_circle_members`
5. Can now view circle details and sessions
6. Can schedule sessions
7. Can view other members

### Completing Final Project
1. User navigates to `/final-projects`
2. Views project requirements
3. Clicks "Start Project"
4. Reads objectives, deliverables, guidelines
5. Writes project report (1500-2000 words)
6. Writes reflection
7. Optionally adds presentation URL
8. Optionally uploads file
9. Submits before due date
10. Can update until due date
11. Receives grade and feedback (when graded)

---

## API & Data Flow

### Supabase Client Setup

**Client-Side** (`lib/supabase/client.ts`):
```typescript
import { createBrowserClient } from '@supabase/ssr'
```
- Used in React components
- Handles client-side data fetching
- Manages authentication state

**Server-Side** (`lib/supabase/server.ts`):
```typescript
import { createServerClient } from '@supabase/ssr'
```
- Used in server components and API routes
- Handles server-side data fetching
- Secure session management

### Common Data Fetching Pattern

```typescript
// 1. Get authenticated user
const { data: { user } } = await supabase.auth.getUser()
if (!user) return // Not authenticated

// 2. Fetch data with RLS
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('filter_column', value)

// 3. Handle errors
if (error) throw error

// 4. Process data
setData(data)
```

### File Upload Pattern

```typescript
// 1. Get file from input
const file = event.target.files[0]

// 2. Generate unique file path
const fileExt = file.name.split('.').pop()
const fileName = `${user.id}/${itemId}/${Date.now()}.${fileExt}`
const filePath = `bucket-name/${fileName}`

// 3. Upload to Supabase Storage
const { error: uploadError } = await supabase.storage
  .from('bucket-name')
  .upload(filePath, file)

// 4. Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('bucket-name')
  .getPublicUrl(filePath)

// 5. Save URL to database
await supabase.from('table_name').update({ file_url: publicUrl })
```

### Real-time Updates (Future)
Supabase supports real-time subscriptions:
```typescript
const channel = supabase
  .channel('table-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'table_name' },
    (payload) => { /* handle update */ }
  )
  .subscribe()
```

---

## Setup & Deployment

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Supabase account
- Git (for version control)

### Initial Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd "Helping Tribe"
```

2. **Install Dependencies**
```bash
npm install
```

3. **Set Up Supabase**
   - Create project at https://supabase.com
   - Get project URL and anon key
   - Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. **Run Database Migrations**
   - Go to Supabase Dashboard → SQL Editor
   - Run migrations in order:
     - `001_initial_schema.sql`
     - `002_create_storage_buckets.sql`
     - `003_seed_data.sql`
     - `004_enhance_learning_journals.sql`
     - `005_create_resources.sql`
     - `006_seed_resources.sql`
     - `007_create_quick_reference_tools.sql`
     - `008_seed_quick_reference_tools.sql`
     - `009_create_discussions.sql`
     - `010_seed_discussion_prompts.sql`
     - `011_create_assignments.sql`
     - `012_seed_assignments.sql`
     - `013_create_case_studies.sql`
     - `014_seed_case_studies.sql`
     - `015_create_weekly_events.sql`
     - `016_seed_weekly_calendar.sql`
     - `017_create_assessments.sql`
     - `018_seed_assessments.sql`
     - `019_create_peer_circles.sql`
     - `020_create_final_projects.sql`
     - `021_seed_final_projects.sql`

5. **Set Up Storage Buckets**
   - Go to Supabase Dashboard → Storage
   - Create bucket: `assignments`
   - Set public access if needed
   - Configure RLS policies

6. **Run Development Server**
```bash
npm run dev
```

7. **Access Application**
   - Open http://localhost:3000
   - Create account at `/login`
   - Start using the platform

### Production Deployment

1. **Build Application**
```bash
npm run build
```

2. **Deploy to Vercel/Netlify**
   - Connect GitHub repository
   - Add environment variables
   - Deploy

3. **Configure Supabase**
   - Update allowed origins in Supabase Dashboard
   - Configure CORS if needed
   - Set up production database backups

---

## Future Enhancements

### Planned Features

1. **Certificate Generation**
   - Automated PDF certificate generation
   - Completion criteria checking
   - Downloadable certificates

2. **Dashboard Improvements**
   - Progress tracking visualization
   - Completion percentage
   - Upcoming deadlines widget
   - Recent activity feed

3. **Notifications System**
   - Email notifications for due dates
   - In-app notifications
   - Assignment grading alerts

4. **Facilitator/Admin Interface**
   - Grading interface
   - User management
   - Content management
   - Analytics dashboard

5. **Advanced Features**
   - Real-time chat in peer circles
   - Video conferencing integration
   - Mobile app (React Native)
   - Offline mode support

6. **Analytics & Reporting**
   - Student progress reports
   - Course completion statistics
   - Engagement metrics
   - Assessment analysis

---

## Security Considerations

### Current Security Measures
- **Row Level Security (RLS)**: All tables protected
- **Authentication**: Supabase Auth with secure sessions
- **File Uploads**: Validated file types and sizes
- **Input Validation**: Client and server-side validation
- **HTTPS**: Required in production

### Best Practices Implemented
- No sensitive data in client-side code
- Environment variables for secrets
- SQL injection prevention (parameterized queries)
- XSS prevention (React's built-in escaping)
- CSRF protection (Supabase handles)

### Recommendations
- Regular security audits
- Dependency updates
- Rate limiting for API calls
- File upload size limits
- Content moderation for user-generated content

---

## Support & Maintenance

### Common Issues

**"Cannot find the middleware module"**
- Solution: Delete `.next` folder and restart dev server

**"Forbidden use of secret API key"**
- Solution: Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key), not secret key

**File upload fails**
- Check: Storage bucket exists and has correct RLS policies
- Check: File size limits
- Check: CORS configuration

**Database connection errors**
- Verify: `.env.local` has correct Supabase credentials
- Verify: Supabase project is active
- Check: Network connectivity

### Maintenance Tasks
- Regular database backups
- Monitor Supabase usage/quota
- Update dependencies monthly
- Review and optimize database queries
- Monitor error logs

---

## Conclusion

The HELP Foundations Training Platform is a comprehensive, feature-rich LMS designed specifically for the 9-week training program. It integrates all aspects of the course - content delivery, assignments, discussions, peer learning, assessments, and final projects - into a cohesive learning experience.

The platform is built with modern technologies (Next.js, TypeScript, Supabase) ensuring scalability, security, and maintainability. All features are fully functional and ready for production use after running the database migrations.

For questions or support, refer to the individual feature documentation or the Supabase dashboard for database management.

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Platform Version**: 1.0
