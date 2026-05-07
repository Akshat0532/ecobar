import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface PostalCodeLookupRequest {
  postal_code: string;
}

interface EmissionFactorResponse {
  postal_code: string;
  grid_intensity_zone: string;
  emission_factor_kg_co2_per_kwh: number;
  state?: string;
  confidence: "exact" | "prefix_match" | "default";
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Edge Function: Calculate emission factor based on postal code
 *
 * Endpoint: POST /functions/v1/calculate-emission-factor
 *
 * Request body:
 * {
 *   "postal_code": "10001"
 * }
 *
 * Response:
 * {
 *   "postal_code": "10001",
 *   "grid_intensity_zone": "NYUP",
 *   "emission_factor_kg_co2_per_kwh": 0.22,
 *   "state": "NY",
 *   "confidence": "exact"
 * }
 */
Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Parse request body
    const body = (await req.json()) as PostalCodeLookupRequest;
    const { postal_code } = body;

    // Validate postal code
    if (!postal_code || typeof postal_code !== "string") {
      return new Response(
        JSON.stringify({
          error: "Invalid request: postal_code is required and must be a string",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const cleanPostalCode = postal_code.trim().substring(0, 10);

    // Step 1: Try exact match
    let { data: exactMatch, error: exactError } = await supabase
      .from("egrid_postal_zones")
      .select("*")
      .eq("postal_code_prefix", cleanPostalCode)
      .single();

    if (!exactError && exactMatch) {
      return new Response(
        JSON.stringify({
          postal_code: cleanPostalCode,
          grid_intensity_zone: exactMatch.grid_intensity_zone,
          emission_factor_kg_co2_per_kwh: exactMatch.grid_intensity_kg_co2_per_kwh,
          state: exactMatch.state,
          confidence: "exact",
        } as EmissionFactorResponse),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 2: Try first 5 digits (standard US ZIP code prefix)
    const zipPrefix = cleanPostalCode.substring(0, 5);
    let { data: prefixMatch, error: prefixError } = await supabase
      .from("egrid_postal_zones")
      .select("*")
      .eq("postal_code_prefix", zipPrefix)
      .single();

    if (!prefixError && prefixMatch) {
      return new Response(
        JSON.stringify({
          postal_code: cleanPostalCode,
          grid_intensity_zone: prefixMatch.grid_intensity_zone,
          emission_factor_kg_co2_per_kwh: prefixMatch.grid_intensity_kg_co2_per_kwh,
          state: prefixMatch.state,
          confidence: "prefix_match",
        } as EmissionFactorResponse),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 3: Try first 2 digits (state-level fallback)
    const statePrefix = cleanPostalCode.substring(0, 2);
    let { data: stateMatch, error: stateError } = await supabase
      .from("egrid_postal_zones")
      .select("*")
      .eq("postal_code_prefix", statePrefix)
      .single();

    if (!stateError && stateMatch) {
      return new Response(
        JSON.stringify({
          postal_code: cleanPostalCode,
          grid_intensity_zone: stateMatch.grid_intensity_zone,
          emission_factor_kg_co2_per_kwh: stateMatch.grid_intensity_kg_co2_per_kwh,
          state: stateMatch.state,
          confidence: "prefix_match",
        } as EmissionFactorResponse),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 4: Return US average as fallback
    return new Response(
      JSON.stringify({
        postal_code: cleanPostalCode,
        grid_intensity_zone: "US_AVERAGE",
        emission_factor_kg_co2_per_kwh: 0.4,
        confidence: "default",
      } as EmissionFactorResponse),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in calculate-emission-factor:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
