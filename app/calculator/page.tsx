'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getBrowserSupabaseClient } from '@/lib/supabaseClient';
import {
  ELECTRICITY_FACTORS_BY_STATE,
  INDIAN_STATE_NAMES,
  TRANSPORT_FACTORS,
  FOOD_FACTORS,
  HOME_ENERGY_FACTORS,
  GOODS_FACTORS,
  calculateElectricityEmission,
  calculateVehicleEmission,
  CONVERSIONS,
  CARBON_BENCHMARKS,
  getAvailableStates,
} from '@/lib/emissions-factors';

type CalculatorStep = 'home' | 'transport' | 'food' | 'goods' | 'review';

interface HomeEnergyData {
  electricityKwh: number;
  state: string;
  lpgCylinders: number;
  pngScm: number;
  keroseneLiters: number;
}

interface TransportData {
  vehicleKm: number;
  vehicleType: keyof typeof TRANSPORT_FACTORS.vehicle;
  flightKm: number;
  transitKm: number;
  bikeKm: number;
}

interface FoodData {
  muttonServings: number;
  chickenServings: number;
  paneerServings: number;
  mealAlternatives: number;
  localProduce: number;
}

interface GoodsData {
  clothingItems: number;
  electronicsItems: number;
  generalShopping: number;
}

interface CalculatorState {
  home: HomeEnergyData;
  transport: TransportData;
  food: FoodData;
  goods: GoodsData;
}

const DEFAULT_STATE: CalculatorState = {
  home: {
    electricityKwh: 250,
    state: 'MH',
    lpgCylinders: 1,
    pngScm: 0,
    keroseneLiters: 0,
  },
  transport: {
    vehicleKm: 800,
    vehicleType: 'two_wheeler',
    flightKm: 0,
    transitKm: 0,
    bikeKm: 0,
  },
  food: {
    muttonServings: 2,
    chickenServings: 4,
    paneerServings: 4,
    mealAlternatives: 0,
    localProduce: 40,
  },
  goods: {
    clothingItems: 2,
    electronicsItems: 0,
    generalShopping: 0,
  },
};

