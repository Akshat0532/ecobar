/**
 * Rules-based insights engine
 * Generates actionable, personalized insights without live LLM calls
 */

import { CalculatorResult } from './calculator';

export interface Insight {
  category: 'high-travel' | 'high-energy' | 'high-diet' | 'positive-trend' | 'milestone' | 'opportunity';
  title: string;
  message: string;
  actionable: boolean;
  potentialSavings?: number; // kg CO2e
  emoji: string;
}

interface MonthlyStats {
  currentMonth: number;
  previousMonth: number;
  sixMonthAvg: number;
  monthlyBreakdown: {
    home: number;
    travel: number;
    diet: number;
    goods: number;
  };
}

/**
 * Generate personalized insights from user data
 */
export function generateInsights(
  currentResult: CalculatorResult,
  monthlyStats: MonthlyStats,
  greenActionCount: number
): Insight[] {
  const insights: Insight[] = [];

  // Rule 1: High travel emissions
  if (currentResult.transportation.total > currentResult.monthlyPerCapita * 0.4) {
    const trainAlternativeSavings = currentResult.transportation.flights * 0.3;
    insights.push({
      category: 'high-travel',
      title: 'Your Travel Footprint is High',
      message: `Your transportation accounts for ${((currentResult.transportation.total / currentResult.monthlyPerCapita) * 100).toFixed(0)}% of your footprint. Choosing a train for just one flight could save ~${trainAlternativeSavings.toFixed(1)} kg CO₂e.`,
      actionable: true,
      potentialSavings: trainAlternativeSavings,
      emoji: '✈️',
    });
  }

  // Rule 2: High home energy
  if (currentResult.homeEnergy.total > currentResult.monthlyPerCapita * 0.35) {
    const cookingShare = (currentResult.homeEnergy.lpg + currentResult.homeEnergy.png) / currentResult.homeEnergy.total;
    if (cookingShare > 0.6) {
      insights.push({
        category: 'high-energy',
        title: 'Cooking Fuel is Your Biggest Energy Cost',
        message: `LPG/PNG cooking accounts for a large share of your energy emissions. Using a solar cooker for daytime meals or an induction cooktop can reduce cooking emissions by 15-25%. That's ~${(currentResult.homeEnergy.total * 0.15).toFixed(1)} kg saved per month.`,
        actionable: true,
        potentialSavings: currentResult.homeEnergy.total * 0.15,
        emoji: '🔥',
      });
    } else {
      insights.push({
        category: 'high-energy',
        title: 'Electricity is Your Big User',
        message: `Your electricity use (${currentResult.homeEnergy.electricity.toFixed(1)} kg CO₂e) is above average. A rooftop solar panel or switching to 5-star rated appliances can cut this by 30-50%.`,
        actionable: true,
        potentialSavings: currentResult.homeEnergy.electricity * 0.4,
        emoji: '⚡',
      });
    }
  }

  // Rule 3: High food emissions
  if (currentResult.diet > currentResult.monthlyPerCapita * 0.25) {
    let dietMessage = '';
    let savings = 0;
    if (currentResult.diet > 50) {
      dietMessage = `Meat is carbon-intensive. Trying "Meatless Mondays" could save ~${(currentResult.diet * 0.3).toFixed(1)} kg CO₂e per week.`;
      savings = currentResult.diet * 0.3 / 4;
    } else {
      dietMessage = `Plant-based meals are 2-3x less carbon-intensive. Adding just 2 vegetarian days per week saves ~${(currentResult.diet * 0.25).toFixed(1)} kg monthly.`;
      savings = currentResult.diet * 0.25;
    }
    insights.push({
      category: 'high-diet',
      title: 'Food Choices Matter',
      message: dietMessage,
      actionable: true,
      potentialSavings: savings,
      emoji: '🌱',
    });
  }

  // Rule 4: Positive trend (decreasing emissions)
  if (monthlyStats.currentMonth < monthlyStats.previousMonth) {
    const percentChange = ((monthlyStats.previousMonth - monthlyStats.currentMonth) / monthlyStats.previousMonth) * 100;
    insights.push({
      category: 'positive-trend',
      title: `You're Trending Down! 📉`,
      message: `Your footprint dropped ${percentChange.toFixed(1)}% this month. Keep it up—small actions compound into big impact.`,
      actionable: false,
      emoji: '📉',
    });
  }

  // Rule 5: Green actions
  if (greenActionCount >= 10) {
    insights.push({
      category: 'milestone',
      title: 'Green Streak! 🔥',
      message: `${greenActionCount} green actions this month! You're making consistent sustainable choices. The awareness alone changes behavior.`,
      actionable: false,
      emoji: '🔥',
    });
  }

  // Rule 6: Below average (positive)
  if (currentResult.annualPerCapita < 16) {
    insights.push({
      category: 'milestone',
      title: 'Below US Average 🎉',
      message: `At ${currentResult.annualPerCapita.toFixed(1)} tonnes/year, you're already below the US average (16 tonnes). You're in the top ${Math.round((1 - currentResult.annualPerCapita / 16) * 100)}% of conscious consumers.`,
      actionable: false,
      emoji: '🎉',
    });
  }

  // Rule 7: High spending = high goods emissions
  if (currentResult.goodsServices > currentResult.monthlyPerCapita * 0.2) {
    insights.push({
      category: 'opportunity',
      title: 'Conscious Consumption',
      message: `Goods & services emit ~${currentResult.goodsServices.toFixed(1)} kg CO₂e monthly for you. Buying secondhand, repairing items, and choosing quality-over-quantity reduce this by 30-40%.`,
      actionable: true,
      potentialSavings: currentResult.goodsServices * 0.35,
      emoji: '♻️',
    });
  }

  return insights.slice(0, 3); // Return top 3 insights
}

/**
 * Generate a monthly summary for email/reporting
 */
export function generateMonthlySummary(
  currentMonth: number,
  previousMonth: number,
  topEmissionCategory: { name: string; value: number },
  totalGreenActions: number
): string {
  const percentChange = ((previousMonth - currentMonth) / previousMonth) * 100;
  const direction = percentChange > 0 ? 'down' : 'up';
  const icon = percentChange > 0 ? '📉' : '📈';

  let summary = `Your monthly footprint was ${currentMonth.toFixed(1)} kg CO₂e, ${direction} ${Math.abs(percentChange).toFixed(1)}% from last month. ${icon}\n\n`;

  if (percentChange > 0) {
    summary += `Great work! You reduced emissions by ${percentChange.toFixed(1)}%. ${getTrendMessage(percentChange)}\n\n`;
  } else if (percentChange < 0) {
    summary += `Your emissions increased by ${Math.abs(percentChange).toFixed(1)}%. Focus on: ${topEmissionCategory.name}.\n\n`;
  }

  summary += `Your biggest impact area this month: ${topEmissionCategory.name} (${topEmissionCategory.value.toFixed(1)} kg CO₂e).\n`;
  summary += `Green actions logged: ${totalGreenActions}\n`;

  return summary;
}

/**
 * Contextualize trend performance with motivational messaging
 */
function getTrendMessage(percentReduction: number): string {
  if (percentReduction < 5) return 'Small steps matter!';
  if (percentReduction < 10) return 'You are on the right track.';
  if (percentReduction < 20) return 'Solid improvement! Keep building these habits.';
  return 'Excellent work! You are making a real difference.';
}
