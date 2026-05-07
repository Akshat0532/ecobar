'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Menu, User, LogOut, Settings, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { getBrowserSupabaseClient } from '@/lib/supabaseClient';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/about', label: 'About' },
  { href: '/resources', label: 'Resources' },
];

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lowCarbon, setLowCarbon] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll-aware header background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Persist and apply Low Carbon Mode
  useEffect(() => {
    const saved = localStorage.getItem('low_carbon_mode') === 'true';
    setLowCarbon(saved);
    document.documentElement.classList.toggle('low-carbon', saved);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setGuestMode(window.localStorage.getItem('guest_mode') === 'true');

    const supabase = getBrowserSupabaseClient();

    // Check initial auth state
    const checkAuth = () => {
      supabase.auth
        .getUser()
        .then(({ data }) => {
          if (data.user) {
            setSession(data.user);
          } else if (window.localStorage.getItem('demo_user') === 'true') {
            setSession({ email: 'demo@ecotrace.com' });
          } else {
            setSession(null);
          }
        })
        .catch(() => {
          // Fallback for demo mode
          if (window.localStorage.getItem('demo_user') === 'true') {
            setSession({ email: 'demo@ecotrace.com' });
          } else {
            setSession(null);
          }
        });
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sessionData) => {
      if (sessionData?.user) {
        setSession(sessionData.user);
      } else if (window.localStorage.getItem('demo_user') === 'true') {
        setSession({ email: 'demo@ecotrace.com' });
      } else {
        setSession(null);
      }
    });

    return () => { subscription?.unsubscribe?.(); };
  }, []);

  const initials = useMemo(() => {
    if (!session?.email) return 'ET';
    const [name] = session.email.split('@');
    const parts = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [session]);

  const handleSignOut = async () => {
    const supabase = getBrowserSupabaseClient();
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('guest_mode');
      window.location.href = '/';
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const toggleLowCarbon = () => {
    const next = !lowCarbon;
    setLowCarbon(next);
    localStorage.setItem('low_carbon_mode', String(next));
    document.documentElement.classList.toggle('low-carbon', next);
  };

  // Header: transparent on hero, solid cream on scroll
  const headerBg = scrolled
    ? 'bg-[#F5F5DC]/95 dark:bg-[#162716]/95 backdrop-blur-md shadow-[0_1px_12px_rgba(44,95,45,0.08)]'
    : 'bg-transparent';

  const activeLink = 'text-[#2C5F2D] dark:text-[#4A8F4B] font-semibold underline underline-offset-4 decoration-[#9CAF88]';
  const inactiveLink = 'text-[#1A3B1A] dark:text-[#E8F0E8] hover:text-[#2C5F2D] dark:hover:text-[#4A8F4B]';

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${headerBg}`}>
      <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-[#2C5F2D] dark:text-[#4A8F4B]" aria-hidden="true">
            <Leaf size={20} strokeWidth={1.5} />
          </span>
          <Link
            href="/"
            className="text-lg font-semibold text-[#1A3B1A] dark:text-[#E8F0E8] tracking-tight"
          >
            EcoTrace
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                pathname === item.href ? activeLink : inactiveLink
              }`}
            >
              {item.label}
            </Link>
          ))}
          {session ? (
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors ${
                pathname === '/dashboard' ? activeLink : inactiveLink
              }`}
            >
              Dashboard
            </Link>
          ) : null}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">

          {/* Low Carbon Mode Toggle */}
          {mounted && (
            <button
              type="button"
              onClick={toggleLowCarbon}
              title={lowCarbon ? 'Low Carbon Mode: ON — click to disable' : 'Enable Low Carbon Mode'}
              aria-pressed={lowCarbon}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors min-h-[44px] ${
                lowCarbon
                  ? 'bg-[#2C5F2D] text-white'
                  : 'border border-[#2C5F2D] text-[#2C5F2D] hover:bg-[#2C5F2D]/5'
              }`}
            >
              <Leaf size={13} strokeWidth={2} />
              {lowCarbon ? 'Eco Mode' : 'Eco Mode'}
            </button>
          )}

          {/* Theme Toggle */}
          {mounted && (
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[#6B8E23] hover:text-[#2C5F2D] hover:bg-[#2C5F2D]/5 transition-colors"
              aria-label="Toggle light/dark theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun size={18} strokeWidth={1.5} />
              ) : (
                <Moon size={18} strokeWidth={1.5} />
              )}
            </button>
          )}

          {/* Auth */}
          {session ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#2C5F2D]/10 text-sm font-semibold text-[#2C5F2D] dark:bg-[#4A8F4B]/20 dark:text-[#4A8F4B] transition-colors hover:bg-[#2C5F2D]/20"
              >
                {initials}
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[#F5F5DC] dark:bg-[#1E331E] border border-[#D4E4CC] dark:border-[#2E4E2E] p-1.5 shadow-[0_4px_24px_rgba(44,95,45,0.12)]">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-[#1A3B1A] dark:text-[#E8F0E8] hover:bg-[#9CAF88]/20 transition-colors"
                  >
                    <User size={15} strokeWidth={1.5} />
                    Profile
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-[#1A3B1A] dark:text-[#E8F0E8] hover:bg-[#9CAF88]/20 transition-colors"
                  >
                    <Settings size={15} strokeWidth={1.5} />
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-0.5 w-full flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm text-[#1A3B1A] dark:text-[#E8F0E8] hover:bg-[#9CAF88]/20 transition-colors"
                  >
                    <LogOut size={15} strokeWidth={1.5} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : guestMode ? (
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-[#E07A5F]/10 px-3 py-1.5 text-xs font-semibold text-[#E07A5F]">
                Guest Session
              </span>
              <Link href="/login">
                <Button variant="secondary">Sign Up</Button>
              </Link>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="secondary">Sign In</Button>
            </Link>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          {mounted && (
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[#6B8E23] hover:text-[#2C5F2D] transition-colors"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun size={18} strokeWidth={1.5} />
              ) : (
                <Moon size={18} strokeWidth={1.5} />
              )}
            </button>
          )}

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[#1A3B1A] dark:text-[#E8F0E8] hover:bg-[#2C5F2D]/5 transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu size={20} strokeWidth={1.5} />
              </button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-6">
                <div className="space-y-1 border-b border-[#D4E4CC] dark:border-[#2E4E2E] pb-4">
                  <p className="text-xs font-medium uppercase tracking-widest text-[#6B8E23] mb-3">Navigation</p>
                  {navLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                        pathname === item.href
                          ? 'text-[#2C5F2D] bg-[#2C5F2D]/8 font-semibold'
                          : 'text-[#1A3B1A] dark:text-[#E8F0E8] hover:bg-[#9CAF88]/15'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  {session && (
                    <Link
                      href="/dashboard"
                      className="block rounded-lg px-3 py-3 text-sm font-medium text-[#1A3B1A] dark:text-[#E8F0E8] hover:bg-[#9CAF88]/15 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                </div>

                {/* Low Carbon toggle in mobile menu */}
                {mounted && (
                  <button
                    type="button"
                    onClick={toggleLowCarbon}
                    aria-pressed={lowCarbon}
                    className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                      lowCarbon
                        ? 'bg-[#2C5F2D] text-white'
                        : 'border border-[#2C5F2D] text-[#2C5F2D]'
                    }`}
                  >
                    <Leaf size={15} strokeWidth={2} />
                    {lowCarbon ? 'Eco Mode: ON' : 'Enable Eco Mode'}
                  </button>
                )}

                <div className="space-y-3">
                  {session ? (
                    <>
                      <Link
                        href="/profile"
                        className="block rounded-lg bg-[#F0EAD6] dark:bg-[#2A3D2A] px-4 py-3 text-sm font-medium text-[#1A3B1A] dark:text-[#E8F0E8] text-center transition-colors hover:bg-[#E8DDD0]"
                        onClick={() => setMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full rounded-lg bg-[#2C5F2D] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#245224]"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : guestMode ? (
                    <Link
                      href="/login"
                      className="block rounded-lg bg-[#2C5F2D] px-4 py-3 text-sm font-semibold text-white text-center hover:bg-[#245224]"
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="block rounded-lg bg-[#2C5F2D] px-4 py-3 text-sm font-semibold text-white text-center hover:bg-[#245224]"
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
