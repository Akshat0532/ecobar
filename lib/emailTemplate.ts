/**
 * Monthly report email template generator
 * Generates HTML email content for automated monthly summaries
 */

export interface EmailReportData {
  userName: string;
  userEmail: string;
  currentMonth: number;
  previousMonth: number;
  percentChange: number;
  topCategory: {
    name: string;
    value: number;
    percentage: number;
  };
  topAction: string;
  treesEquivalent: number;
  greenActionsCount: number;
  monthName: string;
  yearMonth: string;
}

/**
 * Generate HTML email template for monthly sustainability report
 */
export function generateMonthlyReportEmail(data: EmailReportData): string {
  const direction = data.percentChange > 0 ? 'down' : 'up';
  const emoji = data.percentChange > 0 ? '📉' : '📈';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f5f2eb;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #0f3d3e;
      border-radius: 20px;
      padding: 40px;
      color: #f5f2eb;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      color: #00ffc6;
      font-weight: 700;
    }
    .hero-metric {
      background: rgba(0, 255, 198, 0.1);
      border: 1px solid rgba(0, 255, 198, 0.3);
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .hero-metric .large {
      font-size: 48px;
      font-weight: 700;
      color: #00ffc6;
      margin: 0;
    }
    .hero-metric .unit {
      font-size: 14px;
      color: rgba(245, 242, 235, 0.7);
      margin: 5px 0 0 0;
    }
    .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 15px 0;
      padding: 12px;
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }
    .metric-label {
      font-size: 14px;
      color: rgba(245, 242, 235, 0.8);
    }
    .metric-value {
      font-size: 18px;
      font-weight: 600;
      color: #00ffc6;
    }
    .positive {
      color: #00ffc6;
    }
    .negative {
      color: #ff6b6b;
    }
    .section {
      margin: 30px 0;
      padding: 20px;
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
    }
    .section h3 {
      margin: 0 0 15px 0;
      font-size: 18px;
      color: #00ffc6;
      font-weight: 600;
    }
    .insight {
      background-color: rgba(255, 255, 255, 0.08);
      border-left: 3px solid #00ffc6;
      padding: 15px;
      margin: 10px 0;
      border-radius: 6px;
      font-size: 14px;
      line-height: 1.6;
    }
    .cta-button {
      display: inline-block;
      background-color: #00ffc6;
      color: #0f3d3e;
      padding: 12px 30px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      margin: 20px 0;
      transition: opacity 0.2s;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 12px;
      color: rgba(245, 242, 235, 0.6);
    }
    .trees {
      font-size: 32px;
      text-align: center;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌍 Your ${data.monthName} Carbon Summary</h1>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: rgba(245, 242, 235, 0.7);">
        Hi ${data.userName}, here's your sustainability snapshot.
      </p>
    </div>

    <div class="hero-metric">
      <p class="large">${data.currentMonth.toFixed(1)}</p>
      <p class="unit">kg CO₂e this month</p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">
        <span class="${data.percentChange > 0 ? 'positive' : 'negative'}">
          ${emoji} ${data.percentChange > 0 ? 'Down' : 'Up'} ${Math.abs(data.percentChange).toFixed(1)}% from last month
        </span>
      </p>
    </div>

    <div class="metric-row">
      <span class="metric-label">Equivalent to offsetting</span>
      <span class="metric-value">${data.treesEquivalent} 🌳</span>
    </div>

    <div class="section">
      <h3>📊 Your Breakdown</h3>
      <div class="metric-row">
        <span class="metric-label">${data.topCategory.name}</span>
        <span class="metric-value">${data.topCategory.value.toFixed(1)} kg (${data.topCategory.percentage.toFixed(0)}%)</span>
      </div>
      <p style="font-size: 13px; color: rgba(245, 242, 235, 0.7); margin: 0;">
        Your biggest impact area this month is ${data.topCategory.name.toLowerCase()}.
      </p>
    </div>

    <div class="section">
      <h3>✨ Your Actions Matter</h3>
      <div style="text-align: center; padding: 15px 0;">
        <p style="font-size: 36px; margin: 0;">🎯</p>
        <p style="font-size: 16px; font-weight: 600; color: #00ffc6; margin: 10px 0 5px 0;">
          ${data.greenActionsCount} Green Actions Logged
        </p>
        <p style="font-size: 13px; color: rgba(245, 242, 235, 0.7); margin: 0;">
          Awareness leads to behavior change. You're tracking habits that matter.
        </p>
      </div>
    </div>

    <div class="section">
      <h3>💡 This Month's Insight</h3>
      <div class="insight">
        <strong>💬 Did You Know?</strong><br><br>
        ${data.topAction}
      </div>
    </div>

    <div style="text-align: center;">
      <a href="https://ecotrace.app/dashboard" class="cta-button">View Full Dashboard</a>
    </div>

    <div class="footer">
      <p>EcoTrace • Making sustainability personal and measurable</p>
      <p>You're receiving this because you subscribed to monthly sustainability reports.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate plain text version for email fallback
 */
export function generateMonthlyReportEmailText(data: EmailReportData): string {
  const direction = data.percentChange > 0 ? 'down' : 'up';

  return `
🌍 Your ${data.monthName} Carbon Summary
Hi ${data.userName},

---

MONTHLY FOOTPRINT
${data.currentMonth.toFixed(1)} kg CO₂e
${direction.toUpperCase()} ${Math.abs(data.percentChange).toFixed(1)}% from last month

Equivalent to offsetting: ${data.treesEquivalent} trees

---

YOUR BREAKDOWN
${data.topCategory.name}: ${data.topCategory.value.toFixed(1)} kg (${data.topCategory.percentage.toFixed(0)}%)

---

YOUR ACTIONS
${data.greenActionsCount} Green Actions Logged This Month
Awareness leads to behavior change. You're tracking habits that matter.

---

THIS MONTH'S INSIGHT
${data.topAction}

---

View your full dashboard: https://ecotrace.app/dashboard

EcoTrace • Making sustainability personal and measurable
  `;
}
