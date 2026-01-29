-- =============================================================================
-- PROFILES TABLE SETUP
-- Run this in Supabase Dashboard > SQL Editor when the profiles table does NOT exist.
-- If you get "relation public.profiles already exists", use the migration
-- 028_align_profiles_schema.sql instead, or run Step 2 (Reload Schema Cache).
-- =============================================================================

-- Step 1: Create the profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone_number TEXT,
  whatsapp_number TEXT,
  role TEXT DEFAULT 'student',
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT username_length CHECK (full_name IS NULL OR char_length(full_name) >= 3)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- Step 3 (Recommended): Auto-create profile on signup
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists (e.g. from a previous run), then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
