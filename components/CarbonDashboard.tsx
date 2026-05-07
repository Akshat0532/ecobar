'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { Card } from './ui/card';
import { generateInsights, generateMonthlySummary, type Insight } from '@/lib/insights';
import { motion } from 'framer-motion';

interface DashboardData {
  monthlyTrend: Array<{ month: string; footprint: number }>;
  currentMonth: number;
  previousMonth: number;
  breakdown: { home: number; travel: number; diet: number; goods: number };
  treesEquivalent: number;
  greenActionsDays: number[];
  totalGreenActions: number;
}

async function fetchDashboardData(): Promise<DashboardData> {
  const res = await fetch('/api/dashboard-data');
  if (!res.ok) throw new Error('Failed to load dashboard');
  return res.json();
}

const APPLE_COLORS = ['#0071E3', '#5856D6', '#FF9500', '#30D158'];

const tooltipStyle = {
  background: 'rgba(255, 255, 255, 0.95)',
  borderRadius: 12,
  border: '1px solid rgba(0, 0, 0, 0.06)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
};

const tooltipStyleDark = {
  background: 'rgba(28, 28, 30, 0.95)',
  borderRadius: 12,
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
};

export function CarbonDashboard() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['dashboardData'], queryFn: fetchDashboardData });

  if (isLoading) {
    return (<div className="space-y-6"><Card className="h-32 animate-pulse" /></div>);
  }
  if (isError || !data) {
    return (<Card className="text-[#FF3B30]"><p>Unable to load dashboard data. Please try again later.</p></Card>);
  }

  return (
    <div className="space-y-8">
      <HeroMetric data={data} />
      <div className="grid gap-8 xl:grid-cols-2">
        <EmissionsBreakdownChart breakdown={data.breakdown} />
        <ComparativeRadarChart breakdown={data.breakdown} />
      </div>
      <GreenActionsCalendar greenActionsDays={data.greenActionsDays} />
      <InsightsSection data={data} />
    </div>
  );
}

