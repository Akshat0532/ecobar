'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getBrowserSupabaseClient } from '@/lib/supabaseClient';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog } from './ui/dialog';

type OnboardingData = {
  householdSize: number; zipCode: string; reasons: string[]; unitPreference: 'metric' | 'imperial';
};

const reasonOptions = [
  { value: 'saveMoney', label: 'Save Money' },
  { value: 'protectNature', label: 'Protect Nature' },
  { value: 'learn', label: 'Learn' },
  { value: 'workRequirement', label: 'Work Requirement' }
];

export function OnboardingWizard({ open, onComplete }: { open: boolean; onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({ householdSize: 1, zipCode: '', reasons: [], unitPreference: 'metric' });
  const supabase = getBrowserSupabaseClient();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (onboardingData: OnboardingData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');
      const { error } = await supabase.from('profiles').upsert({
        user_id: user.id, household_size: onboardingData.householdSize, zip_code: onboardingData.zipCode,
        reasons: onboardingData.reasons, unit_preference: onboardingData.unitPreference,
        distance_unit: 'km', currency: 'USD', onboarding_completed: true
      });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['profile'] }); onComplete(); }
  });

  const selBtn = (active: boolean) =>
    `rounded-xl border px-4 py-3 text-left transition-all ${active
      ? 'border-[#0071E3] bg-[#0071E3]/10 text-[#0071E3]'
      : 'border-[#D2D2D7] dark:border-[#38383A] bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] hover:border-[#0071E3]/40'}`;

  return (
    <Dialog open={open} onClose={() => {}}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Welcome to EcoTrace</h2>
          <p className="mt-2 text-sm text-[#86868B]">Let&apos;s personalize your experience</p>
        </div>

        <div className="flex justify-center space-x-2">
          {[1, 2, 3].map((s) => (<div key={s} className={`h-2 w-8 rounded-full ${s <= step ? 'bg-[#0071E3]' : 'bg-[#D2D2D7] dark:bg-[#38383A]'}`} />))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Household basics</h3>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Household size</label>
                <Input type="number" min={1} value={data.householdSize} onChange={(e) => setData(prev => ({ ...prev, householdSize: Number(e.target.value) }))} placeholder="Number of people" /></div>
              <div><label className="block text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Zip/Postal code</label>
                <Input value={data.zipCode} onChange={(e) => setData(prev => ({ ...prev, zipCode: e.target.value }))} placeholder="For local grid intensity" /></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Why are you here?</h3>
            <p className="text-sm text-[#86868B]">Select all that apply</p>
            <div className="grid gap-3">
              {reasonOptions.map((option) => (
                <button key={option.value} type="button"
                  onClick={() => setData(prev => ({ ...prev, reasons: prev.reasons.includes(option.value) ? prev.reasons.filter(r => r !== option.value) : [...prev.reasons, option.value] }))}
                  className={selBtn(data.reasons.includes(option.value))}>{option.label}</button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Unit preference</h3>
            <p className="text-sm text-[#86868B]">Choose your default units</p>
            <div className="grid gap-3">
              <button type="button" onClick={() => setData(prev => ({ ...prev, unitPreference: 'metric' }))} className={selBtn(data.unitPreference === 'metric')}>
                <div className="font-semibold">Metric</div><div className="text-sm text-[#86868B]">kg CO₂e</div>
              </button>
              <button type="button" onClick={() => setData(prev => ({ ...prev, unitPreference: 'imperial' }))} className={selBtn(data.unitPreference === 'imperial')}>
                <div className="font-semibold">Imperial</div><div className="text-sm text-[#86868B]">lbs CO₂e</div>
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button onClick={() => { if (step > 1) setStep(step - 1); }} disabled={step === 1} variant="secondary">Back</Button>
          <Button onClick={() => { if (step < 3) setStep(step + 1); else mutation.mutate(data); }} disabled={mutation.status === 'pending'}>
            {step === 3 ? (mutation.status === 'pending' ? 'Saving...' : 'Complete') : 'Next'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
