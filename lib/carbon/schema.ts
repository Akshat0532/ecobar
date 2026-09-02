/**
 * Zod validation schemas for carbon inputs
 * Single source of truth for validating user inputs
 */

import { z } from 'zod';

// ============ Base Types ============

export const CommuteModeSchema = z.enum(['car', 'two_wheeler', 'transit', 'bike', 'remote']);
export type CommuteMode = z.infer<typeof CommuteModeSchema>;

export const HomeEnergySourceSchema = z.enum(['electricity', 'lpg', 'natural_gas', 'mixed']);
export type HomeEnergySource = z.infer<typeof HomeEnergySourceSchema>;

export const DietTypeSchema = z.enum(['vegan', 'vegetarian', 'eggetarian', 'balanced', 'meat_heavy']);
export type DietType = z.infer<typeof DietTypeSchema>;

export const VehicleTypeSchema = z.enum(['TWO_WHEELER', 'HATCHBACK', 'SEDAN', 'SUV', 'DIESEL', 'CNG', 'HYBRID', 'ELECTRIC']);
export type VehicleType = z.infer<typeof VehicleTypeSchema>;

export const TransitTypeSchema = z.enum(['BUS', 'TRAIN', 'METRO']);
export type TransitType = z.infer<typeof TransitTypeSchema>;

// ============ Simple Carbon Input ============

export const SimpleCarbonInputSchema = z.object({
  commuteMode: CommuteModeSchema,
  weeklyKm: z.number().min(0).max(10000).describe('Weekly commute distance in kilometers'),
  homeEnergySource: HomeEnergySourceSchema,
  monthlyEnergyUsage: z.number().min(0).max(5000).describe('Monthly energy usage (kWh for electricity/mixed, cylinders for LPG, SCM for natural gas)'),
  dietType: DietTypeSchema,
});

export type SimpleCarbonInput = z.infer<typeof SimpleCarbonInputSchema>;

// ============ Detailed Carbon Input (Full Calculator) ============

export const DetailedCarbonInputSchema = z.object({
  // Home Energy
  monthlyElectricity: z.number().min(0).max(5000).optional().describe('kWh per month'),
  monthlyLpgCylinders: z.number().min(0).max(50).optional().describe('14.2kg cylinders per month'),
  monthlyPngScm: z.number().min(0).max(100).optional().describe('PNG/Natural Gas in Standard Cubic Meters per month'),
  // Alias for backward compatibility
  monthlyNaturalGasCubicMeters: z.number().min(0).max(100).optional().describe('Alias for monthlyPngScm'),
  electricityRegion: z.string().optional(),

  // Transportation - Personal Vehicle
  vehicleType: VehicleTypeSchema.optional(),
  weeklyVehicleKm: z.number().min(0).max(10000).optional().describe('km per week'),

  // Transportation - Public Transit
  monthlyTransitKm: z.number().min(0).max(20000).optional().describe('km per month'),
  transitType: TransitTypeSchema.optional(),

  // Flights
  annualFlights: z
    .object({
      short: z.number().min(0).max(100).optional(),
      medium: z.number().min(0).max(100).optional(),
      long: z.number().min(0).max(100).optional(),
    })
    .optional(),

  // Diet
  dietType: DietTypeSchema.optional(),

  // Goods & Services
  monthlySpending: z.number().min(0).max(10000000).optional().describe('Currency amount'),
  spendingLevel: z.enum(['CONSERVATIVE', 'LIBERAL']).optional(),

  // Household
  householdSize: z.number().min(1).max(20).optional(),
}).transform((data) => {
  // Normalize: prefer monthlyPngScm but accept monthlyNaturalGasCubicMeters
  if (!data.monthlyPngScm && data.monthlyNaturalGasCubicMeters) {
    data.monthlyPngScm = data.monthlyNaturalGasCubicMeters;
  }
  return data;
});

export type DetailedCarbonInput = z.infer<typeof DetailedCarbonInputSchema>;

// ============ Quick Log Input ============

export const QuickLogInputSchema = z.object({
  emission: z.number().min(0).max(1000000).describe('kg CO2e emitted'),
  description: z.string().min(1).max(500).describe('What was the activity'),
  type: z.enum(['transport', 'diet', 'energy', 'goods', 'custom']),
});

export type QuickLogInput = z.infer<typeof QuickLogInputSchema>;

// ============ API Request/Response ============

/**
 * POST /api/carbon body
 */
export const CalculateCarbonRequestSchema = z.union([
  z.object({
    type: z.literal('SIMPLE'),
    input: SimpleCarbonInputSchema,
  }),
  z.object({
    type: z.literal('DETAILED'),
    input: DetailedCarbonInputSchema,
  }),
]);

export type CalculateCarbonRequest = z.infer<typeof CalculateCarbonRequestSchema>;

/**
 * Carbon calculation result
 * Canonical response matching calculateCarbonFootprint() plus storage fields
 */
export const CarbonCalculationResultSchema = z.object({
  monthlyTotal: z.number().describe('kg CO₂e per month'),
  annualTotal: z.number().describe('kg CO₂e per year'),
  monthlyPerCapita: z.number().describe('kg CO₂e per person/month'),
  annualPerCapita: z.number().describe('kg CO₂e per person/year'),
  homeEnergy: z.object({
    electricity: z.number(),
    lpg: z.number(),
    png: z.number(),
    total: z.number(),
  }),
  transportation: z.object({
    personalVehicle: z.number(),
    publicTransit: z.number(),
    flights: z.number(),
    total: z.number(),
  }),
  diet: z.number().describe('kg CO₂e per month'),
  goodsServices: z.number().describe('kg CO₂e per month'),
  comparison: z.object({
    vsIndiaAverage: z.number(),
    vsWorldAverage: z.number(),
    vsParisTarget: z.number(),
  }),
  treesEquivalent: z.number(),
  insight: z.string(),

  // Storage and compatibility fields (estimate = monthlyTotal)
  estimate: z.number().describe('Alias for monthlyTotal - used for database storage'),
  breakdown: z.object({
    homeEnergy: z.number(),
    transportation: z.number(),
    diet: z.number(),
    goodsServices: z.number(),
  }).optional(),
  details: z.record(z.unknown()).optional(),
});

export type CarbonCalculationResult = z.infer<typeof CarbonCalculationResultSchema>;

// ============ Database Record Schemas ============

/**
 * Carbon log record validation
 */
export const CarbonLogRecordSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  commute_mode: CommuteModeSchema,
  weekly_miles: z.number().min(0).optional(),
  home_energy: HomeEnergySourceSchema,
  monthly_energy_usage: z.number().min(0).max(5000),
  diet: DietTypeSchema,
  estimate: z.number().min(0),
  details: z.record(z.unknown()).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type CarbonLogRecord = z.infer<typeof CarbonLogRecordSchema>;

/**
 * Quick log record validation
 */
export const QuickLogRecordSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  emission: z.number().min(0).max(1000000),
  description: z.string().min(1).max(500),
  type: z.enum(['transport', 'diet', 'energy', 'goods', 'custom']),
  created_at: z.string().datetime().optional(),
});

export type QuickLogRecord = z.infer<typeof QuickLogRecordSchema>;
