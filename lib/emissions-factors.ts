/**
 * Comprehensive Electricity Factors by Indian State (kg CO₂e per kWh)
 * Source: CEA (Central Electricity Authority) CO₂ Baseline Database v18.0
 * Last Updated: 2024
 */
export const ELECTRICITY_FACTORS_BY_STATE: Record<string, number> = {
  // States
  AP: 0.670,  // Andhra Pradesh (thermal + renewable)
  AR: 0.320,  // Arunachal Pradesh (hydro-heavy)
  AS: 0.780,  // Assam (thermal-heavy)
  BR: 0.890,  // Bihar (coal-heavy)
  CG: 0.920,  // Chhattisgarh (coal-heavy)
  GA: 0.580,  // Goa (mixed)
  GJ: 0.760,  // Gujarat (thermal + wind + solar)
  HR: 0.810,  // Haryana (thermal-heavy)
  HP: 0.200,  // Himachal Pradesh (hydro-heavy)
  JH: 0.880,  // Jharkhand (coal-heavy)
  KA: 0.580,  // Karnataka (hydro + wind + solar)
  KL: 0.520,  // Kerala (hydro + thermal)
  MP: 0.840,  // Madhya Pradesh (coal + solar)
  MH: 0.720,  // Maharashtra (thermal + renewable)
  MN: 0.360,  // Manipur (hydro-heavy)
  ML: 0.340,  // Meghalaya (hydro-heavy)
  MZ: 0.300,  // Mizoram (hydro-heavy)
  NL: 0.380,  // Nagaland (hydro + thermal)
  OD: 0.880,  // Odisha (coal-heavy)
  PB: 0.750,  // Punjab (thermal + solar)
  RJ: 0.780,  // Rajasthan (thermal + wind + solar)
  SK: 0.150,  // Sikkim (hydro-dominant, cleanest)
  TN: 0.650,  // Tamil Nadu (wind + solar + thermal)
  TS: 0.700,  // Telangana (thermal + solar)
  TR: 0.560,  // Tripura (gas-based thermal)
  UP: 0.830,  // Uttar Pradesh (coal-heavy)
  UK: 0.280,  // Uttarakhand (hydro-heavy)
  WB: 0.820,  // West Bengal (coal-heavy)

  // Union Territories
  AN: 0.850,  // Andaman & Nicobar (diesel generators)
  CH: 0.750,  // Chandigarh (northern grid)
  DN: 0.720,  // Dadra & Nagar Haveli and Daman & Diu
  DL: 0.740,  // Delhi (gas + coal grid)
  JK: 0.350,  // Jammu & Kashmir (hydro-heavy)
  LA: 0.250,  // Ladakh (solar + hydro)
  LD: 0.800,  // Lakshadweep (diesel generators)
  PY: 0.640,  // Puducherry (southern grid)
};

/**
 * India Average electricity emissions factor
 * Source: CEA 2023 — weighted national average
 */
export const INDIA_AVERAGE_ELECTRICITY_FACTOR = 0.708; // kg CO₂e per kWh

/**
 * Indian State Names for display
 */
export const INDIAN_STATE_NAMES: Record<string, string> = {
  AP: 'Andhra Pradesh',
  AR: 'Arunachal Pradesh',
  AS: 'Assam',
  BR: 'Bihar',
  CG: 'Chhattisgarh',
  GA: 'Goa',
  GJ: 'Gujarat',
  HR: 'Haryana',
  HP: 'Himachal Pradesh',
  JH: 'Jharkhand',
  KA: 'Karnataka',
  KL: 'Kerala',
  MP: 'Madhya Pradesh',
  MH: 'Maharashtra',
  MN: 'Manipur',
  ML: 'Meghalaya',
  MZ: 'Mizoram',
  NL: 'Nagaland',
  OD: 'Odisha',
  PB: 'Punjab',
  RJ: 'Rajasthan',
  SK: 'Sikkim',
  TN: 'Tamil Nadu',
  TS: 'Telangana',
  TR: 'Tripura',
  UP: 'Uttar Pradesh',
  UK: 'Uttarakhand',
  WB: 'West Bengal',
  AN: 'Andaman & Nicobar',
  CH: 'Chandigarh',
  DN: 'Dadra & Nagar Haveli',
  DL: 'Delhi',
  JK: 'Jammu & Kashmir',
  LA: 'Ladakh',
  LD: 'Lakshadweep',
  PY: 'Puducherry',
};

