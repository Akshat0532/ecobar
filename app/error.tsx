'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-24 text-center">
      <div className="rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-10 shadow-apple">
        <p className="text-sm font-medium uppercase tracking-widest text-[#86868B]">Something went wrong</p>
        <h1 className="mt-4 text-4xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">We hit a snag.</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#86868B]">
          Sorry for the inconvenience. Please try again or return to the home page.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => reset()}>Retry</Button>
          <Link href="/">
            <Button variant="secondary">Go Home</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
