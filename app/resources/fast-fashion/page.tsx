import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function FastFashionPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/resources" className="inline-flex items-center gap-2 text-sm font-medium text-[#0071E3] hover:underline mb-8">
        <ArrowLeft size={16} strokeWidth={1.5} /> Back to Resources
      </Link>

      <article className="space-y-8">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3]">Lifestyle</span>
            <span className="text-xs text-[#86868B]">5 min read</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            The Real Impact of Fast Fashion
          </h1>
          <p className="text-lg text-[#86868B] leading-relaxed">
            Your wardrobe has a carbon footprint. Here&rsquo;s how big it is and what you can do about it.
          </p>
        </header>

        <div className="h-px bg-[#D2D2D7] dark:bg-[#38383A]" />

        <div className="space-y-6 text-base leading-relaxed text-[#1D1D1F]/80 dark:text-[#F5F5F7]/80">
          <p>
            The fashion industry produces <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">10% of global carbon emissions</strong> — more than international flights and maritime shipping combined. Fast fashion accelerates this by encouraging rapid consumption and disposal.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { stat: '92M', label: 'tonnes of textile waste per year globally', color: '#FF3B30' },
              { stat: '700', label: 'gallons of water for one cotton T-shirt', color: '#0071E3' },
              { stat: '60%', label: 'of clothes end up in landfills within a year', color: '#FF9500' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-5 text-center">
                <p className="text-3xl font-bold" style={{ color: s.color }}>{s.stat}</p>
                <p className="text-xs text-[#86868B] mt-2">{s.label}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] pt-4">Carbon Cost of Common Garments</h2>

          <div className="space-y-3">
            {[
              { item: '👟 Pair of sneakers', co2: '13.6 kg CO₂e', detail: 'From raw materials to shipping to your door' },
              { item: '👖 Pair of jeans', co2: '33.4 kg CO₂e', detail: 'Cotton farming, dyeing, and water-intensive processing' },
              { item: '👕 Cotton T-shirt', co2: '8.0 kg CO₂e', detail: 'Growing, spinning, weaving, and finishing' },
              { item: '🧥 Winter jacket', co2: '39.2 kg CO₂e', detail: 'Synthetic filling and complex manufacturing' },
              { item: '👗 Polyester dress', co2: '17.0 kg CO₂e', detail: 'Petroleum-based fabric with high energy production' },
            ].map((g) => (
              <div key={g.item} className="flex items-center gap-4 rounded-xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-4">
                <span className="text-lg">{g.item}</span>
                <div className="flex-1">
                  <p className="text-xs text-[#86868B]">{g.detail}</p>
                </div>
                <span className="text-sm font-bold text-[#FF3B30] whitespace-nowrap">{g.co2}</span>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] pt-4">7 Ways to Reduce Your Fashion Footprint</h2>

          <div className="space-y-3">
            {[
              { title: 'Buy Less, Choose Well', desc: 'The most impactful thing you can do. Ask: "Will I wear this 30+ times?"' },
              { title: 'Shop Secondhand', desc: 'Thrift stores, online resale platforms, and clothing swaps extend garment life.' },
              { title: 'Choose Natural Fibers', desc: 'Organic cotton, linen, and hemp have lower carbon footprints than polyester.' },
              { title: 'Repair Before Replacing', desc: 'Learn basic mending or find a local tailor. A simple stitch saves a garment.' },
              { title: 'Wash Cold, Line Dry', desc: 'Washing at 30°C uses 40% less energy. Air-drying saves even more.' },
              { title: 'Avoid Microfiber Shedding', desc: 'Use a microfiber-catching laundry bag when washing synthetics.' },
              { title: 'Support Sustainable Brands', desc: 'Look for certifications: GOTS, OEKO-TEX, Fair Trade, or B-Corp.' },
            ].map((tip, i) => (
              <div key={tip.title} className="flex gap-4 rounded-xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#0071E3]/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#0071E3]">{i + 1}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-sm">{tip.title}</h4>
                  <p className="text-sm text-[#86868B] mt-0.5">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#5856D6]/10 to-[#0071E3]/5 dark:from-[#5856D6]/20 dark:to-[#0071E3]/10 p-6">
            <h3 className="text-lg font-semibold text-[#5856D6] mb-2">✨ The 30-Wear Rule</h3>
            <p className="text-sm text-[#86868B]">
              Before buying any garment, ask yourself: <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">&ldquo;Will I wear this at least 30 times?&rdquo;</strong> If the answer is no, skip it. This single habit can halve your fashion carbon footprint.
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}
