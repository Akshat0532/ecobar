'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getBrowserSupabaseClient } from '@/lib/supabaseClient';

type CarbonLog = {
  id: string;
  created_at: string;
  monthly_energy_usage?: number;
  weekly_miles?: number;
  diet?: string;
  estimate?: number;
  details?: string;
};

async function fetchUserLogs(): Promise<CarbonLog[]> {
  const supabase = getBrowserSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    // Check if demo user is logged in via localStorage
    if (typeof window !== 'undefined' && window.localStorage.getItem('demo_user') === 'true') {
      // Merge saved demo_logs with mock starter data
      const saved = JSON.parse(window.localStorage.getItem('demo_logs') || '[]') as CarbonLog[];
      const starter: CarbonLog[] = [
        { id: 'mock-1', created_at: new Date(Date.now() - 86400000 * 30).toISOString(), monthly_energy_usage: 350, weekly_miles: 100, estimate: 5400, details: '' },
        { id: 'mock-2', created_at: new Date(Date.now() - 86400000 * 60).toISOString(), monthly_energy_usage: 400, weekly_miles: 150, estimate: 6200, details: '' },
      ];
      // Put user-saved logs first, then starters (avoid duplicate ids)
      const savedIds = new Set(saved.map((l) => l.id));
      return [...saved, ...starter.filter((s) => !savedIds.has(s.id))];
    }
    throw new Error('Please sign in to view your dashboard.');
  }

  const { data, error } = await supabase
    .from('carbon_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function parseFlights(details?: unknown) {
  if (!details) return 'N/A';
  const str = typeof details === 'string' ? details : JSON.stringify(details);
  const match = str.match(/(\d+)\s*miles/i);
  return match ? `${match[1]} mi` : 'N/A';
}

