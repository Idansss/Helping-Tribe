-- Allow file uploads to the "final-exams" bucket (module notes, assignments, etc.).
-- Run in Supabase Dashboard → SQL Editor if file upload fails with 400.
--
-- First create the bucket in Supabase Dashboard → Storage → New bucket:
--   Name: final-exams
--   Public: Yes (so students can open note links)
-- Then run this script to add policies.

-- 1. Allow authenticated users to upload
DROP POLICY IF EXISTS "Authenticated can upload to final-exams" ON storage.objects;
CREATE POLICY "Authenticated can upload to final-exams"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'final-exams');

-- 2. Allow public read (so students can open note links)
DROP POLICY IF EXISTS "Public read final-exams" ON storage.objects;
CREATE POLICY "Public read final-exams"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'final-exams');
