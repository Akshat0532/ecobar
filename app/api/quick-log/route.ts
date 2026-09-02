/**
 * POST /api/quick-log
 * Quick carbon emission logging
 * Requires authentication via Authorization header
 */

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  getAuthenticatedUser,
  parseRequestBody,
  validateRequestBody,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/auth/getAuthenticatedUser';
import { QuickLogInputSchema, type QuickLogInput } from '@/lib/carbon/schema';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult.user) {
      return authResult.response!;
    }
    const user = authResult.user;

    // 2. Parse and validate request body
    const body = await parseRequestBody(request);
    if (body === null) {
      return createErrorResponse(400, 'Bad Request', 'Invalid JSON in request body');
    }

    const validation = validateRequestBody(body, QuickLogInputSchema);
    if (validation.response) return validation.response;
    const logData = validation.data as QuickLogInput;

    // 3. Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // 4. Insert into database
    const { error: dbError } = await supabase.from('quick_logs').insert({
      user_id: user.id,
      emission: logData.emission,
      description: logData.description,
      type: logData.type,
    });

    if (dbError) {
      console.error('[POST /api/quick-log] Database error:', dbError);
      return createErrorResponse(
        500,
        'Database Error',
        'Failed to save quick log',
        dbError.message
      );
    }

    // 5. Return success
    return createSuccessResponse(
      {
        success: true,
        message: 'Quick log saved successfully',
        userId: user.id,
      },
      201
    );
  } catch (error) {
    console.error('[POST /api/quick-log] Error:', error);
    return createErrorResponse(
      500,
      'Internal Server Error',
      'Failed to save quick log'
    );
  }
}
