import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/resources" className="inline-flex items-center gap-2 text-sm font-medium text-[#0071E3] hover:underline mb-8">
        <ArrowLeft size={16} strokeWidth={1.5} /> Back to Resources
      </Link>

      <article className="space-y-8">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3]">Methodology</span>
            <span className="text-xs text-[#86868B]">5 min read</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            How We Calculate Your Numbers
          </h1>
          <p className="text-lg text-[#86868B] leading-relaxed">
            An honest look at the data sources, emission factors, and assumptions behind EcoTrace.
          </p>
        </header>

        <div className="h-px bg-[#D2D2D7] dark:bg-[#38383A]" />

        <div className="space-y-6 text-base leading-relaxed text-[#1D1D1F]/80 dark:text-[#F5F5F7]/80">
          <p>
            EcoTrace combines sector-specific emission factors with your usage estimates to produce a straightforward personal footprint score. Our goal is transparency—here&rsquo;s exactly how we arrive at your numbers.
          </p>

          <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] pt-4">Data Sources</h2>

          <div className="space-y-3">
            {[
              { source: 'CEA (India)', detail: 'Grid emission factor of 0.716 kg CO₂e per kWh for Indian electricity.' },
              { source: 'IPCC AR6', detail: 'Global warming potentials and lifecycle assessment benchmarks.' },
              { source: 'EPA (US)', detail: 'Supplementary transportation and goods emission factors.' },
              { source: 'MoEFCC (India)', detail: 'LPG, PNG, and cooking fuel emission factors for Indian households.' },
            ].map((item) => (
              <div key={item.source} className="flex gap-4 rounded-xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-4">
                <div className="flex-shrink-0 w-24 text-sm font-semibold text-[#0071E3]">{item.source}</div>
                <p className="text-sm text-[#86868B]">{item.detail}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] pt-4">Calculation Formula</h2>

          <div className="rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-6 font-mono text-sm">
            <p className="text-[#0071E3] mb-2">{'// Monthly per-capita footprint'}</p>
            <p className="text-[#1D1D1F] dark:text-[#F5F5F7]">
              total = (electricity × 0.716) + (lpg × 42.5) + (png × 2.04)<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (vehicle_km × fuel_factor)<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (transit_km × 0.02)<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ diet_factor + goods_factor
            </p>
            <p className="text-[#86868B] mt-2">{'// Divided by household size for per-capita'}</p>
          </div>

          <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] pt-4">Known Limitations</h2>

          <div className="rounded-2xl bg-[#FF9500]/5 dark:bg-[#FF9500]/10 p-6">
            <h3 className="font-semibold text-[#FF9500] mb-3">⚠️ What We Don&rsquo;t Capture</h3>
            <ul className="space-y-2 text-sm text-[#86868B]">
              <li>• <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">Embodied carbon</strong> in building materials and infrastructure</li>
              <li>• <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">Upstream emissions</strong> from your employer or government services</li>
              <li>• <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">Regional grid variations</strong> within India (we use a national average)</li>
              <li>• <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">Seasonal differences</strong> in energy use patterns</li>
            </ul>
          </div>

          <p>
            The calculator is designed to be <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">directional</strong>: it helps you see where to reduce emissions and compare relative improvements over time, not produce audit-grade numbers.
          </p>
        </div>
      </article>
    </main>
  );
}
