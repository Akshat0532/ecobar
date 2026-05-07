import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ScopeEmissionsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/resources" className="inline-flex items-center gap-2 text-sm font-medium text-[#0071E3] hover:underline mb-8">
        <ArrowLeft size={16} strokeWidth={1.5} /> Back to Resources
      </Link>

      <article className="space-y-8">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3]">Deep Dive</span>
            <span className="text-xs text-[#86868B]">7 min read</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Understanding Scope 1, 2, 3 Emissions
          </h1>
          <p className="text-lg text-[#86868B] leading-relaxed">
            The framework used by companies and governments — and why it matters for individuals too.
          </p>
        </header>

        <div className="h-px bg-[#D2D2D7] dark:bg-[#38383A]" />

        <div className="space-y-6 text-base leading-relaxed text-[#1D1D1F]/80 dark:text-[#F5F5F7]/80">
          <p>
            When organizations report their carbon footprint, they categorize emissions into three &ldquo;scopes.&rdquo; Understanding this framework helps you see the full picture of how carbon flows through the economy — and where individuals fit in.
          </p>

          <div className="space-y-4">
            {[
              {
                scope: 'Scope 1',
                label: 'Direct Emissions',
                color: '#FF3B30',
                desc: 'Emissions from sources you directly control — burning fuel in your car, cooking with gas, running a diesel generator.',
                examples: ['Driving your personal vehicle', 'Cooking with LPG or natural gas', 'Running a backup generator'],
                personal: 'Your commute and cooking fuel fall here. These are the easiest to measure and reduce.',
              },
              {
                scope: 'Scope 2',
                label: 'Indirect Energy Emissions',
                color: '#FF9500',
                desc: 'Emissions from the electricity, heating, or cooling you purchase. The power plant emits the CO₂, but you caused the demand.',
                examples: ['Electricity from the grid', 'District heating or cooling', 'Purchased steam for industrial use'],
                personal: 'Your electricity bill is Scope 2. In India, the grid emits 0.716 kg CO₂e per kWh (CEA 2023).',
              },
              {
                scope: 'Scope 3',
                label: 'Value Chain Emissions',
                color: '#0071E3',
                desc: 'Everything else — the carbon embedded in products you buy, flights you take, food you eat, and services you use.',
                examples: ['Manufacturing of purchased goods', 'Business travel and commuting', 'Waste disposal and treatment', 'Food production and transportation'],
                personal: 'This is the biggest and hardest to measure. Your food, clothing, and purchases all fall here.',
              },
            ].map((s) => (
              <div key={s.scope} className="rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{s.scope}: {s.label}</h3>
                </div>
                <p className="text-sm text-[#86868B]">{s.desc}</p>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#86868B] mb-2">Examples</p>
                  <ul className="space-y-1">
                    {s.examples.map((ex) => (
                      <li key={ex} className="text-sm text-[#86868B]">• {ex}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl p-4" style={{ backgroundColor: s.color + '0D' }}>
                  <p className="text-sm font-semibold" style={{ color: s.color }}>👤 For Individuals</p>
                  <p className="text-sm text-[#86868B] mt-1">{s.personal}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] pt-4">Why This Matters for You</h2>

          <div className="rounded-2xl bg-gradient-to-br from-[#0071E3]/5 to-[#5856D6]/5 dark:from-[#0071E3]/10 dark:to-[#5856D6]/10 p-6">
            <p className="text-sm text-[#86868B] leading-relaxed">
              Most personal carbon calculators (including EcoTrace) combine elements from all three scopes. Your electricity is Scope 2, your driving is Scope 1, and your food is Scope 3. By understanding the framework, you can see which levers you have the most control over — and where systemic changes (like cleaner grids) will help everyone.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center p-4 rounded-xl bg-[#F5F5F7] dark:bg-[#1C1C1E]">
              <p className="text-2xl font-bold text-[#FF3B30]">~25%</p>
              <p className="text-xs text-[#86868B] mt-1">Scope 1 (Direct)</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-[#F5F5F7] dark:bg-[#1C1C1E]">
              <p className="text-2xl font-bold text-[#FF9500]">~20%</p>
              <p className="text-xs text-[#86868B] mt-1">Scope 2 (Electricity)</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-[#F5F5F7] dark:bg-[#1C1C1E]">
              <p className="text-2xl font-bold text-[#0071E3]">~55%</p>
              <p className="text-xs text-[#86868B] mt-1">Scope 3 (Everything Else)</p>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
