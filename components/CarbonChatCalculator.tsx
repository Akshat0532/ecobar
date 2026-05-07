'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

const commuteOptions = [
  { value: 'car', label: 'Drive alone' },
  { value: 'transit', label: 'Public transit' },
  { value: 'bike', label: 'Bike / walk' },
  { value: 'remote', label: 'Remote work' }
] as const;

const energyOptions = [
  { value: 'electricity', label: 'Electricity' },
  { value: 'naturalGas', label: 'Natural gas' },
  { value: 'mixed', label: 'Mixed sources' }
] as const;

const dietOptions = [
  { value: 'meatHeavy', label: 'Meat-heavy' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'plantForward', label: 'Plant-forward' }
] as const;

type FormState = {
  commuteMode: 'car' | 'transit' | 'bike' | 'remote';
  weeklyMiles: string;
  homeEnergy: 'electricity' | 'naturalGas' | 'mixed';
  monthlyEnergyUsage: string;
  diet: 'meatHeavy' | 'balanced' | 'plantForward';
};

const initialForm: FormState = {
  commuteMode: 'car',
  weeklyMiles: '15',
  homeEnergy: 'electricity',
  monthlyEnergyUsage: '420',
  diet: 'balanced'
};

export function CarbonChatCalculator() {
  const [formState, setFormState] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: async (input: FormState) => {
      const response = await fetch('/api/carbon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commuteMode: input.commuteMode,
          weeklyMiles: Number(input.weeklyMiles),
          homeEnergy: input.homeEnergy,
          monthlyEnergyUsage: Number(input.monthlyEnergyUsage),
          diet: input.diet
        })
      });
      if (!response.ok) throw new Error('Carbon estimate failed');
      const result = await response.json();

      try {
        const supabaseResponse = await fetch('/api/save-carbon-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            commuteMode: input.commuteMode,
            weeklyMiles: Number(input.weeklyMiles),
            homeEnergy: input.homeEnergy,
            monthlyEnergyUsage: Number(input.monthlyEnergyUsage),
            diet: input.diet,
            estimate: result.estimate,
            details: result.details
          })
        });
        if (!supabaseResponse.ok) console.warn('Failed to save carbon log');
      } catch (error) {
        console.warn('Failed to save carbon log:', error);
      }

      return result;
    },
    onSuccess: () => setSubmitted(true)
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
          </Card>

          <Card>
            <label className="mb-2 block text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Home energy profile</label>
            <select value={formState.homeEnergy} onChange={(e) => setFormState({ ...formState, homeEnergy: e.target.value as FormState['homeEnergy'] })} className={selectCls}>
              {energyOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
          </Card>

          <Card>
            <label className="mb-2 block text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Monthly energy use</label>
            <Input type="number" min={0} step={10} value={formState.monthlyEnergyUsage} onChange={(e) => setFormState({ ...formState, monthlyEnergyUsage: e.target.value })} placeholder="kWh or equivalent" />
          </Card>

          <Card className="sm:col-span-2">
            <label className="mb-4 block text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Diet style</label>
            <div className="grid gap-3 sm:grid-cols-3">
              {dietOptions.map((o) => (
                <button key={o.value} type="button" onClick={() => setFormState({ ...formState, diet: o.value })}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                    formState.diet === o.value
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
        </div>
        <Button onClick={() => mutation.mutate(formState)} disabled={mutation.status === 'pending' || errors.length > 0}>
          {mutation.status === 'pending' ? 'Calculating…' : 'See my estimate'}
        </Button>
      </div>

      {mutation.status === 'success' && submitted && (
        <div className="space-y-5 rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-6 shadow-apple">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#0071E3]">Your footprint</p>
              <h3 className="mt-2 text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{mutation.data.estimate} kg CO₂e / month</h3>
            </div>
            <div className="rounded-full bg-[#0071E3]/10 px-4 py-2 text-sm text-[#0071E3] font-medium">Balanced goal</div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><p className="text-sm text-[#86868B]">Commute</p><p className="mt-3 text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{mutation.data.details.commute} kg</p></Card>
            <Card><p className="text-sm text-[#86868B]">Energy</p><p className="mt-3 text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{mutation.data.details.energy} kg</p></Card>
            <Card><p className="text-sm text-[#86868B]">Diet</p><p className="mt-3 text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{mutation.data.details.diet} kg</p></Card>
          </div>
          <Card>
            <p className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Nudge:</p>
            <p className="mt-2 text-sm leading-relaxed text-[#86868B]">{mutation.data.tip}</p>
          </Card>
        </div>
      )}
    </div>
  );
}
