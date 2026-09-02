export interface CarbonLog {
  id: string;
  user_id: string;
  estimate: number;
  commute_mode: string | null;
  diet: string | null;
  home_energy: string | null;
  details: unknown;
  created_at: string;
}

export interface DashboardData {
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

/**
 * Safely parse log details which may be a JSON object, a JSON string, or null
 */
export function parseLogDetails(details: unknown): Record<string, any> | null {
  if (!details) return null;
  if (typeof details === 'object' && details !== null) return details as Record<string, any>;
  if (typeof details === 'string') {
    try {
      return JSON.parse(details);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Fallback categorization for legacy records without detailed breakdown in `details`.
 * Avoids classifying complete calculations entirely as 'travel' just because commute_mode exists.
 */
export function categorizeLogFallback(log: CarbonLog): 'home' | 'travel' | 'diet' | 'goods' {
  const commute = log.commute_mode?.toLowerCase();
  const hasCommute = commute && ['car', 'two_wheeler', 'transit'].includes(commute);
  const isZeroCommute = commute && ['bike', 'remote'].includes(commute);
  const hasHome = log.home_energy && ['electricity', 'natural_gas', 'lpg', 'mixed'].includes(log.home_energy.toLowerCase());
  const hasDiet = log.diet && ['vegan', 'vegetarian', 'eggetarian', 'balanced', 'meat_heavy'].includes(log.diet.toLowerCase());

  // Single-category log
  if (hasCommute && !hasHome && !hasDiet) return 'travel';
  if (hasHome && !hasCommute && !hasDiet) return 'home';
  if (hasDiet && !hasCommute && !hasHome) return 'diet';

  // If commute was zero-emission (bike/remote), do not categorize as travel
  if (isZeroCommute && hasHome) return 'home';
  if (isZeroCommute && hasDiet) return 'diet';

  // Multi-category legacy log without details: attribute to dominant category (home energy typically highest)
  if (hasHome) return 'home';
  if (hasCommute) return 'travel';
  if (hasDiet) return 'diet';

  return 'goods';
}

/**
 * Aggregate carbon logs into dashboard metrics
 * Uses saved `details` breakdown when available to populate categories accurately.
 */
export function aggregateDashboardData(logs: CarbonLog[]): DashboardData {
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
  const monthlyData: Record<
    string,
    { total: number; breakdown: { home: number; travel: number; diet: number; goods: number } }
  > = {};

  logs.forEach((log) => {
    const date = new Date(log.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        total: 0,
        breakdown: { home: 0, travel: 0, diet: 0, goods: 0 },
      };
    }

    const logEstimate = log.estimate || 0;
    monthlyData[monthKey].total += logEstimate;

    // Check if log contains a detailed category breakdown in details
    const parsed = parseLogDetails(log.details);
    const hasDetailedBreakdown =
      parsed &&
      (parsed.transportation !== undefined ||
        parsed.homeEnergy !== undefined ||
        parsed.diet !== undefined ||
        parsed.goodsServices !== undefined ||
        parsed.transport !== undefined ||
        parsed.home !== undefined ||
        parsed.food !== undefined ||
        parsed.goods !== undefined);

    if (hasDetailedBreakdown) {
      // Use the actual category breakdown saved in details
      const travelVal =
        Number(
          parsed.transportation?.total ??
            parsed.transportation ??
            parsed.transport?.total ??
            parsed.transport ??
            0
        ) || 0;
      const homeVal =
        Number(
          parsed.homeEnergy?.total ??
            parsed.homeEnergy ??
            parsed.home?.total ??
            parsed.home ??
            0
        ) || 0;
      const dietVal =
        Number(
          parsed.diet?.total ??
            parsed.diet ??
            parsed.food?.total ??
            parsed.food ??
            0
        ) || 0;
      const goodsVal =
        Number(
          parsed.goodsServices?.total ??
            parsed.goodsServices ??
            parsed.goods?.total ??
            parsed.goods ??
            0
        ) || 0;

      monthlyData[monthKey].breakdown.travel += travelVal;
      monthlyData[monthKey].breakdown.home += homeVal;
      monthlyData[monthKey].breakdown.diet += dietVal;
      monthlyData[monthKey].breakdown.goods += goodsVal;
    } else {
      // Fallback for legacy logs without details: categorize into single category without falsely marking all as travel
      const fallbackCat = categorizeLogFallback(log);
      monthlyData[monthKey].breakdown[fallbackCat] += logEstimate;
    }
  });

  // Convert to sorted array
  const sortedMonths = Object.keys(monthlyData).sort();
  const monthlyTrend = sortedMonths.map((month) => ({
    month: formatMonth(month),
    footprint: Math.round((monthlyData[month].total || 0) * 100) / 100,
  }));

  // Current and previous month
  const currentMonth =
    sortedMonths.length > 0
      ? Math.round((monthlyData[sortedMonths[sortedMonths.length - 1]].total || 0) * 100) / 100
      : 0;

  const previousMonth =
    sortedMonths.length > 1
      ? Math.round((monthlyData[sortedMonths[sortedMonths.length - 2]].total || 0) * 100) / 100
      : 0;

  // Get breakdown from current month
  const currentBreakdown =
    sortedMonths.length > 0
      ? monthlyData[sortedMonths[sortedMonths.length - 1]].breakdown
      : { home: 0, travel: 0, diet: 0, goods: 0 };

  const breakdown = {
    home: Math.round((currentBreakdown.home || 0) * 100) / 100,
    travel: Math.round((currentBreakdown.travel || 0) * 100) / 100,
    diet: Math.round((currentBreakdown.diet || 0) * 100) / 100,
    goods: Math.round((currentBreakdown.goods || 0) * 100) / 100,
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
 * Format month key (YYYY-MM) to readable format
 */
export function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}
