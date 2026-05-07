'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { getBrowserSupabaseClient } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const supabase = getBrowserSupabaseClient();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleGuestAccess = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('guest_mode', 'true');
    }
    router.push('/calculator');
  };

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg('Account created successfully! You can now sign in.');
        setIsSignUp(false);
        setPassword('');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Hard redirect so all components reinitialize with new auth state
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      // Fallback for missing supabase credentials mock
      if (err.message === 'Supabase not configured' || err.message?.includes('Supabase not configured')) {
        setErrorMsg('Authentication is not configured for this demo environment.');
      } else {
        setErrorMsg(err.message || 'Something went wrong during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] flex flex-col px-4 py-8">
      <div className="max-w-4xl w-full mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#0071E3] hover:underline mb-8">
          <ArrowLeft size={16} strokeWidth={1.5} /> Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6 items-start">
          
          {/* Auth Section */}
          <Card className="p-8 shadow-apple-lg border-0 bg-white dark:bg-[#1C1C1E]">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                {isSignUp ? 'Create an account' : 'Sign in to EcoTrace'}
              </h1>
              <p className="mt-2 text-[#86868B]">
                {isSignUp 
                  ? 'Start tracking your carbon footprint today.' 
                  : 'Welcome back! Please enter your details.'}
              </p>
              {!isSignUp && (
                <div className="mt-4 p-3 rounded-lg bg-[#0071E3]/10 border border-[#0071E3]/20">
                  <p className="text-xs font-medium text-[#0071E3]">
                    👋 Demo User: <span className="font-bold">demo@ecotrace.com</span> / <span className="font-bold">password123</span>
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Email</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 text-sm text-[#FF3B30] bg-[#FF3B30]/10 p-3 rounded-lg">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <p>{errorMsg}</p>
                </div>
              )}

              {successMsg && (
                <div className="flex items-start gap-2 text-sm text-[#30D158] bg-[#30D158]/10 p-3 rounded-lg">
                  <p>{successMsg}</p>
                </div>
              )}

              <Button type="submit" className="w-full text-base py-6 shadow-apple-blue" disabled={loading}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-[#86868B]">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>{' '}
              <button 
                onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setSuccessMsg(''); }}
                className="font-semibold text-[#0071E3] hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </Card>

          {/* Guest Access Section */}
          <Card className="p-8 border-0 bg-transparent shadow-none md:bg-[#F5F5F7] md:dark:bg-[#1C1C1E] md:shadow-sm">
            <div className="text-center md:text-left space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0071E3]/10">
                <span className="text-2xl">🌱</span>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Just exploring?</h2>
                <p className="mt-3 text-[#86868B] leading-relaxed">
                  You don&apos;t need an account to use the carbon footprint calculator. You can access it immediately in guest mode.
                </p>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleGuestAccess} 
                  variant="secondary" 
                  className="w-full sm:w-auto"
                >
                  Continue as Guest
                </Button>
                <p className="text-xs text-[#86868B]">
                  *Note: Guest mode results are stored only in your browser and cannot be accessed from other devices or synced over time.
                </p>
              </div>
            </div>
          </Card>
          
        </div>
      </div>
    </div>
  );
}