export default function CalculatorPage() {
  const [currentStep, setCurrentStep] = useState<CalculatorStep>('home');
  const [calcState, setCalcState] = useState<CalculatorState>(DEFAULT_STATE);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (typeof window === 'undefined') { setIsAuthLoading(false); return; }
    const guestMode = window.localStorage.getItem('guest_mode') === 'true';
    setIsGuestMode(guestMode);
    const supabase = getBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setIsLoggedIn(true);
        setIsGuestMode(false);
      } else if (window.localStorage.getItem('demo_user') === 'true') {
        setIsLoggedIn(true);
        setIsGuestMode(false);
      }
    }).catch(() => null).finally(() => setIsAuthLoading(false));
  }, []);

  const handleSaveResults = async () => {
    if (saveStatus === 'saving' || saveStatus === 'saved') return;
    setSaveStatus('saving');
    try {
      const supabase = getBrowserSupabaseClient();
      // Build a summary estimate (monthly kg CO2e total)
      const monthlyEstimateKg = homeEmissions.total + transportEmissions.total + foodEmissions.total + goodsEmissions.total;
      const details = JSON.stringify({
        home: homeEmissions,
        transport: transportEmissions,
        food: foodEmissions,
        goods: goodsEmissions,
        state: calcState.home.state,
        vehicleType: calcState.transport.vehicleType,
      });

      // Check if demo user
      const isDemoUser = typeof window !== 'undefined' && window.localStorage.getItem('demo_user') === 'true';
      if (isDemoUser) {
        // Save to localStorage for demo users
        const existing = JSON.parse(localStorage.getItem('demo_logs') || '[]');
        existing.unshift({
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          monthly_energy_usage: calcState.home.electricityKwh,
          weekly_miles: Math.round(calcState.transport.vehicleKm / 4.33),
          diet: calcState.food.muttonServings > 0 || calcState.food.chickenServings > 0 ? 'meatHeavy' : 'balanced',
          estimate: Math.round(monthlyEstimateKg),
          details,
        });
        localStorage.setItem('demo_logs', JSON.stringify(existing.slice(0, 20)));
        setSaveStatus('saved');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setSaveStatus('error'); return; }

      const { error } = await supabase.from('carbon_logs').insert({
        user_id: user.id,
        monthly_energy_usage: calcState.home.electricityKwh,
        weekly_miles: Math.round(calcState.transport.vehicleKm / 4.33),
        diet: calcState.food.muttonServings > 0 || calcState.food.chickenServings > 0 ? 'meatHeavy' : 'balanced',
        estimate: Math.round(monthlyEstimateKg),
        details,
        home_energy: 'electricity',
        commute_mode: calcState.transport.vehicleType === 'electric' ? 'car' : 'car',
      });
      if (error) throw error;
      setSaveStatus('saved');
    } catch (e) {
      console.error('Save error:', e);
      setSaveStatus('error');
    }
  };

  // All hooks before early return
  const homeEmissions = useMemo(() => {
    const electricity = calculateElectricityEmission(calcState.home.electricityKwh, calcState.home.state);
    const lpg = calcState.home.lpgCylinders * HOME_ENERGY_FACTORS.lpg_per_cylinder;
    const png = calcState.home.pngScm * HOME_ENERGY_FACTORS.png_per_scm;
    const kerosene = calcState.home.keroseneLiters * HOME_ENERGY_FACTORS.kerosene_per_liter;
    return { electricity, lpg, png, kerosene, total: electricity + lpg + png + kerosene };
  }, [calcState.home]);

  const transportEmissions = useMemo(() => {
    const vehicle = calculateVehicleEmission(calcState.transport.vehicleKm, calcState.transport.vehicleType);
    const flight = calcState.transport.flightKm * TRANSPORT_FACTORS.aviation.domestic_flight;
    const transit = calcState.transport.transitKm * TRANSPORT_FACTORS.transit.city_bus;
    return { vehicle, flight, transit, bike: 0, total: vehicle + flight + transit };
  }, [calcState.transport]);

  const foodEmissions = useMemo(() => {
    const mutton = (calcState.food.muttonServings * 0.15) * FOOD_FACTORS.mutton;
    const chicken = (calcState.food.chickenServings * 0.15) * FOOD_FACTORS.chicken;
    const paneer = (calcState.food.paneerServings * 0.1) * FOOD_FACTORS.paneer;
    const alternatives = calcState.food.mealAlternatives * 0.3;
    const produce = calcState.food.localProduce * 0.01 * 0.3;
    return { mutton, chicken, paneer, alternatives, produce, total: mutton + chicken + paneer + alternatives + produce };
  }, [calcState.food]);

  const goodsEmissions = useMemo(() => {
    const clothing = calcState.goods.clothingItems * GOODS_FACTORS.average_clothing || 0;
    const electronics = calcState.goods.electronicsItems * GOODS_FACTORS.average_electronics || 0;
    const shopping = calcState.goods.generalShopping * 25;
    return { clothing, electronics, shopping, total: clothing + electronics + shopping };
  }, [calcState.goods]);

  const totalEmissions = useMemo(() => {
    const monthly = homeEmissions.total + transportEmissions.total + foodEmissions.total + goodsEmissions.total;
    const annual = monthly * 12;
    return {
      monthly, annual, daily: monthly / 30,
      trees: CONVERSIONS.kg_co2_to_trees(annual),
      carKm: CONVERSIONS.kg_co2_to_car_km(annual),
      vsIndiaAverage: annual - CARBON_BENCHMARKS.INDIA_AVERAGE_ANNUAL,
    };
  }, [homeEmissions, transportEmissions, foodEmissions, goodsEmissions]);

  const updateHome = (u: Partial<HomeEnergyData>) => setCalcState(p => ({ ...p, home: { ...p.home, ...u } }));
  const updateTransport = (u: Partial<TransportData>) => setCalcState(p => ({ ...p, transport: { ...p.transport, ...u } }));
  const updateFood = (u: Partial<FoodData>) => setCalcState(p => ({ ...p, food: { ...p.food, ...u } }));
  const updateGoods = (u: Partial<GoodsData>) => setCalcState(p => ({ ...p, goods: { ...p.goods, ...u } }));
  const reset = () => setCalcState(DEFAULT_STATE);
  const nextStep = (step: CalculatorStep) => setCurrentStep(step);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0F1F0F] py-8 px-4">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="h-24 rounded-3xl bg-white/5 animate-pulse" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-28 rounded-3xl bg-white/5 animate-pulse" />
            <div className="h-28 rounded-3xl bg-white/5 animate-pulse" />
            <div className="h-28 rounded-3xl bg-white/5 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0F1F0F] py-8 px-4">
      <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="space-y-6">
            {isGuestMode && (
              <div className="rounded-xl border border-[#9CAF88]/40 bg-[#2C5F2D]/15 p-4 text-sm text-[#E8F0E8]">
                <p className="font-medium">👀 You are in preview mode. Data will not be saved.</p>
              </div>
            )}
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-4xl font-bold text-[#1A3B1A] dark:text-[#E8F0E8]">Carbon Calculator</h1>
              <p className="text-[#1A3B1A] dark:text-[#E8F0E8]/70">Estimate your annual emissions across all activities</p>
            </div>

            {currentStep === 'home' && <HomeEnergyStep state={calcState.home} onUpdate={updateHome} onNext={() => nextStep('transport')} />}
            {currentStep === 'transport' && <TransportStep state={calcState.transport} onUpdate={updateTransport} onNext={() => nextStep('food')} />}
            {currentStep === 'food' && <FoodStep state={calcState.food} onUpdate={updateFood} onNext={() => nextStep('goods')} />}
            {currentStep === 'goods' && <GoodsStep state={calcState.goods} onUpdate={updateGoods} onNext={() => nextStep('review')} />}
            {currentStep === 'review' && (
              <ReviewStep state={calcState} isGuestMode={isGuestMode} isLoggedIn={isLoggedIn}
                emissions={{ home: homeEmissions, transport: transportEmissions, food: foodEmissions, goods: goodsEmissions, total: totalEmissions }}
                onSave={handleSaveResults} saveStatus={saveStatus} />
            )}

            <div className="flex gap-4 justify-between pt-8">
              <Button onClick={reset} variant="ghost" className="text-[#1A3B1A] dark:text-[#E8F0E8] border border-mist/30 hover:bg-mist/10">Reset All</Button>
              <div className="flex gap-2">
                {currentStep !== 'home' && (
                  <Button onClick={() => {
                    const steps: CalculatorStep[] = ['home', 'transport', 'food', 'goods', 'review'];
                    const idx = steps.indexOf(currentStep);
                    if (idx > 0) nextStep(steps[idx - 1]);
                  }} variant="ghost" className="border-glow/30 text-[#2C5F2D] dark:text-[#4A8F4B] hover:bg-glow/10">Back</Button>
                )}
              </div>
            </div>
          </div>
        </div>
        <SidebarPreview emissions={totalEmissions} currentStep={currentStep} />
      </div>
    </div>
  );
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function HomeEnergyStep({ state, onUpdate, onNext }: { state: HomeEnergyData; onUpdate: (u: Partial<HomeEnergyData>) => void; onNext: () => void; }) {
  const states = getAvailableStates();
  return (
    <Card className="bg-white dark:bg-[#1E331E] border-glow/30 p-8 space-y-6">
      <h2 className="text-2xl font-bold text-[#1A3B1A] dark:text-[#E8F0E8]">Step 1: Home Energy</h2>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#1A3B1A] dark:text-[#E8F0E8]">Your State / UT</label>
        <select value={state.state} onChange={(e) => onUpdate({ state: e.target.value })}
          className="w-full px-4 py-2 bg-white dark:bg-[#1E331E] border border-glow/20 rounded-lg text-[#1A3B1A] dark:text-[#E8F0E8] focus:outline-none focus:border-glow">
          {states.map((s) => (
            <option key={s} value={s} className="bg-white dark:bg-[#1E331E] text-[#1A3B1A] dark:text-[#E8F0E8]">{INDIAN_STATE_NAMES[s] || s}</option>
          ))}
        </select>
        <p className="text-xs text-[#1A3B1A] dark:text-[#E8F0E8]/60">
          Grid emission factor: {ELECTRICITY_FACTORS_BY_STATE[state.state.toUpperCase()]} kg CO₂/kWh
        </p>
      </div>
      <SliderInput label="Monthly Electricity Usage" unit="kWh" value={state.electricityKwh}
        onChange={(v) => onUpdate({ electricityKwh: v })} min={0} max={1000} step={25} placeholder="Typical: 150-300 kWh/month" />
      <SliderInput label="Monthly LPG Cylinders (14.2 kg)" unit="cylinders" value={state.lpgCylinders}
        onChange={(v) => onUpdate({ lpgCylinders: v })} min={0} max={4} step={0.5} />
      <SliderInput label="Monthly Piped Natural Gas (PNG)" unit="SCM" value={state.pngScm}
        onChange={(v) => onUpdate({ pngScm: v })} min={0} max={50} step={2} />
      <SliderInput label="Monthly Kerosene (if applicable)" unit="liters" value={state.keroseneLiters}
        onChange={(v) => onUpdate({ keroseneLiters: v })} min={0} max={20} step={1} />
      <Button onClick={onNext} className="w-full bg-glow text-forest hover:bg-glow/90 font-semibold">Continue to Transport →</Button>
    </Card>
  );
}

