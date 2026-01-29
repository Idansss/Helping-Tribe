-- Align profiles with the Student Profile form and create_profiles_table.sql.
-- Use when public.profiles already exists (e.g. from 001_initial_schema) and you
-- need email, phone_number, whatsapp_number and INSERT policy.

-- Add columns if missing (no-op if already present)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Ensure INSERT policy exists (drop first to avoid duplicate policy errors)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
