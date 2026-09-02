'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { getBrowserSupabaseClient } from '@/lib/supabaseClient';
import type { CalculatorResult } from '@/lib/calculator';

const commuteOptions = [
  { value: 'car', label: 'Drive alone' },
  { value: 'transit', label: 'Public transit' },
  { value: 'bike', label: 'Bike / walk' },
  { value: 'remote', label: 'Remote work' }
] as const;

const energyOptions = [
  { value: 'electricity', label: 'Electricity' },
  { value: 'natural_gas', label: 'Natural gas' },
  { value: 'lpg', label: 'LPG' },
  { value: 'mixed', label: 'Mixed sources' }
] as const;

const dietOptions = [
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'meat_heavy', label: 'Meat-heavy' }
] as const;

type FormState = {
  commuteMode: 'car' | 'transit' | 'bike' | 'remote';
  weeklyMiles: string;
  homeEnergySource: 'electricity' | 'natural_gas' | 'lpg' | 'mixed';
  monthlyEnergyUsage: string;
  dietType: 'vegan' | 'vegetarian' | 'balanced' | 'meat_heavy';
};

const initialForm: FormState = {
  commuteMode: 'car',
  weeklyMiles: '15',
  homeEnergySource: 'electricity',
  monthlyEnergyUsage: '420',
  dietType: 'balanced'
};

