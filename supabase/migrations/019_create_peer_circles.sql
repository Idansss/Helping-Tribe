-- Create Peer Learning Circles tables
-- Based on HELP Foundations Training - Peer Learning Circles feature

-- Peer Circles table
CREATE TABLE IF NOT EXISTS public.peer_circles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  module_id UUID REFERENCES public.modules(id), -- NULL for general circles
  max_members INTEGER DEFAULT 6,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Peer Circle Members table
CREATE TABLE IF NOT EXISTS public.peer_circle_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  circle_id UUID REFERENCES public.peer_circles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'member', 'facilitator', 'leader'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(circle_id, user_id) -- One membership per user per circle
);

-- Peer Circle Sessions table (for scheduled meetings)
CREATE TABLE IF NOT EXISTS public.peer_circle_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  circle_id UUID REFERENCES public.peer_circles(id) ON DELETE CASCADE,
  session_date TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  agenda JSONB, -- Structured agenda items
  meeting_link TEXT,
  recording_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Peer Circle Case Presentations table
CREATE TABLE IF NOT EXISTS public.peer_circle_presentations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  circle_id UUID REFERENCES public.peer_circles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.peer_circle_sessions(id) ON DELETE SET NULL,
  presenter_id UUID REFERENCES public.profiles(id),
  case_study_id UUID REFERENCES public.case_studies(id),
  presentation_text TEXT,
  presentation_file_url TEXT,
  feedback JSONB, -- Feedback from peers: [{user_id, feedback_text, created_at}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_peer_circles_module ON public.peer_circles(module_id);
CREATE INDEX IF NOT EXISTS idx_peer_circles_active ON public.peer_circles(is_active);
CREATE INDEX IF NOT EXISTS idx_peer_circle_members_circle ON public.peer_circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_peer_circle_members_user ON public.peer_circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_peer_circle_sessions_circle ON public.peer_circle_sessions(circle_id);
CREATE INDEX IF NOT EXISTS idx_peer_circle_sessions_date ON public.peer_circle_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_peer_circle_presentations_circle ON public.peer_circle_presentations(circle_id);
CREATE INDEX IF NOT EXISTS idx_peer_circle_presentations_presenter ON public.peer_circle_presentations(presenter_id);

-- Enable RLS
ALTER TABLE public.peer_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_circle_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_circle_presentations ENABLE ROW LEVEL SECURITY;

-- Peer circles are viewable by all authenticated users
CREATE POLICY "Peer circles are viewable by all authenticated users" 
ON public.peer_circles FOR SELECT 
USING (auth.role() = 'authenticated');

-- Users can create peer circles
CREATE POLICY "Users can create peer circles" 
ON public.peer_circles FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Users can update circles they created
CREATE POLICY "Users can update circles they created" 
ON public.peer_circles FOR UPDATE 
USING (auth.uid() = created_by);

-- Circle members are viewable by authenticated users
CREATE POLICY "Circle members are viewable by authenticated users" 
ON public.peer_circle_members FOR SELECT 
USING (auth.role() = 'authenticated');

-- Users can join circles (insert themselves)
CREATE POLICY "Users can join peer circles" 
ON public.peer_circle_members FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can leave circles (delete their own membership)
CREATE POLICY "Users can leave peer circles" 
ON public.peer_circle_members FOR DELETE 
USING (auth.uid() = user_id);

-- Sessions are viewable by circle members
CREATE POLICY "Sessions are viewable by circle members" 
ON public.peer_circle_sessions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.peer_circle_members 
    WHERE circle_id = peer_circle_sessions.circle_id 
    AND user_id = auth.uid()
  )
);

-- Circle members can create sessions
CREATE POLICY "Circle members can create sessions" 
ON public.peer_circle_sessions FOR INSERT 
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.peer_circle_members 
    WHERE circle_id = peer_circle_sessions.circle_id 
    AND user_id = auth.uid()
  )
);

-- Circle members can update sessions
CREATE POLICY "Circle members can update sessions" 
ON public.peer_circle_sessions FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.peer_circle_members 
    WHERE circle_id = peer_circle_sessions.circle_id 
    AND user_id = auth.uid()
  )
);

-- Presentations are viewable by circle members
CREATE POLICY "Presentations are viewable by circle members" 
ON public.peer_circle_presentations FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.peer_circle_members 
    WHERE circle_id = peer_circle_presentations.circle_id 
    AND user_id = auth.uid()
  )
);

-- Circle members can create presentations
CREATE POLICY "Circle members can create presentations" 
ON public.peer_circle_presentations FOR INSERT 
WITH CHECK (
  auth.uid() = presenter_id AND
  EXISTS (
    SELECT 1 FROM public.peer_circle_members 
    WHERE circle_id = peer_circle_presentations.circle_id 
    AND user_id = auth.uid()
  )
);

-- Presenters can update their own presentations
CREATE POLICY "Presenters can update own presentations" 
ON public.peer_circle_presentations FOR UPDATE 
USING (auth.uid() = presenter_id);

-- Add comments
COMMENT ON TABLE public.peer_circles IS 'Peer learning circles for collaborative learning';
COMMENT ON TABLE public.peer_circle_members IS 'Membership in peer learning circles';
COMMENT ON TABLE public.peer_circle_sessions IS 'Scheduled sessions for peer learning circles';
COMMENT ON TABLE public.peer_circle_presentations IS 'Case presentations within peer circles';
