# Setup Guide - Helping Tribe LMS

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. **Create a Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run Database Migrations:**
   - In your Supabase dashboard, go to SQL Editor
   - Run the migration file: `supabase/migrations/001_initial_schema.sql`
   - Then run: `supabase/migrations/002_create_storage_buckets.sql`

3. **Set Up Storage Buckets:**
   - Go to Storage in your Supabase dashboard
   - Verify that `certificates` and `final-exams` buckets were created
   - If not, create them manually:
     - `certificates`: Public bucket
     - `final-exams`: Private bucket

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Seed Initial Data (Optional)

You can create initial data using the Supabase SQL Editor:

```sql
-- Insert sample modules
INSERT INTO public.modules (title, week_number, description, is_locked) VALUES
('Introduction to Helping Skills', 1, 'Foundation concepts and ethics', false),
('Active Listening', 2, 'Core listening techniques', true),
('Empathy and Understanding', 3, 'Building empathetic connections', true),
('Crisis Intervention', 4, 'Handling crisis situations', true),
('Trauma-Informed Care', 5, 'Understanding trauma responses', true),
('Boundaries and Ethics', 6, 'Professional boundaries', true),
('Cultural Competency', 7, 'Working with diverse populations', true),
('Self-Care for Helpers', 8, 'Preventing burnout', true),
('Integration and Practice', 9, 'Putting it all together', true);

-- Insert sample faculty
INSERT INTO public.faculty (name, title, bio, display_order) VALUES
('Dr. Jane Smith', 'Lead Instructor', '20+ years in counseling and trauma support', 1),
('Prof. John Doe', 'Ethics Specialist', 'Expert in professional ethics and boundaries', 2);

-- Create a quiz for Module 1 (example)
INSERT INTO public.quizzes (module_id, title, description, passing_score)
SELECT id, 'Module 1 Assessment', 'Test your understanding of foundational concepts', 80
FROM public.modules WHERE week_number = 1;

-- Add sample questions (you'll need to adjust based on your quiz structure)
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Your First User

1. In Supabase Dashboard, go to Authentication
2. Create a user manually or enable email signup
3. Update the user's profile in the `profiles` table:
   ```sql
   UPDATE public.profiles 
   SET role = 'student', full_name = 'Your Name'
   WHERE id = 'user-uuid-here';
   ```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── dashboard/         # Student dashboard
│   ├── course/            # Course player and modules
│   ├── journal/           # Learning journal
│   ├── certificate/       # Certification page
│   └── login/             # Authentication
├── components/
│   ├── ui/                # Shadcn UI components
│   └── lms/               # LMS-specific components
├── lib/
│   ├── supabase/          # Supabase client utilities
│   ├── utils/             # Helper functions
│   └── store/             # Zustand stores
├── types/                 # TypeScript definitions
└── supabase/
    └── migrations/        # Database migrations
```

## Key Features Implemented

✅ **Public Landing Page** - Hero, faculty grid, curriculum preview
✅ **Student Dashboard** - Progress tracking, sequential unlock logic
✅ **Course Player** - Lesson content, video/audio placeholders, worksheets
✅ **Assessment Engine** - Quizzes with 80% passing requirement
✅ **Final Exam** - File upload for case study analysis
✅ **Certification System** - PDF generation upon completion
✅ **Learning Journal** - Private reflection space per module

## Next Steps

1. **Customize Content:**
   - Add actual lesson HTML content
   - Upload video files (convert PPTs to video)
   - Add audio files for role plays
   - Create quiz questions for each module

2. **Enhance Features:**
   - Add video player component (e.g., Video.js or custom player)
   - Add audio player component
   - Implement peer circle/community features
   - Add email notifications
   - Create admin dashboard

3. **Styling:**
   - Customize color scheme further
   - Add animations
   - Improve mobile responsiveness

## Troubleshooting

**Issue: Cannot connect to Supabase**
- Check your `.env.local` file has correct credentials
- Verify Supabase project is active

**Issue: RLS policies blocking access**
- Check that user is authenticated
- Verify RLS policies in migration file were applied

**Issue: Storage uploads failing**
- Verify storage buckets exist
- Check bucket policies allow uploads
- Ensure user is authenticated

**Issue: Certificate generation fails**
- Check that `jspdf` and `html2canvas` are installed
- Verify storage bucket `certificates` exists and is public

## Support

For issues or questions, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com)
