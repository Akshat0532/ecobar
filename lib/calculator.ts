import {
  ELECTRICITY_FACTORS,
  NATURAL_GAS_FACTORS,
  HEATING_OIL_FACTORS,
  LPG_FACTORS,
  VEHICLE_FACTORS,
  TRANSIT_FACTORS,
  FLIGHT_FACTORS,
  DIET_FACTORS,
  SPENDING_FACTORS,
  BENCHMARKS,
  getElectricityFactor,
  getVehicleFactor,
  getDietFactor,
  getSpendingFactor,
} from './emissions';

export type CalculatorInputs = {
  // Home Energy
  monthlyElectricity?: number;    // kWh
  monthlyLpgCylinders?: number;   // Number of 14.2 kg LPG cylinders
  monthlyPngScm?: number;         // PNG in Standard Cubic Meters
  electricityRegion?: string;

  // Transportation - Personal Vehicle
  vehicleType?: 'TWO_WHEELER' | 'HATCHBACK' | 'SEDAN' | 'SUV' | 'DIESEL' | 'CNG' | 'HYBRID' | 'ELECTRIC';
  weeklyVehicleKm?: number;

  // Transportation - Public Transit & Flights
  monthlyTransitKm?: number;
  transitType?: 'BUS' | 'TRAIN' | 'METRO';
  annualFlights?: {
    short?: number;   // trips (domestic short-haul)
    medium?: number;  // trips (domestic long / international short)
    long?: number;    // trips (international long-haul)
  };

  // Diet
  dietType?: 'VEGAN' | 'VEGETARIAN' | 'EGGETARIAN' | 'BALANCED' | 'MEAT_HEAVY';

  // Goods & Services
  monthlySpending?: number;       // INR (₹)
  spendingLevel?: 'CONSERVATIVE' | 'LIBERAL';

  // Household size for per-capita
  householdSize?: number;
};

export type CalculatorResult = {
  // Totals
  monthlyTotal: number;           // kg CO₂e
  annualTotal: number;            // kg CO₂e
  monthlyPerCapita: number;       // kg CO₂e
  annualPerCapita: number;        // kg CO₂e

  // Breakdown
  homeEnergy: {
    electricity: number;
    lpg: number;
    png: number;
    total: number;
  };
  transportation: {
    personalVehicle: number;
    publicTransit: number;
    flights: number;
    total: number;
  };
  diet: number;
  goodsServices: number;

  // Context
  comparison: {
    vsIndiaAverage: number;       // kg CO₂e difference/month
    vsWorldAverage: number;
    vsParisTarget: number;
  };
  treesEquivalent: number;
  insight: string;
};

/**
 * Calculate monthly emissions from home energy consumption
 */
function calculateHomeEnergy(inputs: CalculatorInputs): CalculatorResult['homeEnergy'] {
  let electricity = 0;
  let lpg = 0;
  let png = 0;

  if (inputs.monthlyElectricity) {
    const factor = getElectricityFactor(inputs.electricityRegion);
    electricity = inputs.monthlyElectricity * factor;
  }

  if (inputs.monthlyLpgCylinders) {
    lpg = inputs.monthlyLpgCylinders * LPG_FACTORS.PER_CYLINDER;
  }

  if (inputs.monthlyPngScm) {
    png = inputs.monthlyPngScm * NATURAL_GAS_FACTORS.PER_SCM;
  }

  return {
    electricity: Number(electricity.toFixed(2)),
    lpg: Number(lpg.toFixed(2)),
    png: Number(png.toFixed(2)),
    total: Number((electricity + lpg + png).toFixed(2)),
  };
}

/**
 * Calculate monthly emissions from transportation
 */
function calculateTransportation(inputs: CalculatorInputs): CalculatorResult['transportation'] {
  let personalVehicle = 0;
  let publicTransit = 0;
  let flights = 0;

  // Personal Vehicle (km-based)
  if (inputs.weeklyVehicleKm && inputs.vehicleType) {
    const factor = getVehicleFactor(inputs.vehicleType);
    personalVehicle = inputs.weeklyVehicleKm * 4.33 * factor; // ~4.33 weeks/month
  }

  // Public Transit
  if (inputs.monthlyTransitKm && inputs.transitType) {
    const transitFactor =
      TRANSIT_FACTORS[inputs.transitType as keyof typeof TRANSIT_FACTORS] || TRANSIT_FACTORS.BUS;
    publicTransit = inputs.monthlyTransitKm * transitFactor;
  }

  // Flights (annualized, then divided by 12)
  if (inputs.annualFlights) {
    let annualFlightEmissions = 0;

    // Short-haul (assume 700 km avg — Delhi to Mumbai)
    if (inputs.annualFlights.short) {
      annualFlightEmissions += inputs.annualFlights.short * 700 * FLIGHT_FACTORS.SHORT_RFI;
    }

    // Medium-haul (assume 2000 km avg — Delhi to Chennai)
    if (inputs.annualFlights.medium) {
      annualFlightEmissions += inputs.annualFlights.medium * 2000 * FLIGHT_FACTORS.MEDIUM_RFI;
    }

    // Long-haul (assume 8000 km avg — International)
    if (inputs.annualFlights.long) {
      annualFlightEmissions += inputs.annualFlights.long * 8000 * FLIGHT_FACTORS.LONG_RFI;
    }

    flights = annualFlightEmissions / 12; // Monthly average
  }

  return {
    personalVehicle: Number(personalVehicle.toFixed(2)),
    publicTransit: Number(publicTransit.toFixed(2)),
    flights: Number(flights.toFixed(2)),
    total: Number((personalVehicle + publicTransit + flights).toFixed(2)),
  };
}

