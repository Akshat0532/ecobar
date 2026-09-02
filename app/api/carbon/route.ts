import { NextRequest } from 'next/server';
import { calculateCarbonFootprint, type CalculatorInputs } from '@/lib/calculator';
import {
  DetailedCarbonInputSchema,
  SimpleCarbonInputSchema,
  type DetailedCarbonInput,
  type SimpleCarbonInput,
} from '@/lib/carbon/schema';
import {
  parseRequestBody,
  validateRequestBody,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/auth/getAuthenticatedUser';

/**
 * Normalize schema input to calculator input
 * Converts lowercase diet types to uppercase for calculator compatibility
 */
function normalizeToCalculatorInput(schemaInput: DetailedCarbonInput | SimpleCarbonInput): CalculatorInputs {
  const normalized = { ...schemaInput } as CalculatorInputs;
  
  // Normalize dietType to uppercase if present
  if ('dietType' in normalized && normalized.dietType) {
    normalized.dietType = (normalized.dietType as string).toUpperCase() as CalculatorInputs['dietType'];
  }
  
  return normalized;
}

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

    let inputs: DetailedCarbonInput | SimpleCarbonInput;

    if (calcType === 'SIMPLE') {
      // Simple calculation type
      const validation = validateRequestBody(bodyObj.input, SimpleCarbonInputSchema);
      if (validation.response) return validation.response;
      inputs = validation.data as SimpleCarbonInput;
    } else if (calcType === 'DETAILED' || !calcType) {
      // Detailed calculation type (default if not specified)
      const validation = validateRequestBody(
        bodyObj.input || body,
        DetailedCarbonInputSchema
      );
      if (validation.response) return validation.response;
      inputs = validation.data as DetailedCarbonInput;
    } else {
      return createErrorResponse(400, 'Bad Request', 'Invalid calculation type. Expected: SIMPLE or DETAILED');
    }

    // Normalize input for calculator compatibility
    const calculatorInputs = normalizeToCalculatorInput(inputs);

    // Calculate carbon footprint
    const result = calculateCarbonFootprint(calculatorInputs);

    // Return result
    return createSuccessResponse(result);
  } catch (error) {
    console.error('[POST /api/carbon] Error:', error);
    return createErrorResponse(
      500,
      'Internal Server Error',
      'Failed to calculate carbon footprint'
    );
  }
}
