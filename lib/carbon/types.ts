/**
 * Unified Carbon Input Schema
 * Single source of truth for all carbon calculation inputs
 * Units: kilometers, kWh, kg CO2e
 */

export type CommuteMode = 'car' | 'two_wheeler' | 'transit' | 'bike' | 'remote';
export type HomeEnergySource = 'electricity' | 'lpg' | 'natural_gas' | 'mixed';
export type DietType = 'vegan' | 'vegetarian' | 'eggetarian' | 'balanced' | 'meat_heavy';

/**
 * Minimal carbon input for simple logging
 */
export interface SimpleCarbonInput {
  commuteMode: CommuteMode;
  weeklyKm: number; // kilometers traveled per week
  homeEnergySource: HomeEnergySource;
  monthlyEnergyUsage: number; // kWh
  dietType: DietType;
}

/**
 * Detailed carbon input with all categories
 * Used by the full calculator wizard
 */
export interface DetailedCarbonInput {
  // Home Energy
  monthlyElectricity?: number; // kWh
  monthlyLpgCylinders?: number; // Number of 14.2 kg cylinders
  monthlyNaturalGasCubicMeters?: number; // SCM
  electricityRegion?: string;

  // Transportation - Personal Vehicle
  vehicleType?: string; // 'TWO_WHEELER' | 'HATCHBACK' | 'SEDAN' | 'SUV' | 'DIESEL' | 'CNG' | 'HYBRID' | 'ELECTRIC'
  weeklyVehicleKm?: number;

  // Transportation - Public Transit & Flights
  monthlyTransitKm?: number;
  transitType?: string; // 'BUS' | 'TRAIN' | 'METRO'
  annualFlights?: {
    short?: number; // short-haul trips
    medium?: number; // medium-haul trips
    long?: number; // long-haul trips
  };

  // Diet
  dietType?: DietType;

  // Goods & Services
  monthlySpending?: number; // Currency amount
  spendingLevel?: 'CONSERVATIVE' | 'LIBERAL';

  // Household
  householdSize?: number;
}

/**
 * Carbon calculation result
 * All values in kg CO2e per month unless otherwise specified
 */
export interface CarbonCalculationResult {
  // Totals
  monthlyTotal: number; // kg CO₂e
  annualTotal: number; // kg CO₂e
  monthlyPerCapita?: number; // kg CO₂e per person (if householdSize provided)

  // Detailed breakdown
  breakdown: {
    homeEnergy: number;
    transportation: number;
    diet: number;
    goodsServices: number;
  };

  // Metadata
  estimate: number; // Same as monthlyTotal - the primary field for storage
  details?: Record<string, unknown>; // Additional breakdown data
}

/**
 * Database record for carbon_logs table
 * Unified schema matching our database
 */
export interface CarbonLogRecord {
  id?: string;
  user_id: string;
  commute_mode: CommuteMode;
  weekly_miles?: number; // Deprecated - use weeklyKm
  home_energy: HomeEnergySource;
  monthly_energy_usage: number; // kWh
  diet: DietType;
  estimate: number; // kg CO2e
  details?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

/**
 * Quick log record for quick_logs table
 * Simplified emissions tracking
 */
export interface QuickLogRecord {
  id?: string;
  user_id: string;
  emission: number; // kg CO2e
  description: string;
  type: 'transport' | 'diet' | 'energy' | 'goods' | 'custom';
  created_at?: string;
}
