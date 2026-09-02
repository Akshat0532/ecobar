'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBrowserSupabaseClient } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type CarbonLog = {
  id: string;
  created_at: string;
  monthly_energy_usage?: number;
  weekly_miles?: number;
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
    throw new Error('Please sign in to view your history.');
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

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['historyLogs'],
    queryFn: fetchUserLogs,
    enabled: typeof window !== 'undefined',
  });

  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(data.length / pageSize));
  const currentItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-mist/60">Full history</p>
          <h1 className="mt-3 text-3xl font-semibold text-mist">Emission log archive</h1>
        </div>
        <div className="text-sm text-mist/70">
          Showing page {page} of {pageCount}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-10 animate-pulse rounded-3xl bg-white/5" />
          <div className="h-10 animate-pulse rounded-3xl bg-white/5" />
          <div className="h-10 animate-pulse rounded-3xl bg-white/5" />
        </div>
      ) : error ? (
        <Card className="bg-white/5 p-8 text-center text-mist">
          <p className="text-lg font-semibold">Unable to load history.</p>
          <p className="mt-3 text-sm text-mist/70">Try again or sign in to continue.</p>
          <Button className="mt-6" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      ) : !data.length ? (
        <Card className="bg-white/5 p-8 text-center text-mist">
          <p className="text-lg font-semibold">No logs found yet.</p>
          <p className="mt-3 text-sm text-mist/70">Use the calculator to create your first saved entry.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden bg-white/5 p-0">
          <table className="w-full border-collapse text-sm text-mist">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.35em] text-mist/60">
              <tr>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Electricity</th>
                <th className="px-4 py-4">Driving</th>
                <th className="px-4 py-4">Total</th>
                <th className="px-4 py-4">Notes</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((log) => (
                <tr key={log.id} className="border-t border-white/10 last:border-b">
                  <td className="px-4 py-4">{formatDate(log.created_at)}</td>
                  <td className="px-4 py-4">{log.monthly_energy_usage ?? '–'} kWh</td>
                  <td className="px-4 py-4">{log.weekly_miles ?? '–'} mi</td>
                  <td className="px-4 py-4">{((log.estimate ?? 0) / 1000).toFixed(2)} t</td>
                  <td className="px-4 py-4 text-mist/70">
                    {log.details
                      ? typeof log.details === 'object'
                        ? JSON.stringify(log.details)
                        : String(log.details)
                      : '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {data.length > pageSize ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
            Previous
          </Button>
          <div className="text-sm text-mist/70">
            Page {page} of {pageCount}
          </div>
          <Button disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
            Next
          </Button>
        </div>
      ) : null}
    </main>
  );
}
