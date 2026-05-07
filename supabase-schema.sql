-- EcoTrace Supabase Schema
-- Run these SQL commands in your Supabase SQL editor

-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Profiles table
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  household_size INTEGER DEFAULT 1,
  zip_code TEXT,
  reasons TEXT[] DEFAULT '{}',
  unit_preference TEXT DEFAULT 'metric' CHECK (unit_preference IN ('metric', 'imperial')),
  distance_unit TEXT DEFAULT 'km' CHECK (distance_unit IN ('km', 'mi')),
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Household members table
CREATE TABLE household_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carbon logs table
CREATE TABLE carbon_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  commute_mode TEXT NOT NULL,
  weekly_miles DECIMAL NOT NULL,
  home_energy TEXT NOT NULL,
  monthly_energy_usage DECIMAL NOT NULL,
  diet TEXT NOT NULL,
  estimate DECIMAL NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quick logs table (for micro-updates)
CREATE TABLE quick_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emission DECIMAL NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('transport', 'diet', 'energy', 'goods', 'custom')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Household members policies
CREATE POLICY "Users can view own household members" ON household_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own household members" ON household_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own household members" ON household_members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own household members" ON household_members
  FOR DELETE USING (auth.uid() = user_id);

-- Carbon logs policies
CREATE POLICY "Users can view own carbon logs" ON carbon_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own carbon logs" ON carbon_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Quick logs policies
CREATE POLICY "Users can view own quick logs" ON quick_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quick logs" ON quick_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
