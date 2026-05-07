import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SustainableFoodPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/resources" className="inline-flex items-center gap-2 text-sm font-medium text-[#0071E3] hover:underline mb-8">
        <ArrowLeft size={16} strokeWidth={1.5} /> Back to Resources
      </Link>

      <article className="space-y-8">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3]">Food</span>
            <span className="text-xs text-[#86868B]">6 min read</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Sustainable Food Choices That Actually Matter
          </h1>
          <p className="text-lg text-[#86868B] leading-relaxed">
            Not all food swaps are equal. Here&rsquo;s what the data says about making your diet more planet-friendly.
          </p>
        </header>

        <div className="h-px bg-[#D2D2D7] dark:bg-[#38383A]" />

        <div className="space-y-6 text-base leading-relaxed text-[#1D1D1F]/80 dark:text-[#F5F5F7]/80">
          <p>
            Food production accounts for <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">26% of global greenhouse gas emissions</strong>. But the impact varies wildly between different foods. Understanding these differences lets you make swaps that genuinely move the needle.
          </p>

          <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] pt-4">Carbon Cost Comparison</h2>
          <p className="text-sm text-[#86868B]">kg CO₂e per kg of food produced (global averages)</p>

          <div className="space-y-3">
            {[
              { food: 'Beef (cattle)', co2: 60.0, bar: 100, color: '#FF3B30' },
              { food: 'Lamb & Mutton', co2: 24.0, bar: 40, color: '#FF3B30' },
              { food: 'Cheese', co2: 21.0, bar: 35, color: '#FF9500' },
              { food: 'Chicken', co2: 6.1, bar: 10, color: '#FF9500' },
              { food: 'Eggs', co2: 4.5, bar: 7.5, color: '#FF9500' },
              { food: 'Rice', co2: 4.0, bar: 6.7, color: '#FFD60A' },
              { food: 'Milk', co2: 3.2, bar: 5.3, color: '#FFD60A' },
              { food: 'Tofu', co2: 3.0, bar: 5, color: '#30D158' },
              { food: 'Lentils (Dal)', co2: 0.9, bar: 1.5, color: '#30D158' },
              { food: 'Vegetables', co2: 0.5, bar: 0.8, color: '#30D158' },
            ].map((item) => (
              <div key={item.food} className="flex items-center gap-4">
                <span className="w-32 text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7] text-right flex-shrink-0">{item.food}</span>
                <div className="flex-1 h-6 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.bar}%`, backgroundColor: item.color }} />
                </div>
                <span className="text-sm font-semibold w-16 text-right" style={{ color: item.color }}>{item.co2}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-6">
            <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">🇮🇳 India Context</h3>
            <p className="text-sm text-[#86868B] leading-relaxed">
              India already has one of the lowest per-capita food footprints thanks to widespread vegetarianism and dal-based diets. A traditional Indian vegetarian diet produces roughly <strong className="text-[#30D158]">60% less CO₂</strong> than a typical Western diet. If you&rsquo;re already vegetarian, your food footprint is likely well below global averages.
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] pt-4">5 High-Impact Swaps</h2>

          <div className="space-y-3">
            {[
              { from: 'Beef burger', to: 'Chickpea/paneer burger', savings: '~13 kg CO₂e saved per meal' },
              { from: 'Cow milk (1L)', to: 'Oat milk (1L)', savings: '~2.5 kg CO₂e saved' },
              { from: 'Imported cheese', to: 'Local paneer', savings: '~18 kg CO₂e saved per kg' },
              { from: 'White rice daily', to: 'Millets (ragi, jowar)', savings: '~3 kg CO₂e saved per kg' },
              { from: 'Food waste', to: 'Meal planning', savings: '~0.5 kg CO₂e saved per meal' },
            ].map((swap) => (
              <div key={swap.from} className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-4">
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-sm text-[#FF3B30] line-through">{swap.from}</span>
                  <span className="text-[#86868B]">→</span>
                  <span className="text-sm font-semibold text-[#30D158]">{swap.to}</span>
                </div>
                <span className="text-xs font-semibold text-[#0071E3] bg-[#0071E3]/10 px-2.5 py-1 rounded-full whitespace-nowrap">{swap.savings}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#30D158]/10 to-[#0071E3]/5 dark:from-[#30D158]/20 dark:to-[#0071E3]/10 p-6">
            <h3 className="text-lg font-semibold text-[#30D158] mb-2">💡 The Biggest Lever</h3>
            <p className="text-sm text-[#86868B]">
              Reducing beef and dairy has <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">5-10× more impact</strong> than buying organic or local. Geography of food matters far less than what type of food it is.
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}
