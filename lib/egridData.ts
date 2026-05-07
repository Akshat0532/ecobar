// eGRID Subregion Reference Data
// Source: US EPA eGRID (https://www.epa.gov/egrid)
// These are typical emission factors in kg CO₂e per kWh for each US grid region

export const EGRID_ZONES = {
  // NEISO - New England ISO (Low emissions, hydroelectric & nuclear)
  NEISO: {
    name: "New England",
    states: ["CT", "MA", "ME", "NH", "RI", "VT"],
    emission_factor: 0.35,
    zip_prefixes: ["02", "03", "04", "05", "06"],
  },

  // NYUP - New York Upstate (Very low, hydroelectric heavy)
  NYUP: {
    name: "New York Upstate",
    states: ["NY"],
    emission_factor: 0.22,
    zip_prefixes: ["10", "11", "12", "13", "14"],
  },

  // MACC - Mid-Atlantic (Coal-natural gas mix)
  MACC: {
    name: "Mid Atlantic",
    states: ["PA", "NJ", "MD", "VA", "DC"],
    emission_factor: 0.45,
    zip_prefixes: ["15", "16", "17", "18", "19", "20", "21", "22", "23", "24"],
  },

  // FRCC - Florida/Caribbean (Natural gas, some coal)
  FRCC: {
    name: "Florida",
    states: ["FL"],
    emission_factor: 0.52,
    zip_prefixes: ["32", "33", "34"],
  },

  // SERC - Southeast (Coal-heavy region)
  SERC: {
    name: "Southeast",
    states: ["NC", "SC", "GA", "AL", "MS", "TN", "KY", "AR", "LA"],
    emission_factor: 0.60,
    zip_prefixes: ["27", "28", "29", "30", "31", "35", "37", "38", "39", "40", "41", "42", "71", "72"],
  },

  // MISO - Midwest ISO (Coal-dominant, some wind)
  MISO: {
    name: "Midwest (MISO)",
    states: ["IL", "IN", "MI", "OH", "WI", "MN", "MO", "IA", "ND", "SD"],
    emission_factor: 0.55,
    zip_prefixes: ["43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "60", "61", "62", "63", "64", "65"],
  },

  // SPP - Southwest Power Pool (Coal & natural gas, growing wind)
  SPP: {
    name: "Southwest Power Pool",
    states: ["OK", "TX", "KS", "NE", "CO"],
    emission_factor: 0.48,
    zip_prefixes: ["66", "67", "68", "69", "70", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84"],
  },

  // WECC - Western Electricity Coordinating Council (Renewables-heavy)
  WECC: {
    name: "Western (WECC)",
    states: ["CA", "NV", "UT", "AZ", "NM", "CO", "MT", "WY"],
    emission_factor: 0.40,
    zip_prefixes: ["80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90", "91", "92", "93", "94", "95", "96"],
  },

  // CAMX - California (High renewables, low emissions)
  CAMX: {
    name: "California",
    states: ["CA"],
    emission_factor: 0.28,
    zip_prefixes: ["90", "91", "92", "93", "94", "95", "96"],
  },

  // NWPP - Pacific Northwest Power Pool (Hydroelectric-dominant)
  NWPP: {
    name: "Pacific Northwest",
    states: ["WA", "OR", "ID"],
    emission_factor: 0.18,
    zip_prefixes: ["97", "98", "99"],
  },

  // AVRN - Avangrid (Idaho, Oregon, Washington)
  AVRN: {
    name: "Avangrid (Pacific)",
    states: ["ID", "OR", "WA"],
    emission_factor: 0.20,
    zip_prefixes: ["83", "97", "98", "99"],
  },

  // CISO - California ISO (Grid operator for much of CA)
  CISO: {
    name: "California ISO",
    states: ["CA"],
    emission_factor: 0.28,
    zip_prefixes: ["90", "91", "92", "93", "94", "95", "96"],
  },

  // US Average (fallback)
  US_AVERAGE: {
    name: "United States Average",
    states: ["US"],
    emission_factor: 0.40,
    zip_prefixes: ["00"],
  },
} as const;

export type EGRIDZoneKey = keyof typeof EGRID_ZONES;

// Reverse mapping: ZIP prefix to zone
export const ZIP_PREFIX_TO_ZONE: Record<string, EGRIDZoneKey> = {
  "02": "NEISO", // MA
  "03": "NEISO", // NH
  "04": "NEISO", // ME
  "05": "NEISO", // VT
  "06": "NEISO", // CT
  "10": "NYUP", // NY
  "11": "NYUP", // NY
  "12": "NYUP", // NY
  "13": "NYUP", // NY
  "14": "NYUP", // NY
  "15": "MACC", // PA
  "16": "MACC", // PA
  "17": "MACC", // PA
  "18": "MACC", // PA
  "19": "MACC", // PA
  "20": "MACC", // DC/MD
  "21": "MACC", // MD
  "22": "MACC", // VA
  "23": "MACC", // VA
  "24": "MACC", // VA
  "27": "SERC", // NC
  "28": "SERC", // NC
  "29": "SERC", // SC
  "30": "SERC", // GA
  "31": "SERC", // GA
  "32": "FRCC", // FL
  "33": "FRCC", // FL
  "34": "FRCC", // FL
  "35": "SERC", // FL panhandle
  "37": "SERC", // NC
  "38": "SERC", // NC
  "39": "SERC", // NC
  "40": "SERC", // KY
  "41": "SERC", // KY
  "42": "SERC", // TN
  "43": "MISO", // OH
  "44": "MISO", // OH
  "45": "MISO", // OH
  "46": "MISO", // IN
  "47": "SERC", // TN
  "48": "MISO", // MI
  "49": "MISO", // MI
  "50": "MISO", // VT
  "51": "MISO", // WI
  "52": "MISO", // WI
  "53": "MISO", // WI
  "54": "MISO", // WI
  "55": "MISO", // MN
  "56": "MISO", // MN
  "57": "MISO", // SD
  "58": "MISO", // ND
  "59": "WECC", // MT
  "60": "MISO", // IL
  "61": "MISO", // IL
  "62": "MISO", // IL
  "63": "MISO", // MO
  "64": "MISO", // MO
  "65": "MISO", // AR
  "66": "SPP", // KS
  "67": "SPP", // KS
  "68": "SPP", // KS
  "69": "SPP", // KS
  "70": "SPP", // OK
  "71": "SERC", // AR
  "72": "SERC", // AR
  "73": "SPP", // OK
  "74": "SPP", // OK
  "75": "SPP", // TX
  "76": "SPP", // TX
  "77": "SPP", // TX
  "78": "SPP", // TX
  "79": "SPP", // TX
  "80": "WECC", // CO
  "81": "WECC", // CO
  "82": "WECC", // WY
  "83": "WECC", // WY
  "84": "SPP", // UT/NM
  "85": "WECC", // AZ
  "86": "WECC", // AZ
  "87": "WECC", // NM
  "88": "WECC", // NM
  "89": "WECC", // NV
  "90": "CAMX", // CA
  "91": "CAMX", // CA
  "92": "CAMX", // CA
  "93": "CAMX", // CA
  "94": "CAMX", // CA
  "95": "CAMX", // CA
  "96": "CAMX", // CA
  "97": "NWPP", // OR
  "98": "NWPP", // WA
  "99": "NWPP", // WA
};

/**
 * Get emission factor for a postal code
 * Falls back to regional average if exact match not found
 */
export function getEmissionFactorByZip(postalCode: string): {
  zone: EGRIDZoneKey;
  factor: number;
  name: string;
} {
  const prefix = postalCode.substring(0, 2);
  const zone = ZIP_PREFIX_TO_ZONE[prefix] || "US_AVERAGE";
  const zoneData = EGRID_ZONES[zone];

  return {
    zone,
    factor: zoneData.emission_factor,
    name: zoneData.name,
  };
}

/**
 * Get all zones available
 */
export function getAllEGRIDZones() {
  return Object.entries(EGRID_ZONES).map(([key, data]) => ({
    key: key as EGRIDZoneKey,
    ...data,
  }));
}

/**
 * Calculate electricity emission based on kWh and location
 */
export function calculateElectricityEmission(
  kwhUsed: number,
  postalCode: string
): { kg_co2e: number; breakdown: { kwh: number; factor: number } } {
  const { factor } = getEmissionFactorByZip(postalCode);
  const kg_co2e = kwhUsed * factor;

  return {
    kg_co2e,
    breakdown: {
      kwh: kwhUsed,
      factor,
    },
  };
}

/**
 * Emission factors for different activities (fixed, not grid-dependent)
 */
export const ACTIVITY_EMISSION_FACTORS = {
  transport: {
    car_per_mile: 0.404, // kg CO₂e per mile (average car)
    suv_per_mile: 0.547, // kg CO₂e per mile (average SUV)
    truck_per_mile: 0.652, // kg CO₂e per mile (pickup truck)
    motorcycle_per_mile: 0.135, // kg CO₂e per mile
    electricVehicle_per_mile: 0.141, // kg CO₂e per mile (with grid mix)
    bus_per_mile: 0.089, // kg CO₂e per passenger-mile
    train_per_mile: 0.041, // kg CO₂e per passenger-mile
    flight_per_mile: 0.255, // kg CO₂e per passenger-mile
  },

  food: {
    beef_per_kg: 99.48, // kg CO₂e per kg of beef
    pork_per_kg: 12.31,
    chicken_per_kg: 6.9,
    fish_per_kg: 12.62,
    dairy_per_liter: 2.4, // milk/dairy
    fruits_veggies_per_kg: 0.5, // average
    rice_per_kg: 2.7,
    wheat_per_kg: 0.8,
  },

  goods: {
    clothing_per_item: 8.5, // kg CO₂e average garment
    electronics_per_item: 45, // kg CO₂e smartphone/device
    furniture_per_item: 50, // kg CO₂e average piece
  },

  home: {
    natural_gas_per_therm: 5.3, // kg CO₂e per therm
    heating_oil_per_gallon: 10.5, // kg CO₂e per gallon
    propane_per_gallon: 5.8, // kg CO₂e per gallon
  },
} as const;

/**
 * Calculate various activity emissions
 */
export function calculateActivityEmission(
  activity: string,
  value: number
): number | null {
  // Check all subcategories
  for (const [category, factors] of Object.entries(ACTIVITY_EMISSION_FACTORS)) {
    for (const [key, factor] of Object.entries(factors as Record<string, number>)) {
      if (key.includes(activity.toLowerCase().replace(/\s+/g, "_"))) {
        return value * factor;
      }
    }
  }
  return null;
}
