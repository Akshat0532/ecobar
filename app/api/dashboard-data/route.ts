/**
 * GET /api/dashboard-data
 * Aggregates user's carbon footprint data for dashboard visualization
 * Requires authentication via Authorization header
 *
 * Usage:
 * ```
 * GET /api/dashboard-data
 * Authorization: Bearer <access_token>
 * ```
 *
 * Response: Dashboard metrics including monthly trend, breakdown by category, and green actions
 */

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  getAuthenticatedUser,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/auth/getAuthenticatedUser';
import { aggregateDashboardData } from '@/lib/carbon/dashboard';

export const dynamic = 'force-dynamic';

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

    // 3. Fetch user's carbon logs for last 12 months including details
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const { data: carbonLogs, error: logsError } = await supabase
      .from('carbon_logs')
      .select('id, user_id, estimate, commute_mode, diet, home_energy, details, created_at')
      .eq('user_id', userId)
      .gte('created_at', twelveMonthsAgo.toISOString())
      .order('created_at', { ascending: true });

    if (logsError) {
      console.error('[GET /api/dashboard-data] Database error:', logsError);
      return createErrorResponse(
        500,
        'Database Error',
        'Failed to fetch carbon logs',
        logsError.message
      );
    }

    // 4. Generate dashboard data from logs
    const dashboardData = aggregateDashboardData(carbonLogs || []);

    // 5. Fetch quick logs for green actions count
    const { data: quickLogs, error: quickLogsError } = await supabase
      .from('quick_logs')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', twelveMonthsAgo.toISOString());

    if (!quickLogsError && quickLogs) {
      dashboardData.totalGreenActions = quickLogs.length;
    }

    return createSuccessResponse(dashboardData);
  } catch (error) {
    console.error('[GET /api/dashboard-data] Error:', error);
    return createErrorResponse(
      500,
      'Internal Server Error',
      'Failed to retrieve dashboard data'
    );
  }
}
