'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const subscribe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      setMessage('Please enter a valid email address.');
      return;
    }
    console.log('Newsletter signup:', email);
    setMessage("Thanks! We'll share a few updates by email.");
    setEmail('');
  };

  return (
    <footer className="bg-[#F5F5F7] dark:bg-[#162716] text-[#1A3B1A] dark:text-[#E8F0E8]">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Leaf size={18} strokeWidth={1.5} className="text-[#9CAF88]" aria-hidden="true" />
          <span className="text-lg font-semibold tracking-tight">EcoTrace</span>
        </div>

        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#2C5F2D] dark:text-[#4A8F4B]">Product</h3>
            <div className="space-y-2.5 text-sm text-[#6B8E23] dark:text-[#A8BEA8]">
              <Link href="/calculator" className="block hover:text-[#9CAF88] transition-colors">Calculator</Link>
              <Link href="/dashboard" className="block hover:text-[#9CAF88] transition-colors">Dashboard</Link>
              <Link href="/pricing" className="block hover:text-[#9CAF88] transition-colors">Pricing</Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#2C5F2D] dark:text-[#4A8F4B]">Company</h3>
            <div className="space-y-2.5 text-sm text-[#6B8E23] dark:text-[#A8BEA8]">
              <Link href="/about" className="block hover:text-[#9CAF88] transition-colors">About Us</Link>
              <Link href="/contact" className="block hover:text-[#9CAF88] transition-colors">Contact</Link>
              <Link href="/blog" className="block hover:text-[#9CAF88] transition-colors">Blog</Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#2C5F2D] dark:text-[#4A8F4B]">Legal</h3>
            <div className="space-y-2.5 text-sm text-[#6B8E23] dark:text-[#A8BEA8]">
              <Link href="/privacy" className="block hover:text-[#9CAF88] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="block hover:text-[#9CAF88] transition-colors">Terms of Service</Link>
              <Link href="/privacy#cookies" className="block hover:text-[#9CAF88] transition-colors">Cookie Preferences</Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#2C5F2D] dark:text-[#4A8F4B]">Newsletter</h3>
            <p className="text-sm text-[#6B8E23] dark:text-[#A8BEA8] leading-relaxed">
              Get updates on new features, climate insights, and practical footprint tips.
            </p>
            <form onSubmit={subscribe} className="space-y-3">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email for newsletter"
                className="bg-white dark:bg-[#1E331E] border-[#9CAF88]/40 dark:border-[#2A3D2A] text-[#1A3B1A] dark:text-[#E8F0E8] placeholder:text-[#6B8E23] dark:placeholder:text-[#A8BEA8] focus:border-[#9CAF88] focus:ring-[#9CAF88]/30"
              />
              <Button type="submit" variant="primary" className="w-full">
                Subscribe
              </Button>
              {message && <p className="text-xs text-[#9CAF88]">{message}</p>}
            </form>
          </div>
        </div>

        {/* Leaf separator */}
        <div className="flex items-center gap-3 text-[#9CAF88]/60" aria-hidden="true">
          <div className="flex-1 h-px bg-[#9CAF88]/25" />
          <span className="text-sm">🌿</span>
          <div className="flex-1 h-px bg-[#9CAF88]/25" />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#6B8E23] dark:text-[#A8BEA8]">
          <p>© {new Date().getFullYear()} EcoTrace. All rights reserved.</p>
          <div className="flex items-center gap-2 rounded-lg border border-[#9CAF88]/30 bg-white dark:bg-[#1E331E] px-4 py-2 text-xs text-[#9CAF88]">
            <span aria-hidden="true">🌱</span>
            <span>This page weighs ~0.8g CO₂ – sustainable hosting, low-carbon design</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
