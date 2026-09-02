/**
 * POST /api/send-monthly-report
 * Generates and sends monthly sustainability report email for authenticated user
 * SECURITY: Uses authenticated user's ID from Authorization token, NOT client-provided userId
 *
 * Usage:
 * ```
 * POST /api/send-monthly-report
 * Authorization: Bearer <access_token>
 * ```
 */

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  getAuthenticatedUser,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/auth/getAuthenticatedUser';
import { generateMonthlyReportEmail, generateMonthlyReportEmailText, type EmailReportData } from '@/lib/emailTemplate';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user - ONLY from Authorization header
    const authResult = await getAuthenticatedUser(request);
    if (!authResult.user) {
      return authResult.response!;
    }
    const authenticatedUser = authResult.user;
    const userId = authenticatedUser.id;

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

    // 3. Fetch user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('[POST /api/send-monthly-report] Profile fetch error:', profileError);
      return createErrorResponse(
        500,
        'Database Error',
        'Failed to fetch user profile'
      );
    }

    // 4. Fetch last two months of carbon logs
    const startOfLastMonth = getStartOfMonth(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    const startOfCurrentMonth = getStartOfMonth(new Date());

    const { data: currentLogs, error: currentLogsError } = await supabase
      .from('carbon_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startOfCurrentMonth.toISOString())
      .lt('created_at', new Date().toISOString());

    if (currentLogsError) {
      console.error('[POST /api/send-monthly-report] Current logs fetch error:', currentLogsError);
      return createErrorResponse(
        500,
        'Database Error',
        'Failed to fetch carbon logs'
      );
    }

    const { data: previousLogs, error: previousLogsError } = await supabase
      .from('carbon_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startOfLastMonth.toISOString())
      .lt('created_at', startOfCurrentMonth.toISOString());

    if (previousLogsError) {
      console.error('[POST /api/send-monthly-report] Previous logs fetch error:', previousLogsError);
      return createErrorResponse(
        500,
        'Database Error',
        'Failed to fetch previous logs'
      );
    }

    // 5. Calculate metrics (using 'estimate' field from database)
    const currentMonth = (currentLogs || []).reduce((sum, log) => sum + (log.estimate || 0), 0);
    const previousMonth = (previousLogs || []).reduce((sum, log) => sum + (log.estimate || 0), 0);
    const percentChange =
      previousMonth > 0 ? ((previousMonth - currentMonth) / previousMonth) * 100 : 0;

    // 6. Find top emission category
    const categoryTotals: Record<string, number> = {};
    (currentLogs || []).forEach((log) => {
      const category = log.diet || 'other';
      categoryTotals[category] = (categoryTotals[category] || 0) + (log.estimate || 0);
    });

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    const topEmissionCategory = {
      name: topCategory?.[0] || 'General',
      value: topCategory?.[1] || 0,
      percentage: currentMonth > 0 && topCategory ? (topCategory[1] / currentMonth) * 100 : 0,
    };

    // 7. Count green actions from quick_logs
    const { data: quickLogs, error: quickLogsError } = await supabase
      .from('quick_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startOfCurrentMonth.toISOString());

    if (quickLogsError) {
      console.warn('[POST /api/send-monthly-report] Quick logs fetch error:', quickLogsError);
    }

    const totalGreenActions = (quickLogs || []).length;

    // 8. Calculate trees equivalent (1 tree removes ~20 kg CO2e/year)
    const annualProjection = currentMonth * 12;
    const treesEquivalent = Math.round(annualProjection / 20);

    // 9. Generate report data
    const reportData: EmailReportData = {
      userName: profile?.full_name || authenticatedUser.email?.split('@')[0] || 'User',
      userEmail: authenticatedUser.email || '',
      currentMonth: Math.round(currentMonth * 100) / 100, // Round to 2 decimals
      previousMonth: Math.round(previousMonth * 100) / 100,
      percentChange: Math.round(percentChange * 100) / 100,
      topCategory: topEmissionCategory,
      topAction: generateTopActionInsight(topEmissionCategory.name, currentMonth),
      treesEquivalent,
      greenActionsCount: totalGreenActions,
      monthName: new Date().toLocaleDateString('en-US', { month: 'long' }),
      yearMonth: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      }),
    };

    // 10. Generate email content
    const htmlEmail = generateMonthlyReportEmail(reportData);
    const textEmail = generateMonthlyReportEmailText(reportData);

    // TODO: In production, integrate with email service (Resend, SendGrid, etc.)
    // For now, return generated email content for the client to handle
    return createSuccessResponse({
      success: true,
      message: 'Monthly report generated successfully',
      email: {
        to: reportData.userEmail,
        subject: `Your ${reportData.monthName} Sustainability Report`,
        html: htmlEmail,
        text: textEmail,
      },
      metrics: reportData,
    });
  } catch (error) {
    console.error('[POST /api/send-monthly-report] Error:', error);
    return createErrorResponse(
      500,
      'Internal Server Error',
      'Failed to generate monthly report'
    );
  }
}

/**
 * Get start of month for a given date
 */
function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Generate contextual insight based on top emission category
 */
function generateTopActionInsight(categoryName: string, currentEmissions: number): string {
  const insights: Record<string, string> = {
    electricity: `Your electricity usage is a major contributor. Switching to a renewable energy plan or improving insulation could save ~${Math.round(
      currentEmissions * 0.15
    )} kg CO₂e monthly.`,
    lpg: `LPG usage is contributing significantly. Consider electric or renewable alternatives.`,
    natural_gas: `Your gas usage is substantial. Improving home insulation and switching to electric heating could help.`,
    car: `Transportation is your biggest footprint. Trying alternatives like carpooling, public transit, or one remote work day per week could reduce this by 20-30%.`,
    two_wheeler: `Vehicle emissions are significant. Electric two-wheelers could reduce this impact.`,
    transit: `Public transit is great! Encourage others to switch from personal vehicles.`,
    bike: `Great job! Biking is one of the lowest-carbon ways to travel.`,
    remote: `Remote work significantly reduces carbon emissions. Keep it up!`,
    vegan: `Plant-based diet is excellent for the environment! Keep up the great work.`,
    vegetarian: `Vegetarian diet is a great choice. Consider plant-based meals for even more impact.`,
    balanced: `Adding 1-2 plant-based days per week could save ~${Math.round(
      currentEmissions * 0.12
    )} kg CO₂e monthly.`,
    meat_heavy: `Meat consumption drives significant emissions. Reducing meat intake or trying Meatless Mondays could reduce this by 20-30%.`,
    general: `Every action counts. Track your daily choices to find the biggest opportunities for improvement.`,
  };

  return insights[categoryName.toLowerCase()] || insights.general;
}