function HeroMetric({ data }: { data: DashboardData }) {
  const percentChange = ((data.previousMonth - data.currentMonth) / data.previousMonth) * 100;
  const isPositive = percentChange > 0;

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="bg-gradient-to-br from-[#0071E3]/10 via-[#F5F5F7] to-[#30D158]/5 dark:from-[#0071E3]/20 dark:via-[#1C1C1E] dark:to-[#30D158]/10">
        <div className="grid gap-8 lg:grid-cols-[1fr_200px]">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-[#0071E3] mb-3">Current Month Projection</p>
            <div className="flex items-baseline gap-3">
              <div className="text-6xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{data.currentMonth.toFixed(1)}</div>
              <div className="text-lg text-[#86868B]">kg CO₂e</div>
            </div>
            <div className="mt-6">
              <p className="text-xs text-[#86868B] mb-2">Last 6 months</p>
              <ResponsiveContainer width="100%" height={40}>
                <LineChart data={data.monthlyTrend.slice(-6)}>
                  <Line type="monotone" dataKey="footprint" stroke="#0071E3" dot={false} strokeWidth={2} isAnimationActive />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <p className={`text-sm font-semibold ${isPositive ? 'text-[#30D158]' : 'text-[#FF3B30]'}`}>
                {isPositive ? '📉' : '📈'} {Math.abs(percentChange).toFixed(1)}% from last month
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white/60 dark:bg-white/5 p-4">
            <div className="text-3xl mb-2">🌳</div>
            <div className="text-2xl font-bold text-[#30D158]">{data.treesEquivalent}</div>
            <p className="text-xs text-center text-[#86868B] mt-2">Maple Trees <br /> Offset Yearly</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function EmissionsBreakdownChart({ breakdown }: { breakdown: { home: number; travel: number; diet: number; goods: number } }) {
  const chartData = [
    { name: 'Home Energy', value: breakdown.home, fill: APPLE_COLORS[0] },
    { name: 'Travel', value: breakdown.travel, fill: APPLE_COLORS[1] },
    { name: 'Diet', value: breakdown.diet, fill: APPLE_COLORS[2] },
    { name: 'Goods & Services', value: breakdown.goods, fill: APPLE_COLORS[3] },
  ].filter((item) => item.value > 0);

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
      <Card>
        <div className="mb-4">
          <p className="text-xs font-medium uppercase tracking-widest text-[#0071E3]">Breakdown</p>
          <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-1">Emissions by Category</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
              {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${(value as number).toFixed(1)} kg CO₂e`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
              <span className="text-sm text-[#86868B]">{item.name}</span>
              <span className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] ml-auto">{item.value.toFixed(1)} kg</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

function ComparativeRadarChart({ breakdown }: { breakdown: { home: number; travel: number; diet: number; goods: number } }) {
  const efficientNeighbor = { Home: breakdown.home * 0.7, Travel: breakdown.travel * 0.6, Diet: breakdown.diet * 0.8, Goods: breakdown.goods * 0.75 };
  const radarData = [
    { category: 'Home', user: breakdown.home, efficient: efficientNeighbor.Home },
    { category: 'Travel', user: breakdown.travel, efficient: efficientNeighbor.Travel },
    { category: 'Diet', user: breakdown.diet, efficient: efficientNeighbor.Diet },
    { category: 'Goods', user: breakdown.goods, efficient: efficientNeighbor.Goods },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <Card>
        <div className="mb-4">
          <p className="text-xs font-medium uppercase tracking-widest text-[#0071E3]">Comparison</p>
          <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-1">You vs. Efficient Neighbor</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(0, 0, 0, 0.08)" />
            <PolarAngleAxis dataKey="category" tick={{ fill: '#86868B', fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 'auto']} tick={{ fill: '#86868B', fontSize: 10 }} />
            <Radar name="Your Footprint" dataKey="user" stroke="#FF3B30" fill="#FF3B30" fillOpacity={0.2} />
            <Radar name="Efficient Neighbor" dataKey="efficient" stroke="#0071E3" fill="#0071E3" fillOpacity={0.15} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${(value as number).toFixed(1)} kg`} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}

function GreenActionsCalendar({ greenActionsDays }: { greenActionsDays: number[] }) {
  const today = new Date();
  const startDate = new Date(today.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
  const daysInView = Array.from({ length: 84 }).map((_, i) => {
    const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    return d.getDate();
  });

  const getColor = (day: number) => {
    return greenActionsDays.includes(day)
      ? 'bg-[#0071E3]/40 border-[#0071E3]/50'
      : 'bg-[#F5F5F7] dark:bg-[#2C2C2E] border-transparent';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-widest text-[#0071E3]">Awareness</p>
          <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-1">Green Actions Heatmap</h3>
          <p className="text-xs text-[#86868B] mt-2">Days where you logged sustainable choices</p>
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-2">
            {Array.from({ length: 12 }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const index = weekIndex * 7 + dayIndex;
                  const day = daysInView[index];
                  return (<div key={index} className={`w-3 h-3 rounded border transition ${getColor(day)}`} title={`${day}th`} />);
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-[#86868B]">
          <div>12 weeks ago</div>
          <div className="flex gap-2 items-center">
            <span>Activity:</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded bg-[#F5F5F7] dark:bg-[#2C2C2E]" /><span>None</span>
              <div className="w-2 h-2 rounded bg-[#0071E3]/40 ml-3" /><span>Logged</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function InsightsSection({ data }: { data: DashboardData }) {
  const insights = useMemo(() => {
    const total = data.currentMonth;
    const mockResult = {
      monthlyTotal: total, annualTotal: total * 12, monthlyPerCapita: data.currentMonth, annualPerCapita: data.currentMonth * 12,
      homeEnergy: { electricity: data.breakdown.home * 0.6, lpg: data.breakdown.home * 0.35, png: 0, total: data.breakdown.home },
      transportation: { personalVehicle: data.breakdown.travel * 0.6, publicTransit: 0, flights: data.breakdown.travel * 0.4, total: data.breakdown.travel },
      diet: data.breakdown.diet, goodsServices: data.breakdown.goods,
      comparison: { vsIndiaAverage: (data.currentMonth * 12) - 1.9, vsWorldAverage: (data.currentMonth * 12) - 4.5, vsParisTarget: (data.currentMonth * 12) - 2.5 },
      treesEquivalent: data.treesEquivalent, insight: '',
    };
    const monthlyStats = {
      currentMonth: data.currentMonth, previousMonth: data.previousMonth,
      sixMonthAvg: data.monthlyTrend.slice(-6).reduce((a, b) => a + b.footprint, 0) / 6,
      monthlyBreakdown: data.breakdown,
    };
    return generateInsights(mockResult, monthlyStats, data.totalGreenActions);
  }, [data]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-[#0071E3]">Insights</p>
          <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-1">Did You Know?</h3>
        </div>
        <div className="grid gap-4">
          {insights.map((insight, idx) => (<InsightCard key={idx} insight={insight} />))}
        </div>
      </div>
    </motion.div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
      <Card className="hover:shadow-apple-md transition-all">
        <div className="flex gap-4">
          <div className="text-2xl">{insight.emoji}</div>
          <div className="flex-1">
            <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{insight.title}</h4>
            <p className="text-sm text-[#86868B] mt-2">{insight.message}</p>
            {insight.actionable && insight.potentialSavings && (
              <p className="text-xs text-[#0071E3] font-semibold mt-3">💡 Potential savings: {insight.potentialSavings.toFixed(1)} kg CO₂e/month</p>
            )}
          </div>
          <div className="flex gap-2">
            <button className="text-lg hover:scale-125 transition">👍</button>
            <button className="text-lg hover:scale-125 transition">👎</button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
