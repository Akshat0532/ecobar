import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Only create a real client if credentials are configured
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient("https://placeholder.supabase.co", "placeholder-key");

// ============================================================================
// TYPES
// ============================================================================

export interface Profile {
  id: string;
  household_size: number;
  postal_code: string;
  grid_intensity_zone: string;
  unit_preference: "metric" | "imperial";
  currency: "USD" | "EUR" | "GBP";
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface FootprintLog {
  id: number;
  user_id: string;
  log_date: string;
  category: "home_energy" | "transport" | "food" | "goods";
  calculated_kg_co2e: number;
  meta_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type ActionType =
  | "biked"
  | "vegan_meal"
  | "unplugged"
  | "donated_offset"
  | "joined_challenge"
  | "logged_activity";

export interface GreenAction {
  id: number;
  user_id: string;
  action_type: ActionType;
  points: number;
  description?: string;
  created_at: string;
}

export interface EmissionFactorResponse {
  postal_code: string;
  grid_intensity_zone: string;
  emission_factor_kg_co2_per_kwh: number;
  state?: string;
  confidence: "exact" | "prefix_match" | "default";
}

// ============================================================================
// PROFILE FUNCTIONS
// ============================================================================

/**
 * Get user's profile
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data as Profile;
}

/**
 * Create or update user profile
 */
export async function upsertProfile(
  userId: string,
  profile: Partial<Profile>
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error upserting profile:", error);
    return null;
  }

  return data as Profile;
}

// ============================================================================
// FOOTPRINT LOG FUNCTIONS
// ============================================================================

/**
 * Log a carbon footprint entry
 */
export async function logFootprint(
  userId: string,
  category: FootprintLog["category"],
  co2e: number,
  metadata: Record<string, unknown> = {}
): Promise<FootprintLog | null> {
  const { data, error } = await supabase
    .from("footprint_logs")
    .insert({
      user_id: userId,
      category,
      calculated_kg_co2e: co2e,
      meta_data: metadata,
      log_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    })
    .select()
    .single();

  if (error) {
    console.error("Error logging footprint:", error);
    return null;
  }

  return data as FootprintLog;
}

/**
 * Get user's footprint logs (with optional date range filter)
 */
export async function getUserFootprintLogs(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<FootprintLog[]> {
  let query = supabase
    .from("footprint_logs")
    .select("*")
    .eq("user_id", userId)
    .order("log_date", { ascending: false });

  if (startDate) {
    query = query.gte("log_date", startDate);
  }

  if (endDate) {
    query = query.lte("log_date", endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching footprint logs:", error);
    return [];
  }

  return (data || []) as FootprintLog[];
}

/**
 * Get summary of emissions by category for a time period
 */
export async function getEmissionsSummary(userId: string): Promise<{
  total_kg_co2e: number;
  by_category: Record<string, number>;
}> {
  const { data, error } = await supabase.rpc("get_user_monthly_emissions", {
    user_id: userId,
  });

  if (error) {
    console.error("Error fetching emissions summary:", error);
    return { total_kg_co2e: 0, by_category: {} };
  }

  return data;
}

// ============================================================================
// GREEN ACTIONS FUNCTIONS
// ============================================================================

/**
 * Record a green action (gamification)
 */
export async function recordGreenAction(
  userId: string,
  actionType: ActionType,
  points: number = 10,
  description?: string
): Promise<GreenAction | null> {
  const { data, error } = await supabase
    .from("green_actions")
    .insert({
      user_id: userId,
      action_type: actionType,
      points,
      description,
    })
    .select()
    .single();

  if (error) {
    console.error("Error recording green action:", error);
    return null;
  }

  return data as GreenAction;
}

/**
 * Get total points for user
 */
export async function getUserPoints(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("green_actions")
    .select("points")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user points:", error);
    return 0;
  }

  return (data || []).reduce((sum, row) => sum + (row.points || 0), 0);
}

/**
 * Get user's recent green actions
 */
export async function getUserGreenActions(
  userId: string,
  limit: number = 10
): Promise<GreenAction[]> {
  const { data, error } = await supabase
    .from("green_actions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching green actions:", error);
    return [];
  }

  return (data || []) as GreenAction[];
}

// ============================================================================
// EMISSION FACTOR CALCULATION
// ============================================================================

/**
 * Calculate emission factor based on postal code
 * Calls the Edge Function
 */
export async function calculateEmissionFactor(
  postalCode: string
): Promise<EmissionFactorResponse | null> {
  try {
    const functionUrl = `${supabaseUrl}/functions/v1/calculate-emission-factor`;

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ postal_code: postalCode }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as EmissionFactorResponse;
    return data;
  } catch (error) {
    console.error("Error calculating emission factor:", error);
    return null;
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Batch log multiple footprint entries
 */
export async function batchLogFootprints(
  userId: string,
  logs: Array<{
    category: FootprintLog["category"];
    co2e: number;
    date: string;
    metadata?: Record<string, unknown>;
  }>
): Promise<FootprintLog[]> {
  const entries = logs.map((log) => ({
    user_id: userId,
    category: log.category,
    calculated_kg_co2e: log.co2e,
    log_date: log.date,
    meta_data: log.metadata || {},
  }));

  const { data, error } = await supabase
    .from("footprint_logs")
    .insert(entries)
    .select();

  if (error) {
    console.error("Error batch logging footprints:", error);
    return [];
  }

  return (data || []) as FootprintLog[];
}
