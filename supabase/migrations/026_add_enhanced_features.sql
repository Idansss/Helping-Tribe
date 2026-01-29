-- Enhanced Features Migration
-- Adds tables for Voice Notes, AI Client, Badges, Backpack, and WhatsApp

-- 1. Voice Notes (Audio Journaling)
CREATE TABLE IF NOT EXISTS voice_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  title TEXT,
  audio_url TEXT NOT NULL, -- Supabase Storage URL
  duration_seconds INTEGER,
  transcript TEXT, -- Optional: AI-generated transcript
  reflection_type TEXT DEFAULT 'module_reflection', -- 'module_reflection', 'free_form'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voice_notes_user_id ON voice_notes(user_id);
CREATE INDEX idx_voice_notes_module_id ON voice_notes(module_id);

-- 2. AI Simulated Client Sessions
CREATE TABLE IF NOT EXISTS ai_client_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  case_study_id UUID REFERENCES case_studies(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL, -- 'Chika', 'Amina', 'Tunde', etc.
  system_prompt TEXT NOT NULL, -- AI role-play instructions
  conversation_history JSONB DEFAULT '[]', -- Array of {role: 'user'|'assistant', content: string}
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_client_sessions_user_id ON ai_client_sessions(user_id);
CREATE INDEX idx_ai_client_sessions_active ON ai_client_sessions(user_id, is_active) WHERE is_active = true;

-- 3. User Badges (Gamification)
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_key TEXT UNIQUE NOT NULL, -- 'the_listener', 'the_consistent', 'the_scholar'
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT, -- Lucide icon name
  color TEXT, -- Badge color
  criteria JSONB, -- Conditions to earn badge
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);

-- 4. Backpack (Resource Bookmarks)
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- 'lesson', 'resource', 'case_study', 'discussion', 'assignment'
  resource_id UUID NOT NULL, -- ID of the resource (flexible, not foreign key)
  title TEXT, -- Cached title for quick display
  notes TEXT, -- User's personal notes about this bookmark
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_type, resource_id)
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_resource ON bookmarks(resource_type, resource_id);

-- 5. WhatsApp Preferences
CREATE TABLE IF NOT EXISTS whatsapp_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  phone_number TEXT, -- WhatsApp number (E.164 format)
  is_enabled BOOLEAN DEFAULT false,
  receive_quiz_scores BOOLEAN DEFAULT false,
  receive_study_reminders BOOLEAN DEFAULT false,
  receive_assignment_reminders BOOLEAN DEFAULT false,
  receive_weekly_digest BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ, -- When phone number was verified
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_preferences_user_id ON whatsapp_preferences(user_id);
CREATE INDEX idx_whatsapp_preferences_enabled ON whatsapp_preferences(user_id) WHERE is_enabled = true;

-- 6. User Activity Tracking (for badges)
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'login', 'comment', 'quiz_complete', 'assignment_submit'
  activity_data JSONB, -- Additional context
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_type ON user_activity(user_id, activity_type);
CREATE INDEX idx_user_activity_date ON user_activity(user_id, created_at);

-- 7. Grounding Tool Usage (Analytics)
CREATE TABLE IF NOT EXISTS grounding_tool_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL, -- 'breathing', '54321', 'safe_place'
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_grounding_usage_user_id ON grounding_tool_usage(user_id);

-- Seed default badges
INSERT INTO badges (badge_key, name, description, icon_name, color, criteria) VALUES
  ('the_listener', 'The Listener', 'Posted 5 thoughtful comments in the forum', 'MessageCircle', 'blue', '{"type": "forum_comments", "count": 5}'),
  ('the_consistent', 'The Consistent', 'Logged in 7 days in a row', 'Calendar', 'green', '{"type": "consecutive_logins", "days": 7}'),
  ('the_scholar', 'The Scholar', 'Scored 100% on a quiz', 'GraduationCap', 'gold', '{"type": "perfect_quiz", "score": 100}'),
  ('the_helper', 'The Helper', 'Helped 3 peers in discussions', 'HeartHandshake', 'pink', '{"type": "helpful_responses", "count": 3}'),
  ('the_reflective', 'The Reflective', 'Completed all 9 module reflections', 'BookOpen', 'purple', '{"type": "journal_entries", "count": 9}'),
  ('the_voice', 'The Voice', 'Recorded 5 voice note reflections', 'Mic', 'orange', '{"type": "voice_notes", "count": 5}'),
  ('the_practitioner', 'The Practitioner', 'Completed 10 AI client practice sessions', 'Bot', 'indigo', '{"type": "ai_sessions", "count": 10}'),
  ('the_complete', 'The Complete', 'Finished all 9 modules', 'CheckCircle2', 'emerald', '{"type": "modules_completed", "count": 9}')
ON CONFLICT (badge_key) DO NOTHING;

-- RLS Policies
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_client_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE grounding_tool_usage ENABLE ROW LEVEL SECURITY;

-- Voice Notes: Users can only see their own
CREATE POLICY "Users can view own voice notes" ON voice_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voice notes" ON voice_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own voice notes" ON voice_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own voice notes" ON voice_notes
  FOR DELETE USING (auth.uid() = user_id);

-- AI Client Sessions: Users can only see their own
CREATE POLICY "Users can view own AI sessions" ON ai_client_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI sessions" ON ai_client_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI sessions" ON ai_client_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- User Badges: Users can view all badges, but only their own earned badges
CREATE POLICY "Anyone can view badge definitions" ON badges
  FOR SELECT USING (true);

CREATE POLICY "Users can view own earned badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

-- Bookmarks: Users can only see their own
CREATE POLICY "Users can manage own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- WhatsApp Preferences: Users can only see their own
CREATE POLICY "Users can manage own WhatsApp preferences" ON whatsapp_preferences
  FOR ALL USING (auth.uid() = user_id);

-- User Activity: Users can only see their own
CREATE POLICY "Users can view own activity" ON user_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert user activity" ON user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grounding Tool Usage: Users can only see their own
CREATE POLICY "Users can view own grounding usage" ON grounding_tool_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grounding usage" ON grounding_tool_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);
