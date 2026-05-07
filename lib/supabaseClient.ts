import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ─── helpers ────────────────────────────────────────────────────────────────

function isDemoUser() {
  return typeof window !== 'undefined' && window.localStorage.getItem('demo_user') === 'true';
}

function getDemoLogs() {
  if (typeof window === 'undefined') return [];
  const saved = JSON.parse(window.localStorage.getItem('demo_logs') || '[]');
  const starter = [
    {
      id: 'mock-1',
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      monthly_energy_usage: 350,
      weekly_miles: 100,
      estimate: 5400,
      details: '',
    },
    {
      id: 'mock-2',
      created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
      monthly_energy_usage: 400,
      weekly_miles: 150,
      estimate: 6200,
      details: '',
    },
  ];
  const savedIds = new Set(saved.map((l: any) => l.id));
  return [...saved, ...starter.filter((s) => !savedIds.has(s.id))];
}

// ─── mock client (no Supabase env vars) ─────────────────────────────────────

function buildMockClient(): SupabaseClient {
  return {
    auth: {
      getSession: () => {
        if (isDemoUser()) {
          return Promise.resolve({
            data: { session: { user: { email: 'demo@ecotrace.com', id: 'demo-user-id' } } },
            error: null,
          });
        }
        return Promise.resolve({ data: { session: null }, error: null });
      },

      onAuthStateChange: (_event: any, _callback: any) => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),

      signInWithOtp: () => Promise.reject(new Error('Supabase not configured')),
      signInWithOAuth: () => Promise.reject(new Error('Supabase not configured')),

      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        // Demo account
        if (email === 'demo@ecotrace.com' && password === 'password123') {
          if (typeof window !== 'undefined') window.localStorage.setItem('demo_user', 'true');
          return { data: { user: { email, id: 'demo-user-id' } }, error: null };
        }
        // Users who signed up via the mock signUp
        if (typeof window !== 'undefined') {
          const signedUpUsers = JSON.parse(window.localStorage.getItem('signed_up_users') || '[]');
          const found = signedUpUsers.find((u: any) => u.email === email && u.password === password);
          if (found) {
            window.localStorage.setItem('demo_user', 'true');
            return { data: { user: { email, id: 'demo-user-id' } }, error: null };
          }
        }
        return Promise.reject(
          new Error('Invalid credentials. (Hint: use demo@ecotrace.com / password123 or sign up first)')
        );
      },

      signUp: async ({ email, password }: { email: string; password: string }) => {
        if (typeof window === 'undefined') {
          return Promise.reject(new Error('Sign up not available server-side'));
        }
        const signedUpUsers = JSON.parse(window.localStorage.getItem('signed_up_users') || '[]');
        if (signedUpUsers.find((u: any) => u.email === email)) {
          return Promise.reject(new Error('User already exists'));
        }
        signedUpUsers.push({ email, password });
        window.localStorage.setItem('signed_up_users', JSON.stringify(signedUpUsers));
        return { data: { user: { email, id: 'demo-user-id' } }, error: null };
      },

      signOut: () => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('demo_user');
          // Keep demo_logs so user can review them if they sign back in
        }
        return Promise.resolve({ error: null });
      },

      getUser: () => {
        if (isDemoUser()) {
          return Promise.resolve({
            data: { user: { email: 'demo@ecotrace.com', id: 'demo-user-id' } },
            error: null,
          });
        }
        return Promise.resolve({ data: { user: null }, error: null });
      },
    },

    from: (table: string) => {
      // ── carbon_logs: full CRUD backed by localStorage ──────────────────
      if (table === 'carbon_logs' && isDemoUser()) {
        const selectChain = () => ({
          order: (_col: string, _opts?: any) => Promise.resolve({ data: getDemoLogs(), error: null }),
          eq: (_col: string, _val: any) => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
          gte: (_col: string, _val: any) => ({ lte: () => ({ data: getDemoLogs(), error: null }) }),
        });

        return {
          select: (_cols?: string) => selectChain(),
          insert: async (row: any) => {
            if (typeof window === 'undefined') return { data: null, error: null };
            const existing = JSON.parse(window.localStorage.getItem('demo_logs') || '[]');
            const newRow = {
              id: Date.now().toString(),
              created_at: new Date().toISOString(),
              ...row,
            };
            existing.unshift(newRow);
            window.localStorage.setItem('demo_logs', JSON.stringify(existing.slice(0, 50)));
            return { data: newRow, error: null };
          },
          upsert: (_row: any) => Promise.resolve({ data: null, error: null }),
        };
      }

      // ── other tables / unauthenticated ──────────────────────────────────
      return {
        select: (_cols?: string) => ({
          eq: (_col: string, _val: any) => ({
            single: () => Promise.reject(new Error('Supabase not configured')),
          }),
          order: () => Promise.resolve({ data: [], error: null }),
        }),
        upsert: (_row: any) => Promise.resolve({ data: null, error: null }),
        insert: (_row: any) => Promise.resolve({ data: null, error: null }),
      };
    },
  } as any;
}

// ─── exported factory ────────────────────────────────────────────────────────

let _browserClient: SupabaseClient | null = null;

export function getBrowserSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    return buildMockClient();
  }

  // Singleton so auth listeners aren't re-registered on every call
  if (!_browserClient) {
    _browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return _browserClient;
}
