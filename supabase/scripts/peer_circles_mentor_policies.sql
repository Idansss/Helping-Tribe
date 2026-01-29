-- Allow circle creators (mentors) to add and remove learners from their peer circles.
-- Run in Supabase Dashboard → SQL Editor after 019_create_peer_circles.sql (or equivalent).
-- Existing policy "Users can join peer circles" still lets learners self-join; these add mentor control.

-- Circle creators can add any user to their circle (so mentors can assign learners)
DROP POLICY IF EXISTS "Circle creators can add members" ON public.peer_circle_members;
CREATE POLICY "Circle creators can add members"
  ON public.peer_circle_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.peer_circles
      WHERE id = circle_id AND created_by = auth.uid()
    )
  );

-- Circle creators can remove any member from their circle
DROP POLICY IF EXISTS "Circle creators can remove members" ON public.peer_circle_members;
CREATE POLICY "Circle creators can remove members"
  ON public.peer_circle_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.peer_circles
      WHERE id = circle_id AND created_by = auth.uid()
    )
  );
