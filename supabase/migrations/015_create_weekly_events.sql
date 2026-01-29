-- Create Weekly Events table
-- Based on HELP Foundations Training Weekly Calendar

CREATE TABLE IF NOT EXISTS public.weekly_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id), -- NULL for orientation week
  event_type TEXT NOT NULL, -- 'discussion_prompt', 'peer_circle', 'facilitator_session', 'wrap_up', 'quiz', 'assignment_due', 'info_session', 'orientation'
  scheduled_date TIMESTAMPTZ,
  title TEXT NOT NULL,
  description TEXT,
  meeting_link TEXT,
  recording_url TEXT,
  week_number INTEGER, -- Week number (0 for orientation, 1-9 for modules)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_weekly_events_module ON public.weekly_events(module_id);
CREATE INDEX IF NOT EXISTS idx_weekly_events_week ON public.weekly_events(week_number);
CREATE INDEX IF NOT EXISTS idx_weekly_events_type ON public.weekly_events(event_type);
CREATE INDEX IF NOT EXISTS idx_weekly_events_date ON public.weekly_events(scheduled_date);

-- Enable RLS
ALTER TABLE public.weekly_events ENABLE ROW LEVEL SECURITY;

-- Events are viewable by all authenticated users
CREATE POLICY "Weekly events are viewable by all authenticated users" 
ON public.weekly_events FOR SELECT 
USING (auth.role() = 'authenticated');

-- Add comment
COMMENT ON TABLE public.weekly_events IS 'Weekly calendar events for the training program';
