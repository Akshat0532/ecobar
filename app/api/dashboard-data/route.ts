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

interface CarbonLog {
  id: string;
  user_id: string;
  estimate: number;
  commute_mode: string | null;
  diet: string | null;
  home_energy: string | null;
  created_at: string;
}

interface DashboardData {
  monthlyTrend: Array<{ month: string; footprint: number }>;
  currentMonth: number;
  previousMonth: number;
  breakdown: {
    home: number;
    travel: number;
    diet: number;
    goods: number;
  };
  treesEquivalent: number;
  totalGreenActions: number;
  emptyState: boolean;
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

    // 3. Fetch user's carbon logs for last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const { data: carbonLogs, error: logsError } = await supabase
      .from('carbon_logs')
      .select('id, user_id, estimate, commute_mode, diet, home_energy, created_at')
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

/**
 * Aggregate carbon logs into dashboard metrics
 */
function aggregateDashboardData(logs: CarbonLog[]): DashboardData {
  // Empty state
  if (logs.length === 0) {
    return {
      monthlyTrend: [],
      currentMonth: 0,
      previousMonth: 0,
      breakdown: { home: 0, travel: 0, diet: 0, goods: 0 },
      treesEquivalent: 0,
      totalGreenActions: 0,
      emptyState: true,
    };
  }

  // Group logs by month
  const monthlyData: Record<string, { total: number; breakdown: Record<string, number> }> = {};

  logs.forEach((log) => {
    const date = new Date(log.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { total: 0, breakdown: {} };
    }

    monthlyData[monthKey].total += log.estimate || 0;

    // Categorize by emission type
    const category = categorizeLog(log);
    monthlyData[monthKey].breakdown[category] =
      (monthlyData[monthKey].breakdown[category] || 0) + (log.estimate || 0);
  });

  // Convert to sorted array
  const sortedMonths = Object.keys(monthlyData).sort();
  const monthlyTrend = sortedMonths.map((month) => ({
    month: formatMonth(month),
    footprint: Math.round((monthlyData[month].total || 0) * 100) / 100,
  }));

  // Current and previous month
  const currentMonth = sortedMonths.length > 0
    ? Math.round((monthlyData[sortedMonths[sortedMonths.length - 1]].total || 0) * 100) / 100
    : 0;

  const previousMonth =
    sortedMonths.length > 1
      ? Math.round((monthlyData[sortedMonths[sortedMonths.length - 2]].total || 0) * 100) / 100
      : 0;

  // Get breakdown from current month
  const currentBreakdown =
    sortedMonths.length > 0 ? monthlyData[sortedMonths[sortedMonths.length - 1]].breakdown : {};

  const breakdown = {
    home: Math.round((currentBreakdown['home'] || 0) * 100) / 100,
    travel: Math.round((currentBreakdown['travel'] || 0) * 100) / 100,
    diet: Math.round((currentBreakdown['diet'] || 0) * 100) / 100,
    goods: Math.round((currentBreakdown['goods'] || 0) * 100) / 100,
  };

  // Calculate trees equivalent (1 tree ~= 20 kg CO2e/year)
  const annualTotal = monthlyTrend.reduce((sum, m) => sum + m.footprint, 0);
  const treesEquivalent = Math.round(annualTotal / 20);

  return {
    monthlyTrend,
    currentMonth,
    previousMonth,
    breakdown,
    treesEquivalent,
    totalGreenActions: 0, // Will be updated by caller
    emptyState: false,
  };
}

/**
 * Categorize carbon log by its emission fields
 */
function categorizeLog(log: CarbonLog): string {
  // Check commute_mode first
  if (log.commute_mode) {
    const mode = log.commute_mode.toLowerCase();
    if (['car', 'two_wheeler', 'transit', 'bike', 'remote'].includes(mode)) {
      return 'travel';
    }
  }

  // Check diet
  if (log.diet) {
    const diet = log.diet.toLowerCase();
    if (['vegan', 'vegetarian', 'balanced', 'meat_heavy'].includes(diet)) {
      return 'diet';
    }
  }

  // Check home_energy
  if (log.home_energy) {
    const energy = log.home_energy.toLowerCase();
    if (['electricity', 'natural_gas', 'lpg'].includes(energy)) {
      return 'home';
    }
  }

  // Default to goods for other categories
  return 'goods';
}

/**
 * Format month key (YYYY-MM) to readable format
 */
function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}
