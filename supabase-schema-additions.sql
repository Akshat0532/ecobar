-- Add new tables for Offset Marketplace, Community Challenges, and Resource Library
-- Append to existing supabase-schema.sql

-- ==============================================================================
-- OFFSET MARKETPLACE TABLES
-- ==============================================================================

CREATE TABLE offset_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('renewable_energy', 'reforestation', 'methane', 'water', 'soil')),
  location TEXT NOT NULL,
  verification_standard TEXT NOT NULL CHECK (verification_standard IN ('Gold Standard', 'Verra', 'Plan Vivo')),
  donation_url TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  co2_reduction_potential INT, -- kg CO2e per unit
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_offsets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES offset_projects(id),
  amount_donated DECIMAL, -- USD amount (optional, for tracking)
  estimated_offset_kg DECIMAL NOT NULL, -- psychological offset amount
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for offset tables
ALTER TABLE offset_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_offsets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view offset projects" ON offset_projects
  FOR SELECT USING (true);

CREATE POLICY "Users can view own offsets" ON user_offsets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own offsets" ON user_offsets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- COMMUNITY CHALLENGES TABLES
-- ==============================================================================

CREATE TABLE challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('transport', 'diet', 'energy', 'goods')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  team_goal_unit TEXT NOT NULL, -- "meals", "miles", "kWh", etc
  team_goal_value INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  baseline_last_month DECIMAL, -- their emissions for category last month
  current_progress DECIMAL DEFAULT 0,
  has_reduced BOOLEAN DEFAULT NULL,
  UNIQUE(user_id, challenge_id)
);

CREATE TABLE challenge_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  activity_count INT DEFAULT 1, -- e.g., "1 meatless meal", "5 miles biked"
  activity_date DATE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for challenge tables
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges" ON challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their challenge enrollments" ON user_challenges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join challenges" ON user_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their challenge activity" ON challenge_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can log challenge activity" ON challenge_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- RESOURCE LIBRARY TABLES
-- ==============================================================================

CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL, -- Markdown/MDX content
  author TEXT DEFAULT 'EcoTrace Team',
  category TEXT NOT NULL CHECK (category IN ('tips', 'science', 'guides', 'tools')),
  featured_image_url TEXT,
  read_time_minutes INT,
  is_published BOOLEAN DEFAULT FALSE,
  seo_keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for blog
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blog posts" ON blog_posts
  FOR SELECT USING (is_published = true);
