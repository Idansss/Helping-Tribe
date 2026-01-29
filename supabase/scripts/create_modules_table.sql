-- Create the modules table if it doesn't exist (fix: "Could not find the table 'public.modules' in the schema cache")
-- Run this in Supabase Dashboard → SQL Editor, then click Run.

-- 1. Ensure UUID extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create modules table
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  week_number INTEGER NOT NULL UNIQUE CHECK (week_number >= 1 AND week_number <= 9),
  description TEXT,
  content TEXT,
  content_url TEXT,
  video_url TEXT,
  audio_url TEXT,
  worksheet_template JSONB,
  is_locked BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_modules_updated_at ON public.modules;
CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable RLS
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- 5. Policies: learners can read, authenticated users can insert/update (for Admin)
DROP POLICY IF EXISTS "Modules are viewable by all authenticated users" ON public.modules;
CREATE POLICY "Modules are viewable by all authenticated users"
  ON public.modules FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert modules" ON public.modules;
CREATE POLICY "Authenticated users can insert modules"
  ON public.modules FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update modules" ON public.modules;
CREATE POLICY "Authenticated users can update modules"
  ON public.modules FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Done. Refresh the schema cache: Supabase Dashboard → Settings → API → "Reload schema cache" or re-open the SQL Editor.