function TransportStep({ state, onUpdate, onNext }: { state: TransportData; onUpdate: (u: Partial<TransportData>) => void; onNext: () => void; }) {
  const vehicleLabels: Record<string, string> = {
    two_wheeler: '🏍️ Two Wheeler', hatchback: '🚗 Hatchback', sedan: '🚙 Sedan',
    suv: '🚙 SUV', cng: '⛽ CNG', electric: '⚡ Electric',
    auto_rickshaw: '🛺 Auto Rickshaw', diesel_car: '🚗 Diesel',
  };
  return (
    <Card className="bg-white dark:bg-[#1E331E] border-glow/30 p-8 space-y-6">
      <h2 className="text-2xl font-bold text-[#1A3B1A] dark:text-[#E8F0E8]">Step 2: Transportation</h2>
      <SliderInput label="Monthly Vehicle Distance" unit="km" value={state.vehicleKm}
        onChange={(v) => onUpdate({ vehicleKm: v })} min={0} max={5000} step={50} placeholder="Typical: 500-1500 km/month" />
      <div className="space-y-3">
        <label className="text-sm font-semibold text-[#1A3B1A] dark:text-[#E8F0E8]">Vehicle Type</label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(vehicleLabels).map(([type, label]) => (
            <button key={type} onClick={() => onUpdate({ vehicleType: type as any })}
              className={`px-4 py-2 rounded-lg transition font-medium text-sm ${state.vehicleType === type ? 'bg-glow text-forest' : 'bg-white dark:bg-[#1E331E] text-[#1A3B1A] dark:text-[#E8F0E8] border border-[#9CAF88]/40 dark:border-[#2A3D2A] hover:border-glow/50'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <SliderInput label="Annual Flight Distance" unit="km" value={state.flightKm}
        onChange={(v) => onUpdate({ flightKm: v })} min={0} max={20000} step={500} placeholder="Delhi–Mumbai ≈ 1,400 km" />
      <SliderInput label="Monthly Public Transit (Bus/Metro)" unit="km" value={state.transitKm}
        onChange={(v) => onUpdate({ transitKm: v })} min={0} max={3000} step={50} />
      <SliderInput label="Monthly Cycling/Walking" unit="km" value={state.bikeKm}
        onChange={(v) => onUpdate({ bikeKm: v })} min={0} max={500} step={10} />
      <Button onClick={onNext} className="w-full bg-glow text-forest hover:bg-glow/90 font-semibold">Continue to Food →</Button>
    </Card>
  );
}

function FoodStep({ state, onUpdate, onNext }: { state: FoodData; onUpdate: (u: Partial<FoodData>) => void; onNext: () => void; }) {
  return (
    <Card className="bg-white dark:bg-[#1E331E] border-glow/30 p-8 space-y-6">
      <h2 className="text-2xl font-bold text-[#1A3B1A] dark:text-[#E8F0E8]">Step 3: Food & Diet</h2>
      <p className="text-sm text-[#1A3B1A] dark:text-[#E8F0E8]/80 bg-white/5 p-3 rounded-lg">
        💡 Mutton has ~7x higher emissions than chicken. Plant-based meals (dal, sabzi) have the lowest carbon footprint.
      </p>
      <SliderInput label="Weekly Mutton Servings" unit="servings" value={state.muttonServings}
        onChange={(v) => onUpdate({ muttonServings: v })} min={0} max={14} step={1} />
      <SliderInput label="Weekly Chicken / Fish Servings" unit="servings" value={state.chickenServings}
        onChange={(v) => onUpdate({ chickenServings: v })} min={0} max={14} step={1} />
      <SliderInput label="Weekly Paneer / Dairy Servings" unit="servings" value={state.paneerServings}
        onChange={(v) => onUpdate({ paneerServings: v })} min={0} max={14} step={1} />
      <SliderInput label="Weekly Plant-Based Meals (Dal, Sabzi)" unit="meals" value={state.mealAlternatives}
        onChange={(v) => onUpdate({ mealAlternatives: v })} min={0} max={21} step={1} />
      <SliderInput label="Local/Seasonal Produce" unit="% of diet" value={state.localProduce}
        onChange={(v) => onUpdate({ localProduce: v })} min={0} max={100} step={5} />
      <Button onClick={onNext} className="w-full bg-glow text-forest hover:bg-glow/90 font-semibold">Continue to Goods →</Button>
    </Card>
  );
}

function GoodsStep({ state, onUpdate, onNext }: { state: GoodsData; onUpdate: (u: Partial<GoodsData>) => void; onNext: () => void; }) {
  return (
    <Card className="bg-white dark:bg-[#1E331E] border-glow/30 p-8 space-y-6">
      <h2 className="text-2xl font-bold text-[#1A3B1A] dark:text-[#E8F0E8]">Step 4: Goods & Shopping</h2>
      <p className="text-sm text-[#1A3B1A] dark:text-[#E8F0E8]/80 bg-white/5 p-3 rounded-lg">
        📊 Manufacturing accounts for ~5-10% of personal carbon footprints. Buying less and choosing local brands helps.
      </p>
      <SliderInput label="New Clothing Items Per Month" unit="items" value={state.clothingItems}
        onChange={(v) => onUpdate({ clothingItems: v })} min={0} max={20} step={1} />
      <SliderInput label="New Electronics Per Year" unit="items" value={state.electronicsItems}
        onChange={(v) => onUpdate({ electronicsItems: v })} min={0} max={10} step={1} />
      <SliderInput label="General Goods/Furniture Per Year" unit="items" value={state.generalShopping}
        onChange={(v) => onUpdate({ generalShopping: v })} min={0} max={50} step={2} />
      <Button onClick={onNext} className="w-full bg-glow text-forest hover:bg-glow/90 font-semibold">See Your Results →</Button>
    </Card>
  );
}

function ReviewStep({ state, isGuestMode, isLoggedIn, emissions: e, onSave, saveStatus }: {
  state: CalculatorState; isGuestMode: boolean; isLoggedIn: boolean;
  emissions: { home: any; transport: any; food: any; goods: any; total: any; };
  onSave: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}) {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-glow/20 to-cyan-400/10 border-glow/40 p-8">
        <h2 className="text-3xl font-bold text-[#2C5F2D] dark:text-[#4A8F4B] mb-4">Your Carbon Footprint</h2>
        <div className="grid grid-cols-2 gap-4 text-[#1A3B1A] dark:text-[#E8F0E8]">
          <div><p className="text-sm text-[#1A3B1A] dark:text-[#E8F0E8]/70">Monthly</p><p className="text-3xl font-bold">{e.total.monthly.toFixed(1)} kg</p></div>
          <div><p className="text-sm text-[#1A3B1A] dark:text-[#E8F0E8]/70">Annual</p><p className="text-3xl font-bold">{(e.total.annual / 1000).toFixed(1)} metric tons</p></div>
        </div>
      </Card>
      <div className="grid md:grid-cols-2 gap-4">
        <CategoryCard title="Home Energy" value={e.home.total} percent={(e.home.total / e.total.monthly) * 100}
          breakdown={[{ label: 'Electricity', value: e.home.electricity }, { label: 'LPG', value: e.home.lpg }, { label: 'PNG', value: e.home.png }, { label: 'Kerosene', value: e.home.kerosene }]} />
        <CategoryCard title="Transportation" value={e.transport.total} percent={(e.transport.total / e.total.monthly) * 100}
          breakdown={[{ label: 'Vehicle', value: e.transport.vehicle }, { label: 'Flights', value: e.transport.flight }, { label: 'Transit', value: e.transport.transit }]} />
        <CategoryCard title="Food" value={e.food.total} percent={(e.food.total / e.total.monthly) * 100}
          breakdown={[{ label: 'Mutton', value: e.food.mutton }, { label: 'Chicken', value: e.food.chicken }, { label: 'Paneer', value: e.food.paneer }]} />
        <CategoryCard title="Goods & Shopping" value={e.goods.total} percent={(e.goods.total / e.total.monthly) * 100}
          breakdown={[{ label: 'Clothing', value: e.goods.clothing }, { label: 'Electronics', value: e.goods.electronics }, { label: 'General', value: e.goods.shopping }]} />
      </div>
      <Card className="bg-[#FAF9F6] dark:bg-[#1E331E] border-[#9CAF88]/40 dark:border-[#2A3D2A] p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[#1A3B1A] dark:text-[#E8F0E8]">💡 Insights</h3>
        <div className="space-y-3 text-sm text-[#6B8E23] dark:text-[#A8BEA8]">
          <p>🇮🇳 <strong>vs India Average:</strong>{' '}
            {e.total.vsIndiaAverage > 0 ? '+' : ''}{(e.total.vsIndiaAverage / 1000).toFixed(1)} metric tons
            ({e.total.vsIndiaAverage > 0 ? 'higher' : 'lower'} than avg)
          </p>
          <p>🌳 <strong>Trees needed to offset:</strong> {Math.ceil(e.total.trees)} trees/year</p>
          <p>🚗 <strong>Equivalent to:</strong> {e.total.carKm.toFixed(0)} car km/year</p>
        </div>
      </Card>
      <div className="space-y-4">
        {isLoggedIn ? (
          <>
            <Button
              onClick={onSave}
              disabled={saveStatus === 'saving' || saveStatus === 'saved'}
              className="w-full bg-glow text-forest hover:bg-glow/90 font-semibold"
            >
              {saveStatus === 'saving' ? '⏳ Saving…' : saveStatus === 'saved' ? '✅ Saved to Dashboard!' : saveStatus === 'error' ? '❌ Save Failed — Try Again' : '💾 Save Results to Dashboard'}
            </Button>
            {saveStatus === 'saved' && (
              <p className="text-center text-sm text-[#2C5F2D] dark:text-[#4A8F4B]">
                ✓ Your footprint has been logged. <a href="/dashboard" className="underline font-semibold">View Dashboard →</a>
              </p>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-sm">
            <p className="font-medium text-yellow-700 dark:text-yellow-200 mb-3">Sign in to save your results and track progress over time.</p>
            <a href="/login" className="inline-block rounded-xl bg-[#2C5F2D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#245224] transition-colors">Sign In / Sign Up</a>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function SliderInput({ label, unit, value, onChange, min, max, step, placeholder }: {
  label: string; unit: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; placeholder?: string;
}) {
  // Local draft state lets users type freely without clamping mid-edit
  const [draft, setDraft] = React.useState<string>(String(value));

  // Keep draft in sync when slider moves
  React.useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
  };

  const commitDraft = () => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange(clamped);
      setDraft(String(clamped));
    } else {
      // Reset to last valid value
      setDraft(String(value));
    }
  };

  return (
    <div className="space-y-2">
      {/* Label row + manual number input */}
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-[#1A3B1A] dark:text-[#E8F0E8] flex-1">{label}</label>
        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={draft}
            onChange={handleNumberChange}
            onBlur={commitDraft}
            onKeyDown={(e) => e.key === 'Enter' && commitDraft()}
            aria-label={`${label} — type a value`}
            className="w-24 rounded-lg border border-[#9CAF88]/40 dark:border-[#2A3D2A] bg-white dark:bg-[#1E331E] px-2 py-1
                       text-right text-sm font-semibold text-[#2C5F2D] dark:text-[#4A8F4B]
                       focus:outline-none focus:border-glow focus:ring-1 focus:ring-glow/40
                       [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-xs text-[#1A3B1A] dark:text-[#E8F0E8]/60 w-max">{unit}</span>
        </div>
      </div>

      {/* Range slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(ev) => onChange(Number(ev.target.value))}
        aria-label={`${label} slider`}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
      />

      {/* Min / placeholder / max hints */}
      <div className="flex justify-between text-xs text-[#7A987A]">
        <span>{min}</span>
        {placeholder && <span className="italic text-[#1A3B1A] dark:text-[#E8F0E8]/60">{placeholder}</span>}
        <span>{max}</span>
      </div>
    </div>
  );
}

function CategoryCard({ title, value, percent, breakdown }: {
  title: string; value: number; percent: number; breakdown: Array<{ label: string; value: number }>;
}) {
  return (
    <Card className="bg-[#FAF9F6] dark:bg-[#1E331E] border-[#9CAF88]/40 dark:border-[#2A3D2A] p-6 space-y-3">
      <h3 className="font-semibold text-[#1A3B1A] dark:text-[#E8F0E8]">{title}</h3>
      <div className="flex justify-between items-end">
        <span className="text-2xl font-bold text-[#2C5F2D] dark:text-[#4A8F4B]">{value.toFixed(1)} kg</span>
        <span className="text-sm text-[#1A3B1A] dark:text-[#E8F0E8]/60">{percent.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-glow to-cyan-400" style={{ width: `${percent}%` }} />
      </div>
      <div className="space-y-2 text-xs text-[#1A3B1A] dark:text-[#E8F0E8]/70 pt-2 border-t border-[#9CAF88]/40 dark:border-[#2A3D2A]">
        {breakdown.map((item) => (
          <div key={item.label} className="flex justify-between">
            <span>{item.label}:</span>
            <span className="text-[#2C5F2D] dark:text-[#4A8F4B]">{item.value.toFixed(1)} kg</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SidebarPreview({ emissions, currentStep }: {
  emissions: { monthly: number; annual: number; daily: number; trees: number; carKm: number; vsIndiaAverage: number; };
  currentStep: CalculatorStep;
}) {
  return (
    <Card className="sticky top-8 bg-white dark:bg-[#1E331E] border-glow/40 p-6 space-y-6 h-fit">
      <h3 className="text-xl font-bold text-[#1A3B1A] dark:text-[#E8F0E8]">Live Preview</h3>
      <div className="bg-gradient-to-br from-glow/20 to-cyan-400/10 rounded-lg p-4 space-y-2">
        <p className="text-xs text-[#1A3B1A] dark:text-[#E8F0E8]/70">Annual Emissions</p>
        <p className="text-3xl font-bold text-[#2C5F2D] dark:text-[#4A8F4B]">{(emissions.annual / 1000).toFixed(1)}</p>
        <p className="text-xs text-[#1A3B1A] dark:text-[#E8F0E8]/60">metric tons CO₂e</p>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-[#1A3B1A] dark:text-[#E8F0E8]/70">Monthly</span>
          <span className="text-[#2C5F2D] dark:text-[#4A8F4B] font-semibold">{emissions.monthly.toFixed(0)} kg</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#1A3B1A] dark:text-[#E8F0E8]/70">Daily</span>
          <span className="text-[#2C5F2D] dark:text-[#4A8F4B] font-semibold">{emissions.daily.toFixed(1)} kg</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#1A3B1A] dark:text-[#E8F0E8]/70">vs India Avg</span>
          <span className={emissions.vsIndiaAverage > 0 ? 'text-red-400' : 'text-[#2C5F2D] dark:text-[#4A8F4B]'}>
            {emissions.vsIndiaAverage > 0 ? '+' : ''}{(emissions.vsIndiaAverage / 1000).toFixed(1)} MT
          </span>
        </div>
      </div>
      <div className="border-t border-[#9CAF88]/40 dark:border-[#2A3D2A] pt-4 space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌳</span>
          <div><p className="text-[#1A3B1A] dark:text-[#E8F0E8]/70">Trees needed</p><p className="font-semibold text-[#2C5F2D] dark:text-[#4A8F4B]">{Math.ceil(emissions.trees)}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🚗</span>
          <div><p className="text-[#1A3B1A] dark:text-[#E8F0E8]/70">Car km equiv.</p><p className="font-semibold text-[#2C5F2D] dark:text-[#4A8F4B]">{emissions.carKm.toFixed(0)}</p></div>
        </div>
      </div>
      <div className="bg-white/5 p-3 rounded-lg space-y-2">
        <p className="text-xs text-[#1A3B1A] dark:text-[#E8F0E8]/70">Step Progress</p>
        <p className="text-sm font-semibold text-[#2C5F2D] dark:text-[#4A8F4B] capitalize">{currentStep}</p>
      </div>
    </Card>
  );
}