/**
 * Transport Emission Factors — India
 * Source: TERI, BEE, Indian Oil Corporation data
 * All per-km factors
 */
export const TRANSPORT_FACTORS = {
  /**
   * Vehicle-based factors (kg CO₂e per km)
   */
  vehicle: {
    // Two-wheelers (most common in India)
    two_wheeler: 0.035,       // Petrol scooter/bike (~40 km/L)
    two_wheeler_ev: 0.010,    // Electric scooter

    // Cars
    hatchback: 0.120,         // Petrol hatchback (~18 km/L) - Swift, i20
    sedan: 0.148,             // Petrol sedan (~15 km/L) - City, Verna
    suv: 0.195,               // Petrol/Diesel SUV (~12 km/L) - Creta, XUV
    diesel_car: 0.165,        // Diesel car (~20 km/L)
    cng: 0.095,               // CNG vehicle (~25 km/kg CNG)
    electric: 0.055,          // EV (with Indian grid mix)
    hybrid: 0.095,            // Hybrid vehicle

    // Commercial / Public
    auto_rickshaw: 0.055,     // 3-wheeler auto (~25 km/L petrol)
    auto_cng: 0.040,          // CNG auto-rickshaw
    bus: 0.025,               // Per passenger-km (avg occupancy)
    train: 0.006,             // Indian Railways per passenger-km
  },

  /**
   * Direct fuel consumption factors (India)
   */
  fuel: {
    petrol_per_liter: 2.296,     // kg CO₂e per liter of petrol
    diesel_per_liter: 2.653,     // kg CO₂e per liter of diesel
    cng_per_kg: 2.750,           // kg CO₂e per kg of CNG
    ev_per_kwh: 0.708,           // kg CO₂e per kWh (Indian grid)
  },

  /**
   * Aviation factors (kg CO₂e per passenger-km)
   */
  aviation: {
    domestic_flight: 0.158,      // Domestic flights (IndiGo, Air India)
    international_flight: 0.121, // International (long-haul, more efficient)
    short_haul: 0.180,           // < 1000 km (higher per-km)
    long_haul: 0.121,            // > 3500 km
  },

  /**
   * Public transit factors (kg CO₂e per passenger-km)
   */
  transit: {
    city_bus: 0.025,             // City bus (avg occupancy)
    metro: 0.024,                // Delhi Metro, Mumbai Metro, etc.
    local_train: 0.006,          // Mumbai local, Indian Railways
    auto_rickshaw: 0.055,        // Shared auto
    e_rickshaw: 0.012,           // Electric rickshaw (common in North India)
  },
};

/**
 * Food Emission Factors — India
 * Source: ICAR, FAO Life Cycle Assessment data for Indian agriculture
 * Per kilogram unless noted
 */
