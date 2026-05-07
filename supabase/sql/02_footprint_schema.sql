-- EcoTrace Footprint Schema - Supabase
-- Tables: profiles, footprint_logs, green_actions with Row Level Security
-- Run in Supabase SQL Editor in order

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  household_size INTEGER DEFAULT 1 CHECK (household_size > 0),
  postal_code VARCHAR(10) NOT NULL,
  grid_intensity_zone VARCHAR(50) NOT NULL, -- e.g., 'NYUP', 'CAMX', 'MISO'
  unit_preference TEXT DEFAULT 'metric' CHECK (unit_preference IN ('metric', 'imperial')),
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read and update their own profile
CREATE POLICY "users_can_read_own_profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_can_insert_own_profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 2. FOOTPRINT_LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.footprint_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL CHECK (category IN ('home_energy', 'transport', 'food', 'goods')),
  calculated_kg_co2e FLOAT NOT NULL CHECK (calculated_kg_co2e >= 0),
  meta_data JSONB DEFAULT '{}', -- Stores breakdown: { "electricity_kwh": 450, "vehicle_miles": 120 }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_footprint_logs_user_id ON public.footprint_logs(user_id);
CREATE INDEX idx_footprint_logs_log_date ON public.footprint_logs(log_date);

ALTER TABLE public.footprint_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read and insert their own logs
CREATE POLICY "users_can_read_own_logs" ON public.footprint_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_logs" ON public.footprint_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_logs" ON public.footprint_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_logs" ON public.footprint_logs
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 3. GREEN_ACTIONS TABLE (Gamification Points)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.green_actions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('biked', 'vegan_meal', 'unplugged', 'donated_offset', 'joined_challenge', 'logged_activity')),
  points INTEGER NOT NULL DEFAULT 10 CHECK (points >= 0),
  description TEXT DEFAULT NULL, -- Optional metadata about the action
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_green_actions_user_id ON public.green_actions(user_id);
CREATE INDEX idx_green_actions_created_at ON public.green_actions(created_at);

ALTER TABLE public.green_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read and insert their own actions
CREATE POLICY "users_can_read_own_actions" ON public.green_actions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_actions" ON public.green_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 4. EGRID_POSTAL_ZONES TABLE (Reference lookup table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.egrid_postal_zones (
  id SERIAL PRIMARY KEY,
  postal_code_prefix VARCHAR(10) NOT NULL UNIQUE,
  grid_intensity_zone VARCHAR(50) NOT NULL, -- eGRID subregion code
  state VARCHAR(2),
  grid_intensity_kg_co2_per_kwh FLOAT DEFAULT 0.4, -- Default US average
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for fast lookups
CREATE INDEX idx_egrid_postal_prefix ON public.egrid_postal_zones(postal_code_prefix);

-- ============================================================================
-- 5. HELPER FUNCTION: Get emission factor for postal code
-- ============================================================================
CREATE OR REPLACE FUNCTION get_emission_factor(postal_code TEXT)
RETURNS FLOAT AS $$
DECLARE
  emission_factor FLOAT;
  zip_prefix TEXT;
BEGIN
  -- Try exact match first
  SELECT grid_intensity_kg_co2_per_kwh INTO emission_factor
  FROM public.egrid_postal_zones
  WHERE postal_code_prefix = postal_code
  LIMIT 1;

  -- If exact match fails, try first 5 digits (common US pattern)
  IF NOT FOUND THEN
    zip_prefix := SUBSTRING(postal_code FROM 1 FOR 5);
    SELECT grid_intensity_kg_co2_per_kwh INTO emission_factor
    FROM public.egrid_postal_zones
    WHERE postal_code_prefix = zip_prefix
    LIMIT 1;
  END IF;

  -- Default to US average if not found
  IF NOT FOUND THEN
    emission_factor := 0.4;
  END IF;

  RETURN emission_factor;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 6. HELPER FUNCTION: Calculate total weekly/monthly emissions
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_monthly_emissions(user_id UUID)
RETURNS TABLE(total_kg_co2e FLOAT, by_category JSONB) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(calculated_kg_co2e), 0)::FLOAT,
    JSONB_OBJECT_AGG(
      category,
      COALESCE(SUM(calculated_kg_co2e), 0)::FLOAT
    ) FILTER (WHERE category IS NOT NULL)
  FROM public.footprint_logs
  WHERE footprint_logs.user_id = get_user_monthly_emissions.user_id
    AND log_date >= CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. TRIGGER: Update profile updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- ============================================================================
-- 8. SEED DATA: Sample eGRID postal zones
-- ============================================================================
INSERT INTO public.egrid_postal_zones (postal_code_prefix, grid_intensity_zone, state, grid_intensity_kg_co2_per_kwh)
VALUES
  ('10', 'NYUP', 'NY', 0.22),     -- New York Upstate (hydroelectric)
  ('90', 'CAMX', 'CA', 0.28),     -- California Mixed (renewable)
  ('60', 'MISO', 'IL', 0.55),     -- Midwest (coal-heavy)
  ('75', 'MISO', 'TX', 0.48),     -- Texas MISO (mixed)
  ('98', 'NWPP', 'WA', 0.18),     -- Pacific Northwest (hydroelectric)
  ('80', 'WECC', 'CO', 0.42),     -- Rocky Mountain
  ('33', 'FRCC', 'FL', 0.52),     -- Florida (natural gas)
  ('02', 'NEISO', 'MA', 0.35),    -- New England
  ('30', 'SERC', 'GA', 0.60),     -- Southeast
  ('85', 'WECC', 'AZ', 0.40)      -- Arizona Southwest
ON CONFLICT (postal_code_prefix) DO NOTHING;
