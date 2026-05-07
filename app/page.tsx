import Link from 'next/link';
import { ClipboardList, BarChart3, TrendingUp, ArrowRight, Leaf } from 'lucide-react';

export default function HomePage() {
  const steps = [
    {
      step: 1,
      icon: <ClipboardList size={26} strokeWidth={1.5} className="text-[#2C5F2D]" />,
      title: 'Answer 3 Quick Questions',
      description: 'Share your energy and travel habits in a few minutes.',
      href: '/calculator',
      cta: 'Start Calculator',
    },
    {
      step: 2,
      icon: <BarChart3 size={26} strokeWidth={1.5} className="text-[#2C5F2D]" />,
      title: 'See Your Annual Tonnes',
      description: 'Get an annual footprint estimate with trusted CEA-based factors.',
      href: '/resources/methodology',
      cta: 'View Methodology',
    },
    {
      step: 3,
      icon: <TrendingUp size={26} strokeWidth={1.5} className="text-[#2C5F2D]" />,
      title: 'Track Your Progress Over Time',
      description: 'Monitor improvements and compare your results month to month.',
      href: '/dashboard',
      cta: 'Open Dashboard',
    },
  ];

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center text-center px-6">
        {/* Green gradient background — no grays */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#FAF9F6] via-[#FFFFFF] to-[#E8F0E6]
                        dark:from-[#0F1F0F] dark:via-[#122012] dark:to-[#0F1F0F]" />

        {/* Subtle leaf motif top-right */}
        <div className="absolute top-16 right-8 text-[#9CAF88]/20 dark:text-[#9CAF88]/10 select-none pointer-events-none text-8xl" aria-hidden="true">
          🌿
        </div>
        <div className="absolute bottom-24 left-8 text-[#9CAF88]/15 dark:text-[#9CAF88]/8 select-none pointer-events-none text-6xl" aria-hidden="true">
          🍃
        </div>

        <div className="max-w-4xl mx-auto eco-slide-up">
          {/* Eyebrow label */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#9CAF88] bg-[#9CAF88]/10 px-4 py-1.5 text-xs font-semibold text-[#2C5F2D] dark:text-[#4A8F4B] mb-8">
            <Leaf size={12} strokeWidth={2} aria-hidden="true" />
            Green Initiative — Carbon Tracker
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#1A3B1A] dark:text-[#E8F0E8] mb-6 leading-[1.1]">
            Understand your{' '}
            <span className="text-[#2C5F2D] dark:text-[#4A8F4B]">impact.</span>
            <br />
            One number at a time.
          </h1>

          <p className="text-xl md:text-2xl text-[#6B8E23] dark:text-[#A8BEA8] mb-10 max-w-2xl mx-auto leading-relaxed">
            A private, beautifully simple carbon tracker that shows you where
            you can make the biggest difference — for India, by design.
          </p>

          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            {/* Primary CTA — filled emerald (only one per page) */}
            <Link href="/calculator">
              <button
                id="hero-cta-calculator"
                className="rounded-lg px-8 py-4 text-base font-semibold bg-[#2C5F2D] hover:bg-[#245224] text-white shadow-[0_4px_20px_rgba(44,95,45,0.25)] transition-colors duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2C5F2D] focus-visible:ring-offset-2"
              >
                Calculate Your Footprint
              </button>
            </Link>
            {/* Secondary — outline style */}
            <a
              href="#how-it-works"
              className="rounded-lg px-8 py-4 text-base font-semibold border-2 border-[#2C5F2D] text-[#2C5F2D] dark:text-[#4A8F4B] dark:border-[#4A8F4B] hover:bg-[#2C5F2D]/5 transition-colors duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2C5F2D] focus-visible:ring-offset-2"
            >
              Learn More →
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats Snapshot ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="rounded-lg bg-white dark:bg-[#1E331E] border-t-2 border-t-[#9CAF88] p-8
                        shadow-[0_1px_8px_rgba(44,95,45,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6B8E23] dark:text-[#A8BEA8] mb-6 text-center">
            EcoTrace Snapshot
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg bg-[#F0EAD6] dark:bg-[#2A3D2A] p-6 text-center">
              <p className="text-sm text-[#6B8E23] dark:text-[#A8BEA8]">Average savings</p>
              <p className="mt-3 text-4xl font-bold text-[#2C5F2D] dark:text-[#4A8F4B] font-display">1.8</p>
              <p className="text-sm text-[#6B8E23] dark:text-[#A8BEA8]">metric tons CO₂/year</p>
            </div>
            <div className="rounded-lg bg-[#F0EAD6] dark:bg-[#2A3D2A] p-6 text-center">
              <p className="text-sm text-[#6B8E23] dark:text-[#A8BEA8]">Trusted by</p>
              <p className="mt-3 text-4xl font-bold text-[#2C5F2D] dark:text-[#4A8F4B] font-display">500+</p>
              <p className="text-sm text-[#6B8E23] dark:text-[#A8BEA8]">households across India</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="space-y-3 text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#6B8E23] dark:text-[#A8BEA8]">How it works</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#1A3B1A] dark:text-[#E8F0E8]">
            A simple three-step process
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <Link
              key={step.title}
              href={step.href}
              className="group relative rounded-lg bg-white dark:bg-[#1E331E]
                         border-t-2 border-t-[#9CAF88] p-8
                         shadow-[0_1px_8px_rgba(44,95,45,0.06)]
                         transition-colors duration-200
                         hover:border-t-[#2C5F2D]
                         focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2C5F2D] focus-visible:ring-offset-2
                         block"
            >
              {/* Step badge */}
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#2C5F2D]/10 flex items-center justify-center">
                <span className="text-sm font-bold text-[#2C5F2D] dark:text-[#4A8F4B]">{step.step}</span>
              </div>

              {/* Icon */}
              <div className="mb-5 inline-flex h-13 w-13 items-center justify-center rounded-lg bg-[#2C5F2D]/8 p-3">
                {step.icon}
              </div>

              <h3 className="text-lg font-semibold text-[#1A3B1A] dark:text-[#E8F0E8] group-hover:text-[#2C5F2D] dark:group-hover:text-[#4A8F4B] transition-colors">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#6B8E23] dark:text-[#A8BEA8]">
                {step.description}
              </p>

              {/* CTA arrow */}
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#2C5F2D] dark:text-[#4A8F4B] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {step.cta}
                <ArrowRight size={15} strokeWidth={2} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Trust Pillars ────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-[#F0EAD6] dark:bg-[#1E331E] p-10
                        shadow-[0_1px_8px_rgba(44,95,45,0.06)]">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: 'Methodology Based on CEA Data', subtitle: 'Science-backed Indian grid and emissions factors for reliable results.' },
              { title: '100% Private by Design', subtitle: 'Your calculations stay local unless you choose to save them.' },
              { title: 'Used by 500+ Conscious Households', subtitle: 'A trusted companion for sustainable living across India.' },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-lg bg-white dark:bg-[#243824] p-6 text-center
                           border-t-2 border-t-[#9CAF88]"
              >
                <p className="text-base font-semibold text-[#1A3B1A] dark:text-[#E8F0E8]">{card.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#6B8E23] dark:text-[#A8BEA8]">{card.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA Banner ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-gradient-to-br from-[#2C5F2D] to-[#4A7A2C] p-12 text-center
                        shadow-[0_8px_40px_rgba(44,95,45,0.20)]">
          <div className="flex justify-center mb-4" aria-hidden="true">
            <Leaf size={28} strokeWidth={1.5} className="text-[#9CAF88]" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">Ready to start?</p>
          <h2 className="mt-4 text-3xl md:text-4xl font-semibold text-white">
            It&rsquo;s free to calculate your impact.
          </h2>
          <p className="mt-3 text-base text-white/70 max-w-md mx-auto leading-relaxed">
            Join hundreds of Indian households tracking and reducing their carbon footprint.
          </p>
          <Link href="/calculator">
            <button
              id="bottom-cta-calculator"
              className="mt-8 rounded-lg bg-[#F5F5DC] px-8 py-4 text-sm font-semibold text-[#2C5F2D]
                         hover:bg-white transition-colors duration-200 min-h-[44px]
                         focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2C5F2D]"
            >
              Try the Calculator
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
