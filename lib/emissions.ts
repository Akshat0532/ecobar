/**
 * Emission Factors based on:
 * - CEA (Central Electricity Authority) CO₂ Baseline Database v18.0
 * - BEE (Bureau of Energy Efficiency) India
 * - TERI (The Energy and Resources Institute) data
 *
 * All factors in kg CO₂e per unit
 */

// Electricity emission factors by Indian grid region
export const ELECTRICITY_FACTORS = {
  'INDIA_NATIONAL_AVG': 0.708,    // kg CO₂e / kWh (CEA 2023 weighted)
  'NORTHERN_GRID': 0.790,         // UP, Haryana, Punjab, HP, J&K, Delhi
  'SOUTHERN_GRID': 0.640,         // TN, KA, KL, AP, TS
  'WESTERN_GRID': 0.730,          // MH, GJ, MP, CG, Goa
  'EASTERN_GRID': 0.860,          // WB, Bihar, Jharkhand, Odisha
  'NORTHEASTERN_GRID': 0.380,     // NE states (hydro-heavy)
};

// LPG and PNG factors (common cooking fuels in India)
export const LPG_FACTORS = {
  'PER_CYLINDER': 42.5,           // kg CO₂e per 14.2 kg LPG cylinder
  'PER_KG': 2.99,                 // kg CO₂e per kg of LPG
};

// Piped Natural Gas (PNG) — replacing US natural gas therms
export const NATURAL_GAS_FACTORS = {
  'PER_SCM': 1.93,                // kg CO₂e per Standard Cubic Meter (India)
  'PER_THERM': 5.27,              // kg CO₂e per therm (kept for compatibility)
  'PER_MMBTU': 53.02,             // kg CO₂e per MMBtu
  'PER_CUBIC_METER': 1.93,        // kg CO₂e per m³
};

// Kerosene / heating factors (per liter)
export const HEATING_OIL_FACTORS = {
  'PER_LITER': 2.54,              // kg CO₂e per liter of kerosene
  'PER_GALLON': 10.16,            // kg CO₂e per gallon (kept for compatibility)
};

// Vehicle factors — India (per km)
// Based on Indian fuel economy data from ARAI/BEE
export const VEHICLE_FACTORS = {
  'TWO_WHEELER': 0.035,           // kg CO₂e / km (petrol scooter/bike)
  'HATCHBACK': 0.120,             // kg CO₂e / km (petrol, ~18 km/L)
  'SEDAN': 0.148,                 // kg CO₂e / km (petrol, ~15 km/L)
  'SUV': 0.195,                   // kg CO₂e / km (petrol/diesel, ~12 km/L)
  'DIESEL': 0.165,                // kg CO₂e / km (diesel car, ~20 km/L)
  'CNG': 0.095,                   // kg CO₂e / km (CNG vehicle)
  'HYBRID': 0.095,                // kg CO₂e / km
  'ELECTRIC': 0.055,              // kg CO₂e / km (on Indian grid)
};

// Public transit emission factors — India (per passenger-km)
export const TRANSIT_FACTORS = {
  'BUS': 0.025,                   // kg CO₂e / km (city bus avg occupancy)
  'TRAIN': 0.006,                 // kg CO₂e / km (Indian Railways)
  'METRO': 0.024,                 // kg CO₂e / km (Delhi/Mumbai Metro)
};

// Aviation emission factors (including RFI multiplier ~2.7x for high-altitude effects)
// Short haul: <1000 km, Med: 1000-3500 km, Long: >3500 km
export const FLIGHT_FACTORS = {
  'SHORT_DIRECT': 0.180,          // kg CO₂e / km (one passenger)
  'MEDIUM_DIRECT': 0.158,         // kg CO₂e / km
  'LONG_DIRECT': 0.121,           // kg CO₂e / km
  'SHORT_RFI': 0.486,             // With RFI multiplier
  'MEDIUM_RFI': 0.427,            // With RFI multiplier
  'LONG_RFI': 0.327,              // With RFI multiplier
};

// Diet-based emissions (per month per person)
// Indian diets are generally more plant-based than Western diets
export const DIET_FACTORS = {
  'VEGAN': 0.8,                   // kg CO₂e / person / month
  'VEGETARIAN': 1.5,              // kg CO₂e / person / month (Indian vegetarian with dairy)
  'EGGETARIAN': 2.0,              // kg CO₂e / person / month (veg + eggs, common in India)
  'BALANCED': 3.5,                // kg CO₂e / person / month (non-veg 2-3 times/week)
  'MEAT_HEAVY': 6.0,              // kg CO₂e / person / month (non-veg daily)
};

// Goods & Services spending-based emissions (per ₹ spent)
export const SPENDING_FACTORS = {
  // Conservative: focus on essential goods
  'CONSERVATIVE': 0.004,          // kg CO₂e / ₹ spent (basic necessities)
  // Liberal: includes discretionary tech and entertainment
  'LIBERAL': 0.007,               // kg CO₂e / ₹ spent (includes electronics, dining out)
};

// Context benchmarks for comparison — India
export const BENCHMARKS = {
  'INDIA_AVERAGE_ANNUAL': 1.9,    // tonnes CO₂e per person per year
  'US_AVERAGE_ANNUAL': 16.0,      // for reference
  'WORLD_AVERAGE_ANNUAL': 4.5,
  'PARIS_AGREEMENT_2030': 2.5,    // Target for 1.5°C pathway
  'CHINA_AVERAGE_ANNUAL': 8.0,
};

// Per-capita daily/monthly limits for 1.5°C pathway
export const DAILY_TARGETS = {
  'TOTAL_DAILY_KG': 6.85,         // kg CO₂e (to achieve 2.5 tonnes/year)
};

/**
 * Convert common input units to standard units
 */
export const UNIT_CONVERSIONS = {
  // Distance
  'MILES_TO_KM': 1.60934,
  'KM_TO_MILES': 0.621371,
};

/**
 * Helper function to get electricity factor based on region or default
 */
export function getElectricityFactor(region = 'INDIA_NATIONAL_AVG'): number {
  return ELECTRICITY_FACTORS[region as keyof typeof ELECTRICITY_FACTORS] || ELECTRICITY_FACTORS.INDIA_NATIONAL_AVG;
}

/**
 * Helper function to get vehicle factor
 */
export function getVehicleFactor(vehicleType = 'HATCHBACK'): number {
  return VEHICLE_FACTORS[vehicleType as keyof typeof VEHICLE_FACTORS] || VEHICLE_FACTORS.HATCHBACK;
}

/**
 * Helper function to get diet factor
 */
export function getDietFactor(dietType = 'BALANCED'): number {
  return DIET_FACTORS[dietType as keyof typeof DIET_FACTORS] || DIET_FACTORS.BALANCED;
}

/**
 * Helper function to get spending factor
 */
export function getSpendingFactor(level = 'BALANCED'): number {
  if (level === 'LIBERAL') return SPENDING_FACTORS.LIBERAL;
  if (level === 'CONSERVATIVE') return SPENDING_FACTORS.CONSERVATIVE;
  return (SPENDING_FACTORS.LIBERAL + SPENDING_FACTORS.CONSERVATIVE) / 2;
}