export const FOOD_FACTORS = {
  // Meat (per kg)
  chicken: 5.40,             // Poultry (most consumed meat in India)
  mutton: 39.20,             // Goat/sheep (popular in India, replaces beef context)
  fish_freshwater: 3.49,     // Rohu, Catla, Tilapia
  fish_marine: 4.51,         // Pomfret, Surmai, Prawns
  pork: 12.31,
  eggs: 4.58,                // Per kg (~16 eggs)

  // Dairy (per kg/liter)
  milk: 1.90,                // Indian dairy (buffalo + cow mix)
  paneer: 8.50,              // Per kg (requires ~7L milk)
  ghee: 15.20,               // Per kg (high milk input)
  curd: 2.10,                // Dahi/yogurt per kg
  cheese: 12.50,
  butter: 14.80,

  // Staples (per kg)
  rice_white: 3.90,          // Paddy rice (higher due to methane from paddies)
  rice_basmati: 4.20,        // Basmati (longer cultivation)
  wheat_atta: 0.80,          // Wheat flour
  dal_lentils: 0.40,         // Moong, masoor, toor dal
  chickpeas: 0.55,           // Chana
  rajma: 0.60,               // Kidney beans

  // Vegetables (per kg)
  potato: 0.29,
  onion: 0.17,
  tomato: 0.39,
  cauliflower: 0.42,
  spinach: 0.22,
  brinjal: 0.31,             // Eggplant
  okra: 0.35,                // Bhindi

  // Fruits (per kg)
  mango: 0.42,
  banana: 0.36,
  apple_imported: 1.61,      // Most apples imported or from Kashmir
  orange: 0.49,
  papaya: 0.28,
  guava: 0.25,

  // Cooking essentials
  cooking_oil: 3.15,         // Per liter (mustard/sunflower/groundnut)
  sugar: 0.85,               // Indian sugarcane sugar per kg
  tea: 1.82,                 // Per kg
  coffee: 19.4,              // Per kg
  spices: 1.50,              // Average per kg (turmeric, cumin, etc.)
  chocolate: 17.6,
};

/**
 * Home Energy Factors — India
 * Source: BEE (Bureau of Energy Efficiency), Indian Oil, GAIL
 */
export const HOME_ENERGY_FACTORS = {
  // LPG Cylinder (most common cooking fuel — 14.2 kg cylinder)
  lpg_per_cylinder: 42.5,      // kg CO₂e per 14.2 kg LPG cylinder

  // Piped Natural Gas (PNG — per SCM / Standard Cubic Meter)
  png_per_scm: 1.93,           // kg CO₂e per Standard Cubic Meter

  // Kerosene (still used in some rural areas — per liter)
  kerosene_per_liter: 2.54,    // kg CO₂e per liter

  // Biomass / Firewood (per kg — rural India)
  firewood_per_kg: 1.75,       // kg CO₂e per kg (including PM2.5 and black carbon)

  // Electricity is handled separately by state factors
};

/**
 * Goods & Shopping Factors — India
 * Average carbon footprint for manufactured items (Indian market)
 */
export const GOODS_FACTORS = {
  // Clothing (kg CO₂e per item)
  cotton_kurta: 4.20,
  cotton_shirt: 5.51,
  polyester_shirt: 3.09,
  jeans: 10.18,
  saree_cotton: 6.50,
  saree_silk: 12.00,
  jacket: 24.5,
  shoes_leather: 12.6,
  shoes_synthetic: 7.82,

  // Electronics (kg CO₂e per unit)
  smartphone: 85,
  laptop: 142,
  monitor: 78,
  headphones: 5.5,

  // Furniture (kg CO₂e per item)
  dining_chair: 48,
  sofa: 240,
  bed_frame: 180,
  bookshelf: 95,

  // General goods (average)
  average_clothing: 7.0,       // Per item
  average_electronics: 50,     // Per item
  average_furniture: 120,      // Per item
};

/**
 * Waste & Recycling Factors
 * Savings from recycling vs. landfill
 */
export const WASTE_FACTORS = {
  recycled_items_avoided: {
    aluminum: 12.8,
    plastic: 3.0,
    paper: 2.0,
    glass: 0.5,
    steel: 1.2,
  },

  waste_to_landfill: {
    general_waste_per_kg: 0.25,
  },

  composting_savings: {
    food_waste_per_kg: 0.15,
  },
};

/**
 * Get electricity emission factor for a given Indian state
 * Falls back to India average if state not found
 */
export function getElectricityFactor(state: string): number {
  const factor = ELECTRICITY_FACTORS_BY_STATE[state.toUpperCase()];
  return factor ?? INDIA_AVERAGE_ELECTRICITY_FACTOR;
}

/**
 * Calculate emission from electricity usage
 * @param kwhUsed - Kilowatt hours consumed
 * @param state - Two-letter Indian state code
 * @returns kg CO₂e
 */
