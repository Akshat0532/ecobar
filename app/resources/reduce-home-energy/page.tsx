import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ReduceHomeEnergyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/resources" className="inline-flex items-center gap-2 text-sm font-medium text-[#0071E3] hover:underline mb-8">
        <ArrowLeft size={16} strokeWidth={1.5} /> Back to Resources
      </Link>

      <article className="space-y-8">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3]">Tips</span>
            <span className="text-xs text-[#86868B]">6 min read</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            10 Easy Ways to Reduce Home Energy Use
          </h1>
          <p className="text-lg text-[#86868B] leading-relaxed">
            Small changes can add up to big savings — both for your wallet and the planet.
          </p>
        </header>

        <div className="h-px bg-[#D2D2D7] dark:bg-[#38383A]" />

        <div className="space-y-6 text-base leading-relaxed text-[#1D1D1F]/80 dark:text-[#F5F5F7]/80">
          <p>
            Home energy use accounts for <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">30-40% of your personal carbon footprint</strong>. The good news? Many of the highest-impact changes are simple, free, and start saving CO₂ immediately.
          </p>

          <div className="space-y-4">
            {[
              { num: 1, title: 'Switch to LED Lighting', desc: 'LED bulbs use 75% less energy and last 25x longer. A single swap saves ~8 kg CO₂e/year per bulb.', savings: '50 kg/year' },
              { num: 2, title: 'Seal Air Leaks', desc: 'Check windows, doors, and ducts. Weatherstripping costs little but can reduce heating/cooling losses by 20%.', savings: '120 kg/year' },
              { num: 3, title: 'Use a Programmable Thermostat', desc: 'Set temperatures lower when sleeping or away. Each degree saves roughly 3% on your energy bill.', savings: '90 kg/year' },
              { num: 4, title: 'Run Full Loads Only', desc: 'Wait until the dishwasher and washing machine are full. Fewer cycles = less energy and water.', savings: '40 kg/year' },
              { num: 5, title: 'Air-Dry Your Clothes', desc: 'Skip the dryer when possible. Line-drying is free and saves significant electricity.', savings: '100 kg/year' },
              { num: 6, title: 'Maintain Your HVAC System', desc: 'Replace filters quarterly and schedule annual tune-ups. Clean systems run 15% more efficiently.', savings: '80 kg/year' },
              { num: 7, title: 'Upgrade to a 5-Star Rated Appliance', desc: 'When replacing old appliances, choose BEE 5-star rated models for maximum efficiency.', savings: '150 kg/year' },
              { num: 8, title: 'Use a Pressure Cooker', desc: 'Pressure cooking uses 50-75% less energy than conventional pots. Essential for Indian kitchens!', savings: '30 kg/year' },
              { num: 9, title: 'Install a Solar Water Heater', desc: 'Solar geysers pay for themselves within 2-3 years and eliminate one of the biggest energy drains.', savings: '200 kg/year' },
              { num: 10, title: 'Unplug Phantom Loads', desc: 'Devices on standby still draw power. Use power strips and turn them off when not in use.', savings: '45 kg/year' },
            ].map((tip) => (
              <div key={tip.num} className="flex gap-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-5 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#0071E3]/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#0071E3]">{tip.num}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{tip.title}</h3>
                    <span className="text-xs font-semibold text-[#30D158] bg-[#30D158]/10 px-2 py-0.5 rounded-full whitespace-nowrap">−{tip.savings}</span>
                  </div>
                  <p className="text-sm text-[#86868B] mt-1">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#30D158]/10 to-[#0071E3]/5 dark:from-[#30D158]/20 dark:to-[#0071E3]/10 p-6">
            <h3 className="text-lg font-semibold text-[#30D158] mb-2">🌿 Total Potential Savings</h3>
            <p className="text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">~905 kg CO₂e/year</p>
            <p className="text-sm text-[#86868B] mt-2">That&rsquo;s nearly half a tonne — equivalent to planting 15 trees.</p>
          </div>

          <p>
            These actions are easy to track in the calculator and can meaningfully lower your household carbon impact. Start with the top 3 and build from there.
          </p>
        </div>

        <div className="pt-6">
          <Link href="/calculator" className="inline-flex items-center gap-2 rounded-full bg-[#0071E3] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0077ED] transition-all active:scale-[0.97]">
            Track Your Savings →
          </Link>
        </div>
      </article>
    </main>
  );
}