function convertToCsv(logs: CarbonLog[]) {
  const headers = ['Date', 'Electricity (kWh)', 'Driving (miles)', 'Flights', 'Total (tonnes)', 'Details'];
  const rows = logs.map((log) => {
    const detailsStr = log.details
      ? typeof log.details === 'string'
        ? log.details.replace(/\n/g, ' ')
        : JSON.stringify(log.details)
      : '';

    return [
      formatDate(log.created_at),
      String(log.monthly_energy_usage ?? '–'),
      String(log.weekly_miles ?? '–'),
      parseFlights(log.details),
      ((log.estimate ?? 0) / 1000).toFixed(2),
      detailsStr,
    ];
  });

  return [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardLogs'],
    queryFn: fetchUserLogs,
    enabled: typeof window !== 'undefined',
    retry: false,
    staleTime: 0,       // always re-fetch on mount so new saves appear
    gcTime: 0,          // don't keep stale cache in memory
    refetchOnMount: true,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (error && error.message === 'Please sign in to view your dashboard.') {
      router.push('/login');
    }
  }, [error, router]);

  const recentLogs = data?.slice(0, 5) ?? [];
  const totalTonnes = useMemo(() => {
    if (!data) return 0;
    return data.reduce((sum, log) => sum + (log.estimate ?? 0), 0) / 1000;
  }, [data]);

  const chartItems = useMemo(() => {
    if (!data) return [];
    return data.slice(0, 5).map((log) => ({
      date: formatDate(log.created_at),
      value: (log.estimate ?? 0) / 1000,
    }));
  }, [data]);

  const handleExport = () => {
    if (!data?.length) return;
    const csv = convertToCsv(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ecotrace-logs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#6B8E23] dark:text-[#A8BEA8]">Activity Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold text-[#1A3B1A] dark:text-[#E8F0E8]">Your Emissions Overview</h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/calculator">
            <Button className="bg-[#2C5F2D] text-white hover:bg-[#245224]">+ Add New Log</Button>
          </Link>
          <Link href="/dashboard/history">
            <Button variant="ghost">View All History</Button>
          </Link>
          <Button onClick={handleExport} disabled={!data?.length}>
            Export Data
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-12 space-y-6">
          <div className="h-32 animate-pulse rounded-3xl bg-white dark:bg-[#1E331E]" />
          <div className="space-y-4">
            <div className="h-10 w-full animate-pulse rounded-3xl bg-white dark:bg-[#1E331E]" />
            <div className="h-10 w-full animate-pulse rounded-3xl bg-white dark:bg-[#1E331E]" />
          </div>
        </div>
      ) : error ? (
        <div className="mt-12 rounded-3xl border border-[#9CAF88]/40 dark:border-[#2A3D2A] bg-white dark:bg-[#1E331E] p-8 text-center text-[#1A3B1A] dark:text-[#E8F0E8]">
          <p className="text-lg font-semibold text-[#1A3B1A] dark:text-[#E8F0E8]">Unable to load dashboard data.</p>
          <p className="mt-3 text-sm text-[#6B8E23] dark:text-[#A8BEA8]">Please check your connection and try again.</p>
          <div className="mt-6 flex justify-center">
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </div>
      ) : !data?.length ? (
        <div className="mt-12 rounded-3xl border border-[#9CAF88]/40 dark:border-[#2A3D2A] bg-white dark:bg-[#1E331E] p-10 text-center text-[#1A3B1A] dark:text-[#E8F0E8]">
          <h2 className="text-2xl font-semibold text-[#1A3B1A] dark:text-[#E8F0E8]">No data yet</h2>
          <p className="mt-3 text-sm text-[#6B8E23] dark:text-[#A8BEA8]">
            Take the calculator to log your first footprint estimate. Your dashboard will fill in as you save results.
          </p>
          <Link href="/calculator">
            <Button className="mt-6">Start Calculating</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-white dark:bg-[#1E331E]">
              <p className="text-sm uppercase tracking-[0.25em] text-[#6B8E23] dark:text-[#A8BEA8]">Total logged</p>
              <p className="mt-3 text-4xl font-semibold text-[#2C5F2D] dark:text-[#4A8F4B]">{data.length}</p>
            </Card>
            <Card className="bg-white dark:bg-[#1E331E]">
              <p className="text-sm uppercase tracking-[0.25em] text-[#6B8E23] dark:text-[#A8BEA8]">Current total</p>
              <p className="mt-3 text-4xl font-semibold text-[#2C5F2D] dark:text-[#4A8F4B]">{totalTonnes.toFixed(1)} t</p>
            </Card>
            <Card className="bg-white dark:bg-[#1E331E]">
              <p className="text-sm uppercase tracking-[0.25em] text-[#6B8E23] dark:text-[#A8BEA8]">Recent month</p>
              <p className="mt-3 text-4xl font-semibold text-[#2C5F2D] dark:text-[#4A8F4B]">{chartItems[0]?.value.toFixed(1)} t</p>
            </Card>
          </div>

          <Card className="bg-white dark:bg-[#1E331E] p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#1A3B1A] dark:text-[#E8F0E8]">Recent footprint history</h2>
              <p className="text-sm text-[#6B8E23] dark:text-[#A8BEA8]">Latest entries</p>
            </div>
            <div className="overflow-hidden rounded-3xl border border-[#9CAF88]/40 dark:border-[#2A3D2A]">
              <table className="w-full border-collapse text-sm text-[#1A3B1A] dark:text-[#E8F0E8]">
                <thead className="bg-white dark:bg-[#1E331E] text-left text-xs uppercase tracking-[0.3em] text-[#6B8E23] dark:text-[#A8BEA8]">
                  <tr>
                    <th className="px-4 py-4">Date</th>
                    <th className="px-4 py-4">Electricity</th>
                    <th className="px-4 py-4">Driving</th>
                    <th className="px-4 py-4">Flights</th>
                    <th className="px-4 py-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="border-t border-[#9CAF88]/40 dark:border-[#2A3D2A]">
                      <td className="px-4 py-4">{formatDate(log.created_at)}</td>
                      <td className="px-4 py-4">{log.monthly_energy_usage ?? '–'} kWh</td>
                      <td className="px-4 py-4">{log.weekly_miles ?? '–'} mi</td>
                      <td className="px-4 py-4">{parseFlights(log.details)}</td>
                      <td className="px-4 py-4">{((log.estimate ?? 0) / 1000).toFixed(2)} t</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}
