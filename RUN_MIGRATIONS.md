# 🚨 URGENT: Run Database Migrations

Your application is showing errors because the database tables don't exist yet. You need to run the migrations in Supabase.

## Quick Fix (5 minutes)

1. **Go to your Supabase Dashboard**: https://app.supabase.com
2. **Select your project** (the one with URL matching your `.env.local`)
3. **Open SQL Editor** (left sidebar)
4. **Click "New Query"**
5. **Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`**
6. **Click "Run"** (or press Ctrl+Enter)
7. **Wait for success message** ✅

8. **Repeat for each migration file in order:**
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

## Alternative: Run All at Once

If you want to run everything in one go, I can create a combined migration file. But running them one by one is safer and lets you see which one fails if there's an issue.

## After Running Migrations

1. **Refresh your browser** - The errors should disappear
2. **Check Table Editor** in Supabase - You should see all the tables
3. **Verify** - Go to `localhost:3000/dashboard` - It should load without errors

## Troubleshooting

**Error: "relation already exists"**
- Some tables might already exist. This is OK - the migrations use `IF NOT EXISTS` or `ON CONFLICT DO NOTHING`
- Just continue with the next migration

**Error: "permission denied"**
- Make sure you're running as the database owner
- Check that you're in the correct Supabase project

**Still seeing errors after migrations?**
- Clear your browser cache
- Restart the dev server: `Ctrl+C` then `npm run dev`
- Check that your `.env.local` has the correct Supabase URL and key
