import { NextRequest } from 'next/server';
import { calculateCarbonFootprint, type CalculatorInputs } from '@/lib/calculator';
import {
  DetailedCarbonInputSchema,
  SimpleCarbonInputSchema,
  type DetailedCarbonInput,
  type SimpleCarbonInput,
  type CarbonCalculationResult,
} from '@/lib/carbon/schema';
import {
  parseRequestBody,
  validateRequestBody,
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

    // Determine calculation type and validate
    const bodyObj = body as Record<string, unknown>;
    const calcType = bodyObj.type as string | undefined;

    let calculatorInputs: CalculatorInputs;

    if (calcType === 'SIMPLE') {
      // Simple calculation type
      const validation = validateRequestBody(bodyObj.input, SimpleCarbonInputSchema);
      if (validation.response) return validation.response;
      calculatorInputs = simpleInputToCalculatorInput(validation.data as SimpleCarbonInput);
    } else if (calcType === 'DETAILED' || !calcType) {
      // Detailed calculation type (default if not specified)
      const validation = validateRequestBody(
        bodyObj.input || body,
        DetailedCarbonInputSchema
      );
      if (validation.response) return validation.response;
      calculatorInputs = detailedInputToCalculatorInput(validation.data as DetailedCarbonInput);
    } else {
      return createErrorResponse(400, 'Bad Request', 'Invalid calculation type. Expected: SIMPLE or DETAILED');
    }

    // Calculate carbon footprint using the core calculation engine
    const calcResult = calculateCarbonFootprint(calculatorInputs);

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
