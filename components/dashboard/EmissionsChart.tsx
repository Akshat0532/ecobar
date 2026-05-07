'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseFootprint';
import type { FootprintLog } from '@/lib/supabaseFootprint';

interface ChartDataPoint {
  date: string; home_energy: number; transport: number; food: number; goods: number; total: number;
}

interface EmissionsChartProps {
  userId?: string; timeRange?: '7d' | '30d' | '90d' | '1y' | 'all'; height?: number; showLegend?: boolean; showTooltip?: boolean;
}

interface CategoryStats {
  category: string; total: number; average: number; min: number; max: number; percentage: number;
}

const CHART_COLORS = { home: '#0071E3', transport: '#5856D6', food: '#FF9500', goods: '#30D158' };

const tooltipStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  borderRadius: '12px',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
};

export function EmissionsChart({ userId, timeRange = '30d', height = 400, showLegend = true, showTooltip = true }: EmissionsChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [chartType, setChartType] = useState<'area' | 'line'>('area');

  const calculateDateRange = (range: string): { start: Date; end: Date } => {
    const end = new Date(); const start = new Date();
    switch (range) {
      case '7d': start.setDate(end.getDate() - 7); break;
      case '30d': start.setDate(end.getDate() - 30); break;
      case '90d': start.setDate(end.getDate() - 90); break;
      case '1y': start.setFullYear(end.getFullYear() - 1); break;
      case 'all': start.setFullYear(1970); break;
      default: start.setDate(end.getDate() - 30);
    }
    return { start, end };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); setError(null);
        let fetchUserId = userId;
        if (!fetchUserId) {
          const { data: { user } } = await supabase.auth.getUser();
          fetchUserId = user?.id;
          if (!fetchUserId) { setError('User not authenticated'); setLoading(false); return; }
        }
        const { start, end } = calculateDateRange(timeRange);
        const { data: logs, error: fetchError } = await supabase
          .from('footprint_logs').select('*').eq('user_id', fetchUserId)
          .gte('log_date', start.toISOString().split('T')[0])
          .lte('log_date', end.toISOString().split('T')[0])
          .order('log_date', { ascending: true });

        if (fetchError) { setError(`Failed to fetch data: ${fetchError.message}`); setLoading(false); return; }
        if (!logs || logs.length === 0) { setData(generateMockData(timeRange)); setStats(generateMockStats()); setLoading(false); return; }

        const processedData = processLogsToChartData(logs as FootprintLog[]);
        setData(processedData);
        setStats(calculateCategoryStats(logs as FootprintLog[], processedData));
        setLoading(false);
      } catch (err) {
        setError(`Error fetching emissions data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, timeRange]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Emissions Trend</h2>
          <p className="text-sm text-[#86868B]">Daily carbon footprint over time</p>
        </div>
        <select value={chartType} onChange={(e) => setChartType(e.target.value as 'area' | 'line')}
          className="px-4 py-2 bg-[#F5F5F7] dark:bg-[#1C1C1E] border-0 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/40">
          <option value="area">Area Chart</option>
          <option value="line">Line Chart</option>
        </select>
      </div>

      {error && (<Card className="bg-[#FF3B30]/5 p-4"><p className="text-sm text-[#FF3B30]">{error}</p></Card>)}

      {loading && (
        <Card className="h-96 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#D2D2D7] border-t-[#0071E3] mx-auto" />
            <p className="text-[#86868B]">Loading emissions data...</p>
          </div>
        </Card>
      )}

      {!loading && data.length > 0 && (
        <Card>
          <ResponsiveContainer width="100%" height={height}>
            {chartType === 'area' ? (
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHomeEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.home} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.home} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTransport" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.transport} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.transport} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.food} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.food} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGoods" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.goods} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.goods} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="date" stroke="#86868B" style={{ fontSize: 12 }} interval={Math.floor(data.length / 7) || 0} />
                <YAxis stroke="#86868B" style={{ fontSize: 12 }} label={{ value: 'kg CO₂e', angle: -90, position: 'insideLeft' }} />
                {showTooltip && <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [value.toFixed(1) + ' kg', '']} />}
                {showLegend && <Legend wrapperStyle={{ paddingTop: '20px', fontSize: 12 }} />}
                <Area type="monotone" dataKey="home_energy" stackId="1" name="Home Energy" stroke={CHART_COLORS.home} fillOpacity={1} fill="url(#colorHomeEnergy)" />
                <Area type="monotone" dataKey="transport" stackId="1" name="Transport" stroke={CHART_COLORS.transport} fillOpacity={1} fill="url(#colorTransport)" />
                <Area type="monotone" dataKey="food" stackId="1" name="Food" stroke={CHART_COLORS.food} fillOpacity={1} fill="url(#colorFood)" />
                <Area type="monotone" dataKey="goods" stackId="1" name="Goods" stroke={CHART_COLORS.goods} fillOpacity={1} fill="url(#colorGoods)" />
              </AreaChart>
            ) : (
              <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="date" stroke="#86868B" style={{ fontSize: 12 }} interval={Math.floor(data.length / 7) || 0} />
                <YAxis stroke="#86868B" style={{ fontSize: 12 }} label={{ value: 'kg CO₂e', angle: -90, position: 'insideLeft' }} />
                {showTooltip && <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [value.toFixed(1) + ' kg', '']} />}
                {showLegend && <Legend wrapperStyle={{ paddingTop: '20px', fontSize: 12 }} />}
                <Line type="monotone" dataKey="home_energy" name="Home Energy" stroke={CHART_COLORS.home} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="transport" name="Transport" stroke={CHART_COLORS.transport} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="food" name="Food" stroke={CHART_COLORS.food} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="goods" name="Goods" stroke={CHART_COLORS.goods} strokeWidth={2} dot={false} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </Card>
      )}

      {!loading && stats.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (<StatsCard key={stat.category} stat={stat} />))}
        </div>
      )}

      {!loading && data.length === 0 && !error && (
        <Card className="text-center">
          <p className="text-[#86868B]">No emissions data available for this period.</p>
          <p className="text-sm text-[#86868B]/70 mt-2">Start logging your activities to see trends.</p>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function processLogsToChartData(logs: FootprintLog[]): ChartDataPoint[] {
  const grouped = new Map<string, Map<string, number>>();
  logs.forEach((log) => {
    if (!grouped.has(log.log_date)) grouped.set(log.log_date, new Map());
    const dateMap = grouped.get(log.log_date)!;
    dateMap.set(log.category, (dateMap.get(log.category) || 0) + log.calculated_kg_co2e);
  });
  return Array.from(grouped.entries())
    .map(([date, categories]) => ({
      date: formatDate(date),
      home_energy: categories.get('home_energy') || 0, transport: categories.get('transport') || 0,
      food: categories.get('food') || 0, goods: categories.get('goods') || 0,
      total: (categories.get('home_energy') || 0) + (categories.get('transport') || 0) + (categories.get('food') || 0) + (categories.get('goods') || 0),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function calculateCategoryStats(logs: FootprintLog[], chartData: ChartDataPoint[]): CategoryStats[] {
  const categories = ['home_energy', 'transport', 'food', 'goods'] as const;
  const total = logs.reduce((sum, log) => sum + log.calculated_kg_co2e, 0);
  return categories.map((category) => {
    const values = logs.filter((l) => l.category === category).map((l) => l.calculated_kg_co2e);
    const categoryTotal = values.reduce((a, b) => a + b, 0);
    return {
      category: formatCategoryName(category), total: categoryTotal,
      average: values.length > 0 ? categoryTotal / values.length : 0,
      min: values.length > 0 ? Math.min(...values) : 0, max: values.length > 0 ? Math.max(...values) : 0,
      percentage: (categoryTotal / total) * 100,
    };
  });
}

function generateMockData(timeRange: string): ChartDataPoint[] {
  const end = new Date(); const start = new Date();
  let days = 30;
  if (timeRange === '7d') days = 7; else if (timeRange === '90d') days = 90; else if (timeRange === '1y') days = 365;
  start.setDate(end.getDate() - days);
  return Array.from({ length: days }).map((_, i) => {
    const date = new Date(start); date.setDate(date.getDate() + i);
    return {
      date: formatDate(date.toISOString().split('T')[0]),
      home_energy: 40 + Math.random() * 20, transport: 30 + Math.random() * 40,
      food: 15 + Math.random() * 10, goods: 2 + Math.random() * 5, total: 87 + Math.random() * 40,
    };
  });
}

function generateMockStats(): CategoryStats[] {
  return [
    { category: 'Home Energy', total: 1200, average: 50, min: 40, max: 70, percentage: 45 },
    { category: 'Transport', total: 900, average: 37.5, min: 20, max: 60, percentage: 33 },
    { category: 'Food', total: 450, average: 18.75, min: 10, max: 30, percentage: 17 },
    { category: 'Goods', total: 75, average: 3.125, min: 1, max: 10, percentage: 5 },
  ];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatCategoryName(category: string): string {
  return category.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function StatsCard({ stat }: { stat: CategoryStats }) {
  const getAccent = (pct: number) => pct > 40 ? '#FF3B30' : pct > 25 ? '#FF9500' : '#0071E3';
  const color = getAccent(stat.percentage);

  return (
    <Card className="space-y-2">
      <p className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{stat.category}</p>
      <div className="space-y-1">
        <div className="flex justify-between"><span className="text-xs text-[#86868B]">Total</span><span className="text-sm font-bold" style={{ color }}>{stat.total.toFixed(0)} kg</span></div>
        <div className="flex justify-between"><span className="text-xs text-[#86868B]">Avg</span><span className="text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">{stat.average.toFixed(1)} kg/day</span></div>
        <div className="flex justify-between"><span className="text-xs text-[#86868B]">Range</span><span className="text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">{stat.min.toFixed(0)}–{stat.max.toFixed(0)} kg</span></div>
      </div>
      <div className="pt-2 border-t border-[#D2D2D7] dark:border-[#38383A]">
        <p className="text-sm font-semibold" style={{ color }}>{stat.percentage.toFixed(1)}%</p>
        <p className="text-xs text-[#86868B]">of total emissions</p>
      </div>
    </Card>
  );
}
