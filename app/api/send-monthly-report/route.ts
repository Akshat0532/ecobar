import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateMonthlyReportEmail, generateMonthlyReportEmailText, type EmailReportData } from '@/lib/emailTemplate';

/**
 * POST /api/send-monthly-report
 * Generates and sends monthly sustainability report email
 * 
 * Usage: Called by Resend/SendGrid integration or cron job
 * Body: { userId: string } or empty for authenticated user
 */
export async function POST(request: NextRequest) {
  try {
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

    // Parse request body
    let userId: string | null = null;
    try {
      const body = await request.json();
      userId = body.userId;
    } catch {
      // If no body, try to get from auth header
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const {
          data: { user },
        } = await supabase.auth.getUser(authHeader.substring(7));
        userId = user?.id || null;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Fetch user and profile
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Fetch last two months of carbon logs
    const startOfLastMonth = getStartOfMonth(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const startOfCurrentMonth = getStartOfMonth(new Date());

    const { data: currentLogs } = await supabase
      .from('carbon_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startOfCurrentMonth.toISOString())
      .lt('created_at', new Date().toISOString());

    const { data: previousLogs } = await supabase
      .from('carbon_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startOfLastMonth.toISOString())
      .lt('created_at', startOfCurrentMonth.toISOString());

    // Calculate metrics
    const currentMonth = (currentLogs || []).reduce((sum, log) => sum + (log.emission || 0), 0);
    const previousMonth = (previousLogs || []).reduce((sum, log) => sum + (log.emission || 0), 0);
    const percentChange = previousMonth > 0 ? ((previousMonth - currentMonth) / previousMonth) * 100 : 0;

    // Find top emission category
    const categoryTotals: Record<string, number> = {};
    (currentLogs || []).forEach((log) => {
      const category = log.type || 'general';
      categoryTotals[category] = (categoryTotals[category] || 0) + (log.emission || 0);
    });

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    const topEmissionCategory = {
      name: topCategory?.[0] || 'General',
      value: topCategory?.[1] || 0,
      percentage: topCategory ? (topCategory[1] / currentMonth) * 100 : 0,
    };

    // Count green actions
    const { data: quickLogs } = await supabase
      .from('quick_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startOfCurrentMonth.toISOString());

    const totalGreenActions = (quickLogs || []).length;

    // Calculate trees equivalent
    const annualProjection = currentMonth * 12;
    const treesEquivalent = Math.round(annualProjection / 20);

    // Generate report data
    const reportData: EmailReportData = {
      userName: profile?.full_name || user.email?.split('@')[0] || 'User',
      userEmail: user.email || '',
      currentMonth,
      previousMonth,
      percentChange,
      topCategory: topEmissionCategory,
      topAction: generateTopActionInsight(topEmissionCategory.name, currentMonth),
      treesEquivalent,
      greenActionsCount: totalGreenActions,
      monthName: new Date().toLocaleDateString('en-US', { month: 'long' }),
      yearMonth: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
    };

    // Generate email content
    const htmlEmail = generateMonthlyReportEmail(reportData);
    const textEmail = generateMonthlyReportEmailText(reportData);

    // In production, integrate with Resend or SendGrid
    // For now, just return the generated email content
    return NextResponse.json({
      success: true,
      email: {
        to: reportData.userEmail,
        subject: `Your ${reportData.monthName} Sustainability Report`,
        html: htmlEmail,
        text: textEmail,
      },
      metrics: reportData,
    });
  } catch (error) {
    console.error('Monthly report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
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
    home: `Your home energy is a major contributor. Switching to a renewable energy plan or improving insulation could save ~${Math.round(currentEmissions * 0.15)} kg CO₂e monthly.`,
    travel: `Transportation is your biggest footprint. Trying alternatives like carpooling, public transit, or one remote work day per week could reduce this by 20-30%.`,
    diet: `Your food choices are significant for your footprint. Adding two plant-based days per week could save ~${Math.round(currentEmissions * 0.12)} kg CO₂e.`,
    food: `Consider where your food comes from. Local and seasonal choices reduce transportation emissions. Meat-free meals are 2-3x less carbon-intensive.`,
    goods: `Consumer spending is carbon-intensive. Buying secondhand, repairing items, and choosing quality over quantity can reduce this category by 30-40%.`,
    general: `Every action counts. Track your daily choices to find the biggest opportunities for improvement.`,
  };

  return insights[categoryName.toLowerCase()] || insights.general;
}
