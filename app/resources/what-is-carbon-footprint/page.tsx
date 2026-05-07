import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function WhatIsCarbonFootprintPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/resources" className="inline-flex items-center gap-2 text-sm font-medium text-[#0071E3] hover:underline mb-8">
        <ArrowLeft size={16} strokeWidth={1.5} /> Back to Resources
      </Link>

      <article className="space-y-8">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3]">Basics</span>
            <span className="text-xs text-[#86868B]">4 min read</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            What is a Carbon Footprint?
          </h1>
          <p className="text-lg text-[#86868B] leading-relaxed">
            Everything you need to know about measuring your personal impact on the climate.
          </p>
        </header>

        <div className="h-px bg-[#D2D2D7] dark:bg-[#38383A]" />

        <div className="prose-apple space-y-6 text-base leading-relaxed text-[#1D1D1F]/80 dark:text-[#F5F5F7]/80">
          <p>
            A <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">carbon footprint</strong> measures how much greenhouse gas you generate through your daily habits, travel, home energy use, and purchases. It is expressed in carbon dioxide equivalent (CO₂e), which makes it easier to compare electricity use, driving, flights, and food on the same scale.
          </p>

          <div className="rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-6">
            <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">🌍 Why Does It Matter?</h3>
            <p className="text-sm leading-relaxed text-[#86868B]">
              The average person in India produces roughly 1.9 tonnes of CO₂e per year. Understanding where your emissions come from is the first step toward reducing them meaningfully.
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] pt-4">The Main Categories</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { emoji: '🏠', title: 'Home Energy', desc: 'Electricity, gas, heating, and cooling account for about 30-40% of household emissions.' },
              { emoji: '🚗', title: 'Transportation', desc: 'Cars, flights, and public transit. A single long-haul flight can equal months of driving.' },
              { emoji: '🍽️', title: 'Food & Diet', desc: 'Meat production generates significantly more CO₂ than plant-based alternatives.' },
              { emoji: '🛍️', title: 'Goods & Services', desc: 'Everything you buy has embodied carbon—from manufacturing to shipping.' },
            ].map((cat) => (
              <div key={cat.title} className="rounded-xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-5">
                <div className="text-2xl mb-2">{cat.emoji}</div>
                <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{cat.title}</h4>
                <p className="text-sm text-[#86868B] mt-1">{cat.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] pt-4">How to Reduce Your Footprint</h2>

          <p>
            Tracking your footprint can help you prioritize the behaviors that matter most and make measurable progress toward lower emissions. The key is to focus on your <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">biggest impact areas</strong> first—usually transportation and home energy.
          </p>

          <div className="rounded-2xl bg-gradient-to-br from-[#0071E3]/5 to-[#30D158]/5 dark:from-[#0071E3]/10 dark:to-[#30D158]/10 p-6">
            <h3 className="text-lg font-semibold text-[#0071E3] mb-2">💡 Quick Wins</h3>
            <ul className="space-y-2 text-sm text-[#86868B]">
              <li>• Switch to LED lighting (saves ~50 kg CO₂e/year)</li>
              <li>• Take public transit once a week (saves ~200 kg CO₂e/year)</li>
              <li>• Eat one less meat meal per week (saves ~150 kg CO₂e/year)</li>
              <li>• Air-dry clothes instead of using a dryer (saves ~100 kg CO₂e/year)</li>
            </ul>
          </div>
        </div>

        <div className="pt-6">
          <Link href="/calculator" className="inline-flex items-center gap-2 rounded-full bg-[#0071E3] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0077ED] transition-all active:scale-[0.97]">
            Calculate Your Footprint →
          </Link>
        </div>
      </article>
    </main>
  );
}
