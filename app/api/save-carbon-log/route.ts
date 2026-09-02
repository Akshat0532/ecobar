/**
 * POST /api/save-carbon-log
 * Save a calculated carbon log to the database
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
import { CarbonLogRecordSchema, type CarbonLogRecord } from '@/lib/carbon/schema';

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

    // Validate using our schema (with user_id injected)
    const bodyWithUserId = {
      ...body,
      user_id: user.id,
    };
    const validation = validateRequestBody(bodyWithUserId, CarbonLogRecordSchema);
    if (validation.response) return validation.response;
    const logRecord = validation.data as CarbonLogRecord;

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
    const weeklyMiles = logRecord.weekly_miles ?? (
      logRecord.details && typeof logRecord.details === 'object' && 'weeklyKm' in logRecord.details && typeof logRecord.details.weeklyKm === 'number'
        ? Math.round(logRecord.details.weeklyKm / 1.60934)
        : 0
    );

    const { error: dbError } = await supabase.from('carbon_logs').insert({
      user_id: logRecord.user_id,
      commute_mode: logRecord.commute_mode,
      weekly_miles: weeklyMiles,
      home_energy: logRecord.home_energy,
      monthly_energy_usage: logRecord.monthly_energy_usage,
      diet: logRecord.diet,
      estimate: logRecord.estimate,
      details: logRecord.details || null,
    });

    if (dbError) {
      console.error('[POST /api/save-carbon-log] Database error:', dbError);
      return createErrorResponse(
        500,
        'Database Error',
        'Failed to save carbon log',
        dbError.message
      );
    }

    // 5. Return success
    return createSuccessResponse(
      {
        success: true,
        message: 'Carbon log saved successfully',
        userId: user.id,
      },
      201
    );
  } catch (error) {
    console.error('[POST /api/save-carbon-log] Error:', error);
    return createErrorResponse(
      500,
      'Internal Server Error',
      'Failed to save carbon log'
    );
  }
}
