/**
 * GET /api/impact
 * Get user's carbon footprint impact data by month
 * Requires authentication via Authorization header
 *
 * Usage:
 * ```
 * GET /api/impact
 * Authorization: Bearer <access_token>
 * ```
 *
 * Response: Array of monthly impact data
 */

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  getAuthenticatedUser,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/auth/getAuthenticatedUser';

interface MonthlyImpact {
  month: string;
  footprint: number; // kg CO2e
}

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult.user) {
      return authResult.response!;
    }
    const userId = authResult.user.id;

    // 2. Initialize Supabase
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

    // 3. Fetch last 12 months of carbon logs
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const { data: carbonLogs, error: logsError } = await supabase
      .from('carbon_logs')
      .select('created_at, estimate')
      .eq('user_id', userId)
      .gte('created_at', twelveMonthsAgo.toISOString())
      .order('created_at', { ascending: true });

    if (logsError) {
      console.error('[GET /api/impact] Database error:', logsError);
      return createErrorResponse(
        500,
        'Database Error',
        'Failed to fetch carbon logs',
        logsError.message
      );
    }

    // 4. Aggregate by month
    const monthlyData: Record<string, number> = {};

    (carbonLogs || []).forEach((log) => {
      const date = new Date(log.created_at);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey] += log.estimate || 0;
    });

    // 5. Format response
    const result: MonthlyImpact[] = Object.entries(monthlyData)
      .sort((a, b) => {
        // Sort chronologically
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA.getTime() - dateB.getTime();
      })
      .map(([month, footprint]) => ({
        month,
        footprint: Math.round(footprint * 100) / 100,
      }));

    // 6. Return success
    return createSuccessResponse(result);
  } catch (error) {
    console.error('[GET /api/impact] Error:', error);
    return createErrorResponse(
      500,
      'Internal Server Error',
      'Failed to retrieve impact data'
    );
  }
}
