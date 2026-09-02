import type { CalculatorInputs } from '@/lib/calculator';
import type {
  DetailedCarbonInput,
  SimpleCarbonInput,
  DietType,
} from '@/lib/carbon/schema';

/**
 * Convert miles to kilometers
 * 1 mile = 1.60934 km
 */
export function milesToKilometers(miles: number): number {
  return Math.round(miles * 1.60934 * 100) / 100;
}

/**
 * Typed mapping from simple lowercase diet types to calculator uppercase diet types.
 * Avoids any unsafe type casting.
 */
export const DIET_MAP: Record<DietType, NonNullable<CalculatorInputs['dietType']>> = {
  vegan: 'VEGAN',
  vegetarian: 'VEGETARIAN',
  eggetarian: 'EGGETARIAN',
  balanced: 'BALANCED',
  meat_heavy: 'MEAT_HEAVY',
};

/**
 * Explicit adapter converting SimpleCarbonInput to CalculatorInputs.
 * Maps commute, energy, and diet to the existing calculator engine.
 *
 * Energy unit semantics are strictly determined by the selected energy source (no numeric threshold guessing):
 * - electricity: input is in kWh -> monthlyElectricity
 * - lpg: input is in 14.2 kg cylinders -> monthlyLpgCylinders
 * - natural_gas: input is in SCM -> monthlyPngScm
 * - mixed: input is in kWh electricity (+ 1 LPG cylinder for cooking) -> monthlyElectricity & monthlyLpgCylinders
 */
export function simpleInputToCalculatorInput(input: SimpleCarbonInput): CalculatorInputs {
  const result: CalculatorInputs = {
    householdSize: 1,
    dietType: DIET_MAP[input.dietType],
  };

  // 1. Commute mapping
  switch (input.commuteMode) {
    case 'car':
      // SEDAN is the standard petrol car emission factor in lib/emissions.ts (0.148 kg CO₂e/km)
      result.vehicleType = 'SEDAN';
      result.weeklyVehicleKm = input.weeklyKm;
      break;
    case 'two_wheeler':
      // Petrol scooter / motorcycle in lib/emissions.ts (0.035 kg CO₂e/km)
      result.vehicleType = 'TWO_WHEELER';
      result.weeklyVehicleKm = input.weeklyKm;
      break;
    case 'transit':
      // Public transit (bus default in lib/emissions.ts, 0.025 kg CO₂e/km)
      // Calculator expects monthlyTransitKm (~4.33 weeks per month)
      result.transitType = 'BUS';
      result.monthlyTransitKm = Number((input.weeklyKm * 4.33).toFixed(2));
      break;
    case 'bike':
    case 'remote':
      // Zero commute emissions
      result.weeklyVehicleKm = 0;
      result.monthlyTransitKm = 0;
      break;
  }

  // 2. Energy mapping — strictly based on selected source (no threshold guessing)
  switch (input.homeEnergySource) {
    case 'electricity':
      result.monthlyElectricity = input.monthlyEnergyUsage;
      break;
    case 'lpg':
      result.monthlyLpgCylinders = input.monthlyEnergyUsage;
      break;
    case 'natural_gas':
      result.monthlyPngScm = input.monthlyEnergyUsage;
      break;
    case 'mixed':
      result.monthlyElectricity = input.monthlyEnergyUsage;
      result.monthlyLpgCylinders = 1;
      break;
  }

  return result;
}

/**
 * Adapter converting DetailedCarbonInput to CalculatorInputs.
 * Ensures typed diet mapping while passing all detailed parameters through.
 */
export function detailedInputToCalculatorInput(input: DetailedCarbonInput): CalculatorInputs {
  const { dietType, ...rest } = input;
  const result: CalculatorInputs = { ...rest };

  if (dietType) {
    const upper = dietType.toUpperCase();
    if (upper === 'VEGAN' || upper === 'VEGETARIAN' || upper === 'EGGETARIAN' || upper === 'BALANCED' || upper === 'MEAT_HEAVY') {
      result.dietType = upper;
    } else if (dietType in DIET_MAP) {
      result.dietType = DIET_MAP[dietType as DietType];
    }
  }

  return result;
}
