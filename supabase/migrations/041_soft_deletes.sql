-- Soft delete support for applicants and students.
-- Instead of hard deleting, set deleted_at to mark records as removed.
-- Hard deletes are prevented via triggers; use the helper function to restore.

ALTER TABLE public.applicants
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Indexes to efficiently filter out deleted records
CREATE INDEX IF NOT EXISTS idx_applicants_deleted_at ON public.applicants (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_students_deleted_at ON public.students (deleted_at) WHERE deleted_at IS NULL;

-- Helper: soft-delete an applicant (and their linked student)
CREATE OR REPLACE FUNCTION public.soft_delete_applicant(p_applicant_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.applicants SET deleted_at = NOW() WHERE id = p_applicant_id AND deleted_at IS NULL;
  UPDATE public.students SET deleted_at = NOW() WHERE applicant_id = p_applicant_id AND deleted_at IS NULL;
END;
$$;

-- Helper: restore a soft-deleted applicant (and their linked student)
CREATE OR REPLACE FUNCTION public.restore_applicant(p_applicant_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.applicants SET deleted_at = NULL WHERE id = p_applicant_id;
  UPDATE public.students SET deleted_at = NULL WHERE applicant_id = p_applicant_id;
END;
$$;