export function calculateElectricityEmission(
  kwhUsed: number,
  state: string = "IN"
): number {
  const factor = state === "IN"
    ? INDIA_AVERAGE_ELECTRICITY_FACTOR
    : getElectricityFactor(state);
  return kwhUsed * factor;
}

/**
 * Calculate emission from vehicle travel
 * @param km - Kilometers traveled
 * @param vehicleType - Type of vehicle
 * @returns kg CO₂e
 */
export function calculateVehicleEmission(
  km: number,
  vehicleType: keyof typeof TRANSPORT_FACTORS.vehicle = "hatchback"
): number {
  const factor = TRANSPORT_FACTORS.vehicle[vehicleType];
  return km * factor;
}

/**
 * Calculate emission from food consumption
 * @param foodItem - Type of food
 * @param quantity - Amount in kg
 * @returns kg CO₂e
 */
export function calculateFoodEmission(
  foodItem: keyof typeof FOOD_FACTORS,
  quantity: number
): number {
  const factor = FOOD_FACTORS[foodItem];
  return quantity * factor;
}

/**
 * Get all available Indian states for electricity factors
 */
export function getAvailableStates(): string[] {
  return Object.keys(ELECTRICITY_FACTORS_BY_STATE).sort();
}

/**
 * Get emission factor statistics
 */
export function getElectricityFactorStats(): {
  min: number;
  max: number;
  average: number;
  states: Record<string, "low" | "medium" | "high">;
} {
  const values = Object.values(ELECTRICITY_FACTORS_BY_STATE);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const average = values.reduce((a, b) => a + b, 0) / values.length;

  const states = Object.entries(ELECTRICITY_FACTORS_BY_STATE).reduce(
    (acc, [state, factor]) => {
      if (factor < average - 0.1) {
        acc[state] = "low";
      } else if (factor > average + 0.1) {
        acc[state] = "high";
      } else {
        acc[state] = "medium";
      }
      return acc;
    },
    {} as Record<string, "low" | "medium" | "high">
  );

  return { min, max, average, states };
}

/**
 * Conversion utilities
 */
export const CONVERSIONS = {
  // Weight
  lbs_to_kg: (lbs: number) => lbs * 0.453592,
  kg_to_lbs: (kg: number) => kg / 0.453592,

  // Distance
  miles_to_km: (miles: number) => miles * 1.60934,
  km_to_miles: (km: number) => km / 1.60934,

  // Energy
  kwh_to_mwh: (kwh: number) => kwh / 1000,
  mwh_to_kwh: (mwh: number) => mwh * 1000,
  liters_to_gallons: (liters: number) => liters / 3.78541,
  gallons_to_liters: (gallons: number) => gallons * 3.78541,

  // Carbon
  kg_co2_to_metric_tons: (kg: number) => kg / 1000,
  metric_tons_to_kg_co2: (tons: number) => tons * 1000,

  // Tree equivalents (trees absorb ~20 kg CO₂/year)
  kg_co2_to_trees: (kg: number) => kg / 20,
  trees_to_kg_co2: (trees: number) => trees * 20,

  // Car km (average Indian car emits ~0.148 kg CO₂/km)
  kg_co2_to_car_km: (kg: number) => kg / 0.148,
  car_km_to_kg_co2: (km: number) => km * 0.148,
};

/**
 * Carbon footprint benchmarks — India
 */
export const CARBON_BENCHMARKS = {
  // Annual per capita (kg CO₂e)
  INDIA_AVERAGE_ANNUAL: 1900,    // ~1.9 metric tons (India per capita)
  GLOBAL_AVERAGE_ANNUAL: 4500,   // ~4.5 metric tons
  LOW_CARBON_TARGET: 2500,       // Paris Agreement aligned
  CARBON_NET_ZERO_TARGET: 0,

  // Monthly breakdown
  INDIA_AVERAGE_MONTHLY: 158,    // ~158 kg/month
  GLOBAL_AVERAGE_MONTHLY: 375,

  // Daily breakdown
  INDIA_AVERAGE_DAILY: 5.2,
  GLOBAL_AVERAGE_DAILY: 12.3,
};
