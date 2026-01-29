# 🗄️ DATABASE MIGRATIONS FOR NEW FEATURES

## Required Supabase Changes

### 1. **Storage Buckets** (Already Created)
✅ These should already exist from previous setup:
- `profile-photos` - For user avatars
- `voice-notes` - For audio reflections

### 2. **New Tables Needed**

#### A. `peer_reviews` Table
```sql
CREATE TABLE peer_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES assignment_submissions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  strengths TEXT NOT NULL,
  improvements TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate reviews
  UNIQUE(submission_id, reviewer_id)
);

-- Index for faster lookups
CREATE INDEX idx_peer_reviews_submission ON peer_reviews(submission_id);
CREATE INDEX idx_peer_reviews_reviewer ON peer_reviews(reviewer_id);

-- RLS Policies
ALTER TABLE peer_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reviews on submissions"
  ON peer_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON peer_reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);
```

#### B. `ai_client_sessions` Table
```sql
CREATE TABLE ai_client_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  persona_name VARCHAR(255),
  conversation_history JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user sessions
CREATE INDEX idx_ai_sessions_user ON ai_client_sessions(user_id);

-- RLS Policies
ALTER TABLE ai_client_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON ai_client_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON ai_client_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON ai_client_sessions FOR UPDATE
  USING (auth.uid() = user_id);
```

#### C. `user_activity` Table (For Analytics)
```sql
CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_user_activity_user ON user_activity(user_id);
CREATE INDEX idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX idx_user_activity_created ON user_activity(created_at DESC);

-- RLS Policies
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all activity"
  ON user_activity FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "Users can view their own activity"
  ON user_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity"
  ON user_activity FOR INSERT
  WITH CHECK (true);
```

#### D. Update `profiles` Table
```sql
-- Add role column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student';

-- Add avatar_url if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update RLS to allow profile photo uploads
CREATE POLICY "Users can update their own avatar"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### 3. **Storage Bucket Policies**

#### Profile Photos Bucket
```sql
-- Allow users to upload their own photos
CREATE POLICY "Users can upload profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own photos
CREATE POLICY "Users can update their profile photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access
CREATE POLICY "Public can view profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');
```

#### Voice Notes Bucket
```sql
-- Allow users to upload voice notes
CREATE POLICY "Users can upload voice notes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'voice-notes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Only owner can access voice notes (privacy)
CREATE POLICY "Users can access their own voice notes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'voice-notes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 🔧 MIGRATION SCRIPT (All-in-One)

Copy and paste this into Supabase SQL Editor:

```sql
-- ================================
-- NEW FEATURES DATABASE MIGRATION
-- Run this script in Supabase SQL Editor
-- ================================

-- 1. Peer Reviews Table
CREATE TABLE IF NOT EXISTS peer_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  strengths TEXT NOT NULL,
  improvements TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(submission_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_peer_reviews_submission ON peer_reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_peer_reviews_reviewer ON peer_reviews(reviewer_id);

ALTER TABLE peer_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view reviews" ON peer_reviews;
CREATE POLICY "Users can view reviews" ON peer_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON peer_reviews;
CREATE POLICY "Users can create reviews" ON peer_reviews FOR INSERT 
WITH CHECK (auth.uid() = reviewer_id);

-- 2. AI Client Sessions Table
CREATE TABLE IF NOT EXISTS ai_client_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  persona_name VARCHAR(255),
  conversation_history JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_sessions_user ON ai_client_sessions(user_id);

ALTER TABLE ai_client_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own sessions" ON ai_client_sessions;
CREATE POLICY "Users can view their own sessions" ON ai_client_sessions FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create sessions" ON ai_client_sessions;
CREATE POLICY "Users can create sessions" ON ai_client_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update sessions" ON ai_client_sessions;
CREATE POLICY "Users can update sessions" ON ai_client_sessions FOR UPDATE 
USING (auth.uid() = user_id);

-- 3. User Activity Table (Analytics)
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity(created_at DESC);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view activity" ON user_activity;
CREATE POLICY "Admins can view activity" ON user_activity FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'instructor')
  )
);

DROP POLICY IF EXISTS "Users can view own activity" ON user_activity;
CREATE POLICY "Users can view own activity" ON user_activity FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert activity" ON user_activity;
CREATE POLICY "System can insert activity" ON user_activity FOR INSERT 
WITH CHECK (true);

-- 4. Update Profiles Table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 5. Create storage buckets (if they don't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('profile-photos', 'profile-photos', true),
  ('voice-notes', 'voice-notes', false)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage policies for profile-photos
DROP POLICY IF EXISTS "Users upload profile photos" ON storage.objects;
CREATE POLICY "Users upload profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users update profile photos" ON storage.objects;
CREATE POLICY "Users update profile photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Public view profile photos" ON storage.objects;
CREATE POLICY "Public view profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- 7. Storage policies for voice-notes
DROP POLICY IF EXISTS "Users upload voice notes" ON storage.objects;
CREATE POLICY "Users upload voice notes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'voice-notes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users view own voice notes" ON storage.objects;
CREATE POLICY "Users view own voice notes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'voice-notes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Success message
SELECT 'Migration completed successfully!' as message;
```

---

## 🚀 POST-MIGRATION VERIFICATION

After running the migration, verify:

```sql
-- 1. Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('peer_reviews', 'ai_client_sessions', 'user_activity');

-- 2. Check storage buckets
SELECT * FROM storage.buckets 
WHERE id IN ('profile-photos', 'voice-notes');

-- 3. Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('peer_reviews', 'ai_client_sessions', 'user_activity');

-- 4. Check policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('peer_reviews', 'ai_client_sessions', 'user_activity');
```

---

## ⚠️ IMPORTANT NOTES

1. **Backup First** - Always backup your database before running migrations
2. **Test Environment** - Run on staging/development first
3. **Check Existing Data** - Verify no conflicts with existing tables
4. **Foreign Keys** - Ensure `assignment_submissions` table exists for peer_reviews
5. **OpenAI API Key** - Add to `.env.local` for AI client feature

---

## 🔑 ENVIRONMENT VARIABLES NEEDED

Add to `.env.local`:

```bash
# OpenAI for AI Practice Client
OPENAI_API_KEY=your_openai_api_key_here

# Twilio or WhatsApp Business API (for notifications)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

---

**Status:** Ready to execute ✅  
**Estimated Time:** 2-3 minutes to run  
**Risk Level:** Low (uses IF NOT EXISTS checks)
