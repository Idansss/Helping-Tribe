# Supabase Setup Instructions

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in your project details:
   - Name: Helping Tribe LMS (or your preferred name)
   - Database Password: Choose a strong password (save this!)
   - Region: Choose closest to your users
5. Wait for the project to be created (takes 1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

3. Update your `.env.local` file with these values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_actual_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
   ```

## Step 3: Run Database Migrations

You need to run the migration files in order in the Supabase SQL Editor:

### Migration 1: Initial Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open the file: `supabase/migrations/001_initial_schema.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for success message

### Migration 2: Storage Buckets
1. Still in SQL Editor, click **New Query**
2. Open the file: `supabase/migrations/002_create_storage_buckets.sql`
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **Run**
6. Verify buckets were created:
   - Go to **Storage** in the sidebar
   - You should see `certificates` (public) and `final-exams` (private) buckets

### Migration 3: Seed Data (Optional but Recommended)
1. In SQL Editor, click **New Query**
2. Open the file: `supabase/migrations/003_seed_data.sql`
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **Run**
6. This will create:
   - 9 modules (weeks 1-9)
   - 3 sample faculty members
   - 1 quiz for Module 1 with 10 sample questions
   - 3 sample lessons for Module 1

## Step 4: Verify Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - profiles
   - cohorts
   - modules
   - lessons
   - quizzes
   - quiz_questions
   - faculty
   - (and others)

3. Check the **modules** table - you should see 9 modules
4. Check the **faculty** table - you should see 3 faculty members

## Step 5: Create Your First User (Optional)

To test the application, you can create a test user:

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click **Add User** → **Create New User**
3. Enter an email and password
4. After creating, go to **Table Editor** → **profiles**
5. Find your user and update:
   - `role`: 'student'
   - `full_name`: Your name

## Troubleshooting

**Migration errors:**
- If you see "relation already exists" errors, the migration may have partially run. You can either:
  - Drop the existing tables and re-run, OR
  - Skip the conflicting parts and continue

**Storage bucket errors:**
- If buckets don't appear, check the SQL Editor for error messages
- You can manually create buckets in **Storage** → **New Bucket**

**RLS Policy errors:**
- If you see RLS-related errors, make sure you're running migrations as the database owner
- Check that RLS is enabled on tables in **Table Editor** → **Policies**

## Next Steps

After completing these steps:
1. Make sure `.env.local` has your actual Supabase credentials
2. Run `npm run dev` to start the development server
3. Visit `http://localhost:3000` to see your application