export function CarbonChatCalculator() {
  const [formState, setFormState] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  /**
   * Convert miles to kilometers
   * 1 mile = 1.60934 km
   */
  const milesKm = (miles: number) => Math.round(miles * 1.60934 * 100) / 100;

  const mutation = useMutation({
    mutationFn: async (input: FormState) => {
      setSaveError(null);

      // Convert miles to kilometers
      const weeklyKm = milesKm(Number(input.weeklyMiles));

      // Prepare request matching SimpleCarbonInputSchema
      const calculatorRequest = {
        type: 'SIMPLE',
        input: {
          commuteMode: input.commuteMode,
          weeklyKm,
          homeEnergySource: input.homeEnergySource,
          monthlyEnergyUsage: Number(input.monthlyEnergyUsage),
          dietType: input.dietType,
        },
      };

      // Step 1: Calculate carbon footprint
      const response = await fetch('/api/carbon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calculatorRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Carbon estimate failed');
      }

      const result: CalculatorResult = await response.json();

      // Step 2: Save to database (only if user is authenticated)
      try {
        const supabase = getBrowserSupabaseClient();
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.access_token) {
          // User not authenticated, just return calculation
          console.warn('User not authenticated, skipping save');
          return result;
        }

        // Map form data to database schema
        const saveRequest = {
          commute_mode: input.commuteMode,
          home_energy: input.homeEnergySource,
          monthly_energy_usage: Number(input.monthlyEnergyUsage),
          diet: input.dietType,
          estimate: result.monthlyTotal,
          details: {
            transportation: result.transportation.total,
            homeEnergy: result.homeEnergy.total,
            diet: result.diet,
            weeklyKm,
          },
        };

        const supabaseResponse = await fetch('/api/save-carbon-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify(saveRequest),
        });

        if (!supabaseResponse.ok) {
          const error = await supabaseResponse.json();
          // Don't fail the calculation, just warn about save failure
          setSaveError(error.message || 'Failed to save carbon log');
          console.warn('Failed to save carbon log:', error);
          return result;
        }
      } catch (error) {
        // Save failure is not critical - we still show the calculation
        const errorMsg = error instanceof Error ? error.message : 'Failed to save carbon log';
        setSaveError(errorMsg);
        console.warn('Save error:', error);
        return result;
      }

      return result;
    },
    onSuccess: () => setSubmitted(true),
    onError: (error) => {
      setSaveError(error.message);
    },
  });

  const errors = useMemo(() => {
    const list: string[] = [];
    if (Number(formState.weeklyMiles) < 0) list.push('Weekly mileage cannot be negative.');
    if (Number(formState.monthlyEnergyUsage) < 0) list.push('Monthly energy usage must be positive.');
    return list;
  }, [formState]);

  const selectCls = 'w-full rounded-xl border-0 bg-[#F5F5F7] dark:bg-[#1C1C1E] px-5 py-3 text-sm text-[#1D1D1F] dark:text-[#F5F5F7] outline-none transition-all focus:ring-2 focus:ring-[#0071E3]/40';

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <Card>
          <p className="text-xs font-medium uppercase tracking-widest text-[#0071E3]">Conversation</p>
          <h3 className="mt-3 text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">How much does your routine add up to?</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#86868B]">
            Answer a few simple prompts and see a warm, human-powered estimate instead of a dry spreadsheet.
          </p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <label className="mb-2 block text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Primary commute</label>
            <select value={formState.commuteMode} onChange={(e) => setFormState({ ...formState, commuteMode: e.target.value as FormState['commuteMode'] })} className={selectCls}>
              {commuteOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
          </Card>

          <Card>
            <label className="mb-2 block text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Weekly commute distance</label>
            <Input type="number" min={0} step={1} value={formState.weeklyMiles} onChange={(e) => setFormState({ ...formState, weeklyMiles: e.target.value })} placeholder="Miles per week" />
            <p className="mt-1 text-xs text-[#86868B]">Will be converted to km</p>
          </Card>

          <Card>
            <label className="mb-2 block text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Home energy profile</label>
            <select value={formState.homeEnergySource} onChange={(e) => setFormState({ ...formState, homeEnergySource: e.target.value as FormState['homeEnergySource'] })} className={selectCls}>
              {energyOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
          </Card>

          <Card>
            <label className="mb-2 block text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Monthly energy use</label>
            <Input type="number" min={0} step={10} value={formState.monthlyEnergyUsage} onChange={(e) => setFormState({ ...formState, monthlyEnergyUsage: e.target.value })} placeholder="kWh or equivalent" />
          </Card>

          <Card className="sm:col-span-2">
            <label className="mb-4 block text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Diet style</label>
            <div className="grid gap-3 sm:grid-cols-4">
              {dietOptions.map((o) => (
                <button key={o.value} type="button" onClick={() => setFormState({ ...formState, dietType: o.value })}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                    formState.dietType === o.value
                      ? 'border-[#0071E3] bg-[#0071E3]/10 text-[#0071E3]'
                      : 'border-[#D2D2D7] dark:border-[#38383A] bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:border-[#0071E3]/40'
                  }`}>
                  <p className="font-semibold">{o.label}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm text-[#86868B]">Quick estimate, based on household averages and lifestyle assumptions.</p>
          {errors.length > 0 && <p className="text-sm text-[#FF3B30]">{errors.join(' ')}</p>}
          {saveError && <p className="text-sm text-[#FF9500]">⚠️ {saveError}</p>}
        </div>
        <Button onClick={() => mutation.mutate(formState)} disabled={mutation.status === 'pending' || errors.length > 0}>
          {mutation.status === 'pending' ? 'Calculating…' : 'See my estimate'}
        </Button>
      </div>

      {mutation.status === 'success' && submitted && mutation.data && (
        <div className="space-y-5 rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-6 shadow-apple">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#0071E3]">Your footprint</p>
              <h3 className="mt-2 text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {Math.round(mutation.data.monthlyTotal * 100) / 100} kg CO₂e / month
              </h3>
            </div>
            <div className="rounded-full bg-[#0071E3]/10 px-4 py-2 text-sm text-[#0071E3] font-medium">Balanced goal</div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-sm text-[#86868B]">Commute</p>
              <p className="mt-3 text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {Math.round(mutation.data.transportation.total * 100) / 100} kg
              </p>
            </Card>
            <Card>
              <p className="text-sm text-[#86868B]">Energy</p>
              <p className="mt-3 text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {Math.round(mutation.data.homeEnergy.total * 100) / 100} kg
              </p>
            </Card>
            <Card>
              <p className="text-sm text-[#86868B]">Diet</p>
              <p className="mt-3 text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {Math.round(mutation.data.diet * 100) / 100} kg
              </p>
            </Card>
          </div>
          <Card>
            <p className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Nudge:</p>
            <p className="mt-2 text-sm leading-relaxed text-[#86868B]">{mutation.data.insight}</p>
          </Card>
        </div>
      )}

      {mutation.status === 'error' && (
        <div className="rounded-2xl bg-[#FED7D7] dark:bg-[#5C2C2C] p-6">
          <p className="font-semibold text-[#C1121F] dark:text-[#FF6B6B]">Calculation failed</p>
          <p className="mt-2 text-sm text-[#A71D1D] dark:text-[#FFB8B8]">{mutation.error?.message}</p>
        </div>
      )}
    </div>
  );
}
