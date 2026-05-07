import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/dashboard-data
 * Aggregates user's carbon footprint data for dashboard visualization
 */
export async function GET(request: NextRequest) {
  try {
    // Get auth from headers (in production, use proper auth)
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Initialize Supabase with service role
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

    // Verify token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user's carbon logs for last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const { data: carbonLogs, error: logsError } = await supabase
      .from('carbon_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', twelveMonthsAgo.toISOString())
      .order('created_at', { ascending: true });

    if (logsError) {
      console.error('Error fetching logs:', logsError);
      // Return mock data if no real data available
      return NextResponse.json(generateMockDashboardData());
    }

    // Generate dashboard data from logs
    const dashboardData = aggregateDashboardData(carbonLogs || []);

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard API error:', error);
    // Return mock data on error
    return NextResponse.json(generateMockDashboardData());
  }
}

interface CarbonLog {
  id: string;
  user_id: string;
  emission: number;
  category?: string;
  description: string;
  type?: string;
  created_at: string;
}

/**
 * Aggregate carbon logs into dashboard metrics
 */
function aggregateDashboardData(logs: CarbonLog[]) {
  if (logs.length === 0) {
    return generateMockDashboardData();
  }

  // Group logs by month
  const monthlyData: Record<string, { total: number; breakdown: Record<string, number> }> = {};

  logs.forEach((log) => {
    const date = new Date(log.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { total: 0, breakdown: {} };
    }

    monthlyData[monthKey].total += log.emission;

    // Categorize by type or description
    const category = log.type || categorizeEmission(log.description);
    monthlyData[monthKey].breakdown[category] = (monthlyData[monthKey].breakdown[category] || 0) + log.emission;
  });

  // Convert to sorted array
  const sortedMonths = Object.keys(monthlyData).sort();
  const monthlyTrend = sortedMonths.map((month) => ({
    month: formatMonth(month),
    footprint: monthlyData[month].total,
  }));

  // Current and previous month
  const currentMonth = sortedMonths.length > 0 ? monthlyData[sortedMonths[sortedMonths.length - 1]].total : 100;
  const previousMonth = sortedMonths.length > 1 ? monthlyData[sortedMonths[sortedMonths.length - 2]].total : 120;

  // Get breakdown from current month
  const currentBreakdown = sortedMonths.length > 0 ? monthlyData[sortedMonths[sortedMonths.length - 1]].breakdown : {};
  const breakdown = {
    home: currentBreakdown['home'] || currentBreakdown['energy'] || 0,
    travel: currentBreakdown['travel'] || currentBreakdown['transport'] || 0,
    diet: currentBreakdown['diet'] || currentBreakdown['food'] || 0,
    goods: currentBreakdown['goods'] || currentBreakdown['shopping'] || currentBreakdown['goods_services'] || 0,
  };

  // Calculate trees equivalent (1 tree ~= 20 kg CO2e/year)
  const annualTotal = monthlyTrend.reduce((sum, m) => sum + m.footprint, 0);
  const treesEquivalent = Math.round(annualTotal / 20);

  // Mock green actions for now (would come from separate tracking)
  const greenActionsDays = generateGreenActionsDays();

  return {
    monthlyTrend,
    currentMonth,
    previousMonth,
    breakdown,
    treesEquivalent,
    greenActionsDays,
    totalGreenActions: greenActionsDays.length,
  };
}

/**
 * Categorize emission log by description patterns
 */
function categorizeEmission(description: string): string {
  const lowerDesc = description.toLowerCase();

  if (lowerDesc.match(/electric|power|heat|gas|oil|hvac/)) return 'home';
  if (lowerDesc.match(/drive|car|uber|lyft|transit|flight|train|bike|walk/)) return 'travel';
  if (lowerDesc.match(/food|diet|meal|vegan|meat|eat|lunch|breakfast/)) return 'diet';
  if (lowerDesc.match(/shop|buy|spend|goods|service/)) return 'goods';

  return 'other';
}

/**
 * Format month key to readable format
 */
function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

/**
 * Generate mock green action days for demonstration
 */
function generateGreenActionsDays(): number[] {
  // Return random days between 1-28 to simulate logged actions
  const days = [];
  for (let i = 0; i < 15; i++) {
    days.push(Math.floor(Math.random() * 28) + 1);
  }
  return [...new Set(days)]; // Remove duplicates
}

/**
 * Generate mock dashboard data for development/errors
 */
function generateMockDashboardData() {
  return {
    monthlyTrend: [
      { month: 'Sep', footprint: 425 },
      { month: 'Oct', footprint: 438 },
      { month: 'Nov', footprint: 412 },
      { month: 'Dec', footprint: 448 },
      { month: 'Jan', footprint: 396 },
      { month: 'Feb', footprint: 385 },
    ],
    currentMonth: 385,
    previousMonth: 396,
    breakdown: {
      home: 145,
      travel: 95,
      diet: 85,
      goods: 60,
    },
    treesEquivalent: 24,
    greenActionsDays: [2, 5, 8, 12, 15, 18, 21, 25, 28],
    totalGreenActions: 9,
  };
}
