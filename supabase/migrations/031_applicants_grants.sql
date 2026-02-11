-- Grants needed for public application submissions.
-- Note: RLS still controls which rows can be read/updated.

-- Enum type usage (required to insert into a table that uses this enum)
GRANT USAGE ON TYPE public.applicant_status TO anon, authenticated;

-- Public can submit applications (insert only)
GRANT INSERT ON TABLE public.applicants TO anon, authenticated;

-- Staff views use authenticated + RLS policies (no access without RLS match)
GRANT SELECT, UPDATE, DELETE ON TABLE public.applicants TO authenticated;

