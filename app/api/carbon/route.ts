import { NextRequest } from 'next/server';
import { calculateCarbonFootprint } from '@/lib/calculator';
import {
  CalculateCarbonRequestSchema,
  type CarbonCalculationResult,
} from '@/lib/carbon/schema';
import {
  parseRequestBody,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/auth/getAuthenticatedUser';
import {
  simpleInputToCalculatorInput,
  detailedInputToCalculatorInput,
} from '@/lib/carbon/adapter';

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await parseRequestBody(req);
    if (body === null) {
      return createErrorResponse(400, 'Bad Request', 'Invalid JSON in request body');
    }

    const validation = CalculateCarbonRequestSchema.safeParse(body);
    if (!validation.success) {
      return createErrorResponse(400, 'Bad Request', 'Invalid carbon calculation request', validation.error.flatten());
    }

    // Calculate carbon footprint using the core calculation engine
    const calcResult = validation.data.type === 'SIMPLE'
      ? calculateCarbonFootprint(simpleInputToCalculatorInput(validation.data.input))
      : calculateCarbonFootprint(detailedInputToCalculatorInput(validation.data.input));

    // Build canonical response payload matching CarbonCalculationResult
    // Explicitly defining estimate = monthlyTotal for database storage compatibility
    const responsePayload: CarbonCalculationResult = {
      ...calcResult,
      estimate: calcResult.monthlyTotal,
      breakdown: {
        homeEnergy: calcResult.homeEnergy.total,
        transportation: calcResult.transportation.total,
        diet: calcResult.diet,
        goodsServices: calcResult.goodsServices,
      },
    };

    return createSuccessResponse(responsePayload);
  } catch (error) {
    console.error('[POST /api/carbon] Error:', error);
    return createErrorResponse(
      500,
      'Internal Server Error',
      'Failed to calculate carbon footprint'
    );
  }
}
