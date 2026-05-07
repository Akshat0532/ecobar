'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { calculateCarbonFootprint, type CalculatorInputs, type CalculatorResult } from '@/lib/calculator';

type CalculatorStep = 'home' | 'travel' | 'lifestyle' | 'results';

export function CalculatorWizard() {
  const [step, setStep] = useState<CalculatorStep>('home');
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const [monthlyElectricity, setMonthlyElectricity] = useState(250);
  const [monthlyLpgCylinders, setMonthlyLpgCylinders] = useState(1);
  const [monthlyPngScm, setMonthlyPngScm] = useState(0);
  const [householdSize, setHouseholdSize] = useState(4);

  const [vehicleType, setVehicleType] = useState<'TWO_WHEELER' | 'HATCHBACK' | 'SEDAN' | 'SUV' | 'DIESEL' | 'CNG' | 'HYBRID' | 'ELECTRIC'>('TWO_WHEELER');
  const [weeklyVehicleKm, setWeeklyVehicleKm] = useState(100);
  const [monthlyTransitKm, setMonthlyTransitKm] = useState(0);
  const [shortFlights, setShortFlights] = useState(1);
  const [mediumFlights, setMediumFlights] = useState(0);
  const [longFlights, setLongFlights] = useState(0);

  const [dietType, setDietType] = useState<'VEGAN' | 'VEGETARIAN' | 'EGGETARIAN' | 'BALANCED' | 'MEAT_HEAVY'>('BALANCED');
  const [monthlySpending, setMonthlySpending] = useState(15000);
  const [spendingLevel, setSpendingLevel] = useState<'CONSERVATIVE' | 'LIBERAL'>('CONSERVATIVE');

  const preview = useMemo(() => {
    return calculateCarbonFootprint({
      monthlyElectricity, monthlyLpgCylinders, monthlyPngScm, vehicleType,
      weeklyVehicleKm, monthlyTransitKm,
      annualFlights: { short: shortFlights, medium: mediumFlights, long: longFlights },
      dietType, monthlySpending, spendingLevel, householdSize,
    });
  }, [monthlyElectricity, monthlyLpgCylinders, monthlyPngScm, vehicleType, weeklyVehicleKm, monthlyTransitKm, shortFlights, mediumFlights, longFlights, dietType, monthlySpending, spendingLevel, householdSize]);

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/carbon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'FULL_CALCULATOR',
          inputs: {
            monthlyElectricity, monthlyLpgCylinders, monthlyPngScm, vehicleType,
            weeklyVehicleKm, monthlyTransitKm,
            annualFlights: { short: shortFlights, medium: mediumFlights, long: longFlights },
            dietType, monthlySpending, spendingLevel, householdSize,
          },
        }),
      });
      if (!response.ok) throw new Error('Calculation failed');
      return response.json();
    },
    onSuccess: (data) => { setResult(data); setStep('results'); },
  });

  const handleNext = () => {
    if (step === 'home') setStep('travel');
    else if (step === 'travel') setStep('lifestyle');
    else if (step === 'lifestyle') mutation.mutate();
  };

  const handleBack = () => {
    if (step === 'travel') setStep('home');
    else if (step === 'lifestyle') setStep('travel');
  };

  const selBtn = (active: boolean) =>
    `rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 ${
      active
        ? 'border-[#2C5F2D] bg-[#2C5F2D]/10 text-[#2C5F2D] dark:border-[#4A8F4B] dark:bg-[#4A8F4B]/10 dark:text-[#4A8F4B]'
        : 'border-[#D4E4CC] dark:border-[#2E4E2E] bg-white dark:bg-[#1E331E] text-[#1A3B1A] dark:text-[#E8F0E8] hover:border-[#2C5F2D]/60 dark:hover:border-[#4A8F4B]/60'
    }`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {step === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-[#1A3B1A] dark:text-[#E8F0E8]">Home Energy</h2>
                <p className="mt-2 text-sm text-[#6B8E23] dark:text-[#A8BEA8]">Start with your electricity and heating fuels.</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <Card>
                  <label className="block text-sm font-semibold text-[#1A3B1A] dark:text-[#E8F0E8] mb-3">Monthly Electricity (kWh)</label>
                  <Input type="number" min={0} step={10} value={monthlyElectricity} onChange={(e) => setMonthlyElectricity(Number(e.target.value))} />
                  <p className="mt-2 text-xs text-[#6B8E23] dark:text-[#A8BEA8]">India avg: 150-300 kWh</p>
                </Card>
                <Card>
                  <label className="block text-sm font-semibold text-[#1A3B1A] dark:text-[#E8F0E8] mb-3">LPG Cylinders (14.2 kg/mo)</label>
                  <Input type="number" min={0} step={0.5} value={monthlyLpgCylinders} onChange={(e) => setMonthlyLpgCylinders(Number(e.target.value))} />
                  <p className="mt-2 text-xs text-[#6B8E23] dark:text-[#A8BEA8]">India avg: 1 cylinder/month</p>
                </Card>
                <Card>
                  <label className="block text-sm font-semibold text-[#1A3B1A] dark:text-[#E8F0E8] mb-3">Piped Natural Gas (SCM/mo)</label>
                  <Input type="number" min={0} step={2} value={monthlyPngScm} onChange={(e) => setMonthlyPngScm(Number(e.target.value))} />
                  <p className="mt-2 text-xs text-[#6B8E23] dark:text-[#A8BEA8]">If you have PNG connection</p>
                </Card>
                <Card>
                  <label className="block text-sm font-semibold text-[#1A3B1A] dark:text-[#E8F0E8] mb-3">Household Size</label>
                  <Input type="number" min={1} max={10} value={householdSize} onChange={(e) => setHouseholdSize(Number(e.target.value))} />
                  <p className="mt-2 text-xs text-[#6B8E23] dark:text-[#A8BEA8]">For per-capita calculation</p>
                </Card>
              </div>
            </motion.div>
          )}

          {step === 'travel' && (
            <motion.div key="travel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-[#1A3B1A] dark:text-[#E8F0E8]">Travel & Transportation</h2>
                <p className="mt-2 text-sm text-[#6B8E23] dark:text-[#A8BEA8]">Your car, transit, and flight data.</p>
              </div>
              <Card>
                <label className="block text-sm font-semibold text-[#1A3B1A] dark:text-[#E8F0E8] mb-3">Vehicle Type</label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {['TWO_WHEELER', 'HATCHBACK', 'SEDAN', 'SUV', 'CNG', 'ELECTRIC'].map((vtype) => (
                    <button key={vtype} onClick={() => setVehicleType(vtype as any)} className={selBtn(vehicleType === vtype)}>{vtype}</button>
                  ))}
                </div>
              </Card>
              <div className="grid gap-6 sm:grid-cols-2">
                <Card>
                  <label className="block text-sm font-semibold text-[#1A3B1A] dark:text-[#E8F0E8] mb-3">Weekly Km</label>
                  <Input type="number" min={0} step={10} value={weeklyVehicleKm} onChange={(e) => setWeeklyVehicleKm(Number(e.target.value))} />
                </Card>
                <Card>
                  <label className="block text-sm font-semibold text-[#1A3B1A] dark:text-[#E8F0E8] mb-3">Monthly Transit Km</label>
                  <Input type="number" min={0} step={10} value={monthlyTransitKm} onChange={(e) => setMonthlyTransitKm(Number(e.target.value))} />
                </Card>
              </div>
              <Card>
                <label className="block text-sm font-semibold text-[#1A3B1A] dark:text-[#E8F0E8] mb-4">Annual Flights</label>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-xs text-[#6B8E23] dark:text-[#A8BEA8]">Short (&lt;500 km)</label>
                    <Input type="number" min={0} value={shortFlights} onChange={(e) => setShortFlights(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B8E23] dark:text-[#A8BEA8]">Medium (500-3500 km)</label>
                    <Input type="number" min={0} value={mediumFlights} onChange={(e) => setMediumFlights(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B8E23] dark:text-[#A8BEA8]">Long (&gt;3500 km)</label>
                    <Input type="number" min={0} value={longFlights} onChange={(e) => setLongFlights(Number(e.target.value))} />
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 'lifestyle' && (
            <motion.div key="lifestyle" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-[#1A3B1A] dark:text-[#E8F0E8]">Diet & Consumption</h2>
                <p className="mt-2 text-sm text-[#6B8E23] dark:text-[#A8BEA8]">Your diet and spending patterns.</p>
              </div>
              <Card>
                <label className="block text-sm font-semibold text-[#1A3B1A] dark:text-[#E8F0E8] mb-3">Diet Style</label>
                <div className="grid gap-2">
                  {['VEGAN', 'VEGETARIAN', 'EGGETARIAN', 'BALANCED', 'MEAT_HEAVY'].map((diet) => (
                    <button key={diet} onClick={() => setDietType(diet as any)} className={selBtn(dietType === diet)}>{diet.replace(/_/g, ' ')}</button>
                  ))}
                </div>
              </Card>
              <Card>
                <label className="block text-sm font-semibold text-[#1A3B1A] dark:text-[#E8F0E8] mb-3">Monthly Spending (₹)</label>
                <Input type="number" min={0} step={50} value={monthlySpending} onChange={(e) => setMonthlySpending(Number(e.target.value))} />
                <p className="mt-2 text-xs text-[#6B8E23] dark:text-[#A8BEA8]">Goods, services, entertainment</p>
              </Card>
              <Card>
                <label className="block text-sm font-semibold text-[#1A3B1A] dark:text-[#E8F0E8] mb-3">Spending Pattern</label>
                <div className="flex gap-3">
                  <button onClick={() => setSpendingLevel('CONSERVATIVE')} className={`flex-1 ${selBtn(spendingLevel === 'CONSERVATIVE')}`}>Conservative</button>
                  <button onClick={() => setSpendingLevel('LIBERAL')} className={`flex-1 ${selBtn(spendingLevel === 'LIBERAL')}`}>Liberal</button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 'results' && result && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
              <ResultsView result={result} />
            </motion.div>
          )}
        </AnimatePresence>

        {step !== 'results' && (
          <div className="flex justify-between pt-6">
            <Button onClick={handleBack} disabled={step === 'home'} variant="secondary">Back</Button>
            <Button onClick={handleNext} disabled={mutation.status === 'pending'}>
              {step === 'lifestyle' ? (mutation.status === 'pending' ? 'Calculating...' : 'See Results') : 'Next'}
            </Button>
          </div>
        )}

        {step === 'results' && (
          <Button onClick={() => { setStep('home'); setResult(null); }} className="w-full">Start Over</Button>
        )}
      </div>

      {step !== 'results' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4 sticky top-20 h-fit">
          <Card>
            <p className="text-xs font-medium uppercase tracking-widest text-[#2C5F2D] dark:text-[#4A8F4B] mb-3">Live Preview</p>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-[#1A3B1A] dark:text-[#E8F0E8]">{preview.monthlyPerCapita.toFixed(1)}</div>
                <p className="text-xs text-[#6B8E23] dark:text-[#A8BEA8]">kg CO₂e / month</p>
              </div>
              <div className="h-px bg-[#D4E4CC] dark:bg-[#2E4E2E]" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[#6B8E23] dark:text-[#A8BEA8]">Home</span><span className="text-[#1A3B1A] dark:text-[#E8F0E8]">{preview.homeEnergy.total.toFixed(1)} kg</span></div>
                <div className="flex justify-between"><span className="text-[#6B8E23] dark:text-[#A8BEA8]">Travel</span><span className="text-[#1A3B1A] dark:text-[#E8F0E8]">{preview.transportation.total.toFixed(1)} kg</span></div>
                <div className="flex justify-between"><span className="text-[#6B8E23] dark:text-[#A8BEA8]">Diet</span><span className="text-[#1A3B1A] dark:text-[#E8F0E8]">{preview.diet.toFixed(1)} kg</span></div>
                <div className="flex justify-between"><span className="text-[#6B8E23] dark:text-[#A8BEA8]">Goods</span><span className="text-[#1A3B1A] dark:text-[#E8F0E8]">{preview.goodsServices.toFixed(1)} kg</span></div>
              </div>
              <div className="h-px bg-[#D4E4CC] dark:bg-[#2E4E2E]" />
              <div className="text-xs">
                <span className="text-[#6B8E23] dark:text-[#A8BEA8]">Annual: </span>
                <div className="text-lg font-semibold text-[#1A3B1A] dark:text-[#E8F0E8]">{preview.annualPerCapita.toFixed(1)} tonnes</div>
                <span className="text-[#6B8E23] dark:text-[#A8BEA8] block mt-2">Trees to offset: </span>
                <div className="text-lg font-semibold text-[#2C5F2D] dark:text-[#4A8F4B]">{preview.treesEquivalent}</div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function ResultsView({ result }: { result: CalculatorResult }) {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#2C5F2D]/10 to-[#9CAF88]/5 dark:from-[#2C5F2D]/20 dark:to-transparent">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-widest text-[#2C5F2D] dark:text-[#4A8F4B]">Your Annual Footprint</p>
          <div className="text-4xl font-bold text-[#1A3B1A] dark:text-[#E8F0E8]">{result.annualPerCapita.toFixed(1)} tonnes</div>
          <div className="text-sm text-[#6B8E23] dark:text-[#A8BEA8]">({result.monthlyPerCapita.toFixed(1)} kg CO₂e per month)</div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm font-semibold text-[#1A3B1A] dark:text-[#E8F0E8] mb-3">Home Energy</p>
          <div className="space-y-2 text-sm">
            {result.homeEnergy.electricity > 0 && (<div className="flex justify-between"><span className="text-[#6B8E23] dark:text-[#A8BEA8]">Electricity</span><span className="text-[#1A3B1A] dark:text-[#E8F0E8]">{result.homeEnergy.electricity.toFixed(1)} kg</span></div>)}
            {result.homeEnergy.lpg > 0 && (<div className="flex justify-between"><span className="text-[#6B8E23] dark:text-[#A8BEA8]">LPG</span><span className="text-[#1A3B1A] dark:text-[#E8F0E8]">{result.homeEnergy.lpg.toFixed(1)} kg</span></div>)}
            {result.homeEnergy.png > 0 && (<div className="flex justify-between"><span className="text-[#6B8E23] dark:text-[#A8BEA8]">PNG</span><span className="text-[#1A3B1A] dark:text-[#E8F0E8]">{result.homeEnergy.png.toFixed(1)} kg</span></div>)}
            <div className="border-t border-[#D4E4CC] dark:border-[#2E4E2E] pt-2 mt-2 font-semibold">
              <div className="flex justify-between"><span className="text-[#1A3B1A] dark:text-[#E8F0E8]">Total</span><span className="text-[#2C5F2D] dark:text-[#4A8F4B]">{result.homeEnergy.total.toFixed(1)} kg</span></div>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-[#1A3B1A] dark:text-[#E8F0E8] mb-3">Transportation</p>
          <div className="space-y-2 text-sm">
            {result.transportation.personalVehicle > 0 && (<div className="flex justify-between"><span className="text-[#6B8E23] dark:text-[#A8BEA8]">Car</span><span className="text-[#1A3B1A] dark:text-[#E8F0E8]">{result.transportation.personalVehicle.toFixed(1)} kg</span></div>)}
            {result.transportation.publicTransit > 0 && (<div className="flex justify-between"><span className="text-[#6B8E23] dark:text-[#A8BEA8]">Transit</span><span className="text-[#1A3B1A] dark:text-[#E8F0E8]">{result.transportation.publicTransit.toFixed(1)} kg</span></div>)}
            {result.transportation.flights > 0 && (<div className="flex justify-between"><span className="text-[#6B8E23] dark:text-[#A8BEA8]">Flights</span><span className="text-[#1A3B1A] dark:text-[#E8F0E8]">{result.transportation.flights.toFixed(1)} kg</span></div>)}
            <div className="border-t border-[#D4E4CC] dark:border-[#2E4E2E] pt-2 mt-2 font-semibold">
              <div className="flex justify-between"><span className="text-[#1A3B1A] dark:text-[#E8F0E8]">Total</span><span className="text-[#2C5F2D] dark:text-[#4A8F4B]">{result.transportation.total.toFixed(1)} kg</span></div>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-[#1A3B1A] dark:text-[#E8F0E8] mb-3">Lifestyle</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#6B8E23] dark:text-[#A8BEA8]">Diet</span><span className="text-[#1A3B1A] dark:text-[#E8F0E8]">{result.diet.toFixed(1)} kg</span></div>
            <div className="flex justify-between"><span className="text-[#6B8E23] dark:text-[#A8BEA8]">Goods & Services</span><span className="text-[#1A3B1A] dark:text-[#E8F0E8]">{result.goodsServices.toFixed(1)} kg</span></div>
            <div className="border-t border-[#D4E4CC] dark:border-[#2E4E2E] pt-2 mt-2 font-semibold">
              <div className="flex justify-between"><span className="text-[#1A3B1A] dark:text-[#E8F0E8]">Total</span><span className="text-[#2C5F2D] dark:text-[#4A8F4B]">{(result.diet + result.goodsServices).toFixed(1)} kg</span></div>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-[#1A3B1A] dark:text-[#E8F0E8] mb-3">Context</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#6B8E23] dark:text-[#A8BEA8]">vs India Average</span><span className={result.comparison.vsIndiaAverage < 0 ? 'text-[#2C5F2D] dark:text-[#4A8F4B]' : 'text-[#E07A5F]'}>{result.comparison.vsIndiaAverage > 0 ? '+' : ''}{result.comparison.vsIndiaAverage.toFixed(1)} tonnes</span></div>
            <div className="flex justify-between"><span className="text-[#6B8E23] dark:text-[#A8BEA8]">vs Paris Target</span><span className={result.comparison.vsParisTarget < 0 ? 'text-[#2C5F2D] dark:text-[#4A8F4B]' : 'text-[#E07A5F]'}>{result.comparison.vsParisTarget > 0 ? '+' : ''}{result.comparison.vsParisTarget.toFixed(1)} tonnes</span></div>
            <div className="flex justify-between"><span className="text-[#6B8E23] dark:text-[#A8BEA8]">Trees to offset</span><span className="font-semibold text-[#2C5F2D] dark:text-[#4A8F4B]">{result.treesEquivalent}</span></div>
          </div>
        </Card>
      </div>

      <Card>
        <p className="text-sm leading-relaxed text-[#6B8E23] dark:text-[#A8BEA8]">{result.insight}</p>
      </Card>
    </div>
  );
}
