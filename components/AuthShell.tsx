'use client';

import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getBrowserSupabaseClient } from '@/lib/supabaseClient';
import { Button } from './ui/button';

export function AuthShell() {
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<any>(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const client = getBrowserSupabaseClient();
    setSupabaseClient(client);

    const init = async () => {
      const { data } = await client.auth.getSession();
      setSession(data.session);
      setStatus('idle');
    };

    init();

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription?.unsubscribe();
  }, []);

  const signIn = async () => {
    if (!supabaseClient) return;
    const email = window.prompt('Enter your email for a magic link');
    if (!email) return;
    await supabaseClient.auth.signInWithOtp({ email });
    setStatus('sent');
  };

  const signInWithGoogle = async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const signOut = async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    setSession(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-[#0071E3]">Identity & sync</p>
        <h2 className="mt-3 text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Supabase auth starter</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#86868B]">
          Connect your account and sync your carbon results to a secure personal profile.
        </p>
      </div>

      <div className="rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-6">
        {status === 'loading' ? (
          <p className="text-[#86868B]">Checking session...</p>
        ) : session ? (
          <div className="space-y-4">
            <p className="text-[#1D1D1F] dark:text-[#F5F5F7]">Signed in as <span className="font-semibold">{session.user.email}</span>.</p>
            <Button onClick={signOut} variant="secondary">Sign out</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[#86868B]">Sign in with a magic link to save your footprint timeline.</p>
            <div className="space-y-3">
              <Button onClick={signIn}>Send magic link</Button>
              <Button onClick={signInWithGoogle} variant="secondary">Continue with Google</Button>
            </div>
            {status === 'sent' && <p className="text-sm text-[#0071E3]">Magic link sent. Check your inbox.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
