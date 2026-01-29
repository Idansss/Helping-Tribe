-- Create Resources table for Resource Directory
-- Based on HELP_Foundations_Resource_Directory document

CREATE TABLE IF NOT EXISTS public.resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT NOT NULL, -- 'emergency', 'mental_health', 'hospital', 'ngo', 'faith_based', 'international'
  title TEXT NOT NULL,
  description TEXT,
  contact_info JSONB, -- {phone: string, email: string, address: string}
  website_url TEXT,
  location TEXT, -- For Nigeria-specific resources
  tags TEXT[],
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for category for faster filtering
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_tags ON public.resources USING GIN(tags);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Resources are viewable by all authenticated users
CREATE POLICY "Resources are viewable by all authenticated users" 
ON public.resources FOR SELECT 
USING (auth.role() = 'authenticated');

-- Add comment
COMMENT ON TABLE public.resources IS 'Resource directory for helpers in Nigeria and low-resource contexts';