/**
 * Calculate monthly emissions from diet
 */
function calculateDiet(inputs: CalculatorInputs, householdSize: number): number {
  if (!inputs.dietType) return 0;
  const factor = getDietFactor(inputs.dietType);
  return Number((factor * householdSize).toFixed(2));
}

/**
 * Calculate monthly emissions from goods & services spending (in ₹)
 */
function calculateGoodsServices(inputs: CalculatorInputs): number {
  if (!inputs.monthlySpending) return 0;
  const factor = getSpendingFactor(inputs.spendingLevel);
  return Number((inputs.monthlySpending * factor).toFixed(2));
}

/**
 * Calculate trees needed to offset annual emissions (approximation)
 * 1 tree offsets ~20 kg CO₂e per year
 */
function calculateTreesEquivalent(annualEmissions: number): number {
  return Math.round(annualEmissions / 20);
}

/**
 * Generate personalized insight
 */
function generateInsight(result: CalculatorResult): string {
  const percentVsAverage = ((result.monthlyPerCapita / (BENCHMARKS.INDIA_AVERAGE_ANNUAL * 1000 / 12)) * 100).toFixed(0);

  if (result.annualPerCapita / 1000 < BENCHMARKS.PARIS_AGREEMENT_2030) {
    return `🌱 Excellent! You're on track for a 1.5°C pathway. That's ${percentVsAverage}% of the India average.`;
  }

  if (result.annualPerCapita / 1000 < BENCHMARKS.INDIA_AVERAGE_ANNUAL) {
    return `✓ Good start! Your footprint is ${percentVsAverage}% of the India average. Keep reducing.`;
  }

  // Find biggest category
  const breakdown = [
    { name: 'Home Energy', value: result.homeEnergy.total },
    { name: 'Transportation', value: result.transportation.total },
    { name: 'Diet', value: result.diet },
    { name: 'Goods & Services', value: result.goodsServices },
  ].sort((a, b) => b.value - a.value);

  return `The biggest opportunity? ${breakdown[0].name} accounts for ${(
    (breakdown[0].value / result.monthlyTotal) *
    100
  ).toFixed(0)}% of your footprint.`;
}

/**
 * Main calculation orchestrator
 */
export function calculateCarbonFootprint(inputs: CalculatorInputs): CalculatorResult {
  const householdSize = inputs.householdSize || 1;

  const homeEnergy = calculateHomeEnergy(inputs);
  const transportation = calculateTransportation(inputs);
  const diet = calculateDiet(inputs, householdSize);
  const goodsServices = calculateGoodsServices(inputs);

  const monthlyTotal = homeEnergy.total + transportation.total + diet + goodsServices;
  const annualTotal = monthlyTotal * 12;

  const monthlyPerCapita = monthlyTotal / householdSize;
  const annualPerCapita = annualTotal / householdSize;

  const comparison = {
    vsIndiaAverage: monthlyPerCapita - (BENCHMARKS.INDIA_AVERAGE_ANNUAL * 1000) / 12,
    vsWorldAverage: monthlyPerCapita - (BENCHMARKS.WORLD_AVERAGE_ANNUAL * 1000) / 12,
    vsParisTarget: monthlyPerCapita - (BENCHMARKS.PARIS_AGREEMENT_2030 * 1000) / 12,
  };

  const treesEquivalent = calculateTreesEquivalent(annualPerCapita);
  const insight = generateInsight({
    monthlyTotal,
    annualTotal,
    monthlyPerCapita,
    annualPerCapita,
    homeEnergy,
    transportation,
    diet,
    goodsServices,
    comparison,
    treesEquivalent,
    insight: '',
  });

  return {
    monthlyTotal: Number(monthlyTotal.toFixed(2)),
    annualTotal: Number(annualTotal.toFixed(2)),
    monthlyPerCapita: Number(monthlyPerCapita.toFixed(2)),
    annualPerCapita: Number(annualPerCapita.toFixed(2)),
    homeEnergy,
    transportation,
    diet: Number(diet.toFixed(2)),
    goodsServices: Number(goodsServices.toFixed(2)),
    comparison,
    treesEquivalent,
    insight,
  };
}
