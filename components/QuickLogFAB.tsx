'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog } from './ui/dialog';

const QUICK_LOG_PRESETS = [
  { id: 'drove_5_miles', label: 'Drove 5 miles (car)', emission: 2.06, type: 'transport' },
  { id: 'drove_10_miles', label: 'Drove 10 miles (car)', emission: 4.11, type: 'transport' },
  { id: 'uber_ride', label: 'Uber/Lyft ride', emission: 1.5, type: 'transport' },
  { id: 'train_commute', label: 'Train commute', emission: 0.41, type: 'transport' },
  { id: 'short_flight', label: 'Short flight (1 hour)', emission: 90, type: 'transport' },
  { id: 'vegetarian_meal', label: 'Ate vegetarian', emission: -0.7, type: 'diet' },
  { id: 'beef_meal', label: 'Ate beef meal', emission: 2.5, type: 'diet' },
  { id: 'lights_off', label: 'Turned off lights early', emission: -0.1, type: 'energy' },
  { id: 'short_shower', label: 'Took a short shower', emission: -0.3, type: 'energy' },
  { id: 'package_arrive', label: 'Package arrived', emission: 0.8, type: 'goods' },
  { id: 'meal_out', label: 'Ate out ($30)', emission: 1.2, type: 'goods' },
];

export function QuickLogFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customDescription, setCustomDescription] = useState('');
  const [customEmission, setCustomEmission] = useState(0);
  const queryClient = useQueryClient();

  const logMutation = useMutation({
    mutationFn: async (emission: number) => {
      const response = await fetch('/api/quick-log', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emission,
          description: selectedPreset ? QUICK_LOG_PRESETS.find(p => p.id === selectedPreset)?.label : customDescription,
          type: selectedPreset ? QUICK_LOG_PRESETS.find(p => p.id === selectedPreset)?.type : 'custom',
        }),
      });
      if (!response.ok) throw new Error('Failed to log activity');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carbonLogs'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyTrend'] });
      setIsOpen(false); setSelectedPreset(null); setCustomDescription(''); setCustomEmission(0);
    },
  });

  const handleQuickLog = (presetId: string) => {
    const preset = QUICK_LOG_PRESETS.find(p => p.id === presetId);
    if (preset) logMutation.mutate(preset.emission);
  };

  return (
    <>
      <motion.button onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#0071E3] text-white shadow-apple-blue hover:shadow-lg transition-all"
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <Plus size={24} strokeWidth={2} />
      </motion.button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Quick Log</h2>
            <p className="mt-2 text-sm text-[#86868B]">Log an activity or update your footprint.</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-[#86868B]">Quick presets</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {QUICK_LOG_PRESETS.map((preset) => (
                <motion.button key={preset.id} onClick={() => handleQuickLog(preset.id)} disabled={logMutation.status === 'pending'}
                  className={`rounded-xl border border-[#D2D2D7] dark:border-[#38383A] bg-white dark:bg-[#2C2C2E] px-3 py-2 text-left text-sm transition-all hover:border-[#0071E3]/40 hover:shadow-apple ${logMutation.status === 'pending' ? 'opacity-50' : ''}`}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <div className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">{preset.label}</div>
                  <div className={`text-xs ${preset.emission < 0 ? 'text-[#30D158]' : 'text-[#FF3B30]'}`}>
                    {preset.emission > 0 ? '+' : ''}{preset.emission.toFixed(1)} kg CO₂e
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#D2D2D7] dark:bg-[#38383A]" />

          <div className="space-y-3">
            <p className="text-sm font-medium text-[#86868B]">Custom log</p>
            <Input placeholder="What did you do?" value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} />
            <div className="flex gap-2">
              <Input type="number" placeholder="CO₂e (kg)" step={0.1} value={customEmission || ''} onChange={(e) => setCustomEmission(Number(e.target.value))} className="flex-1" />
              <Button onClick={() => { if (customDescription && customEmission !== 0) logMutation.mutate(customEmission); }}
                disabled={!customDescription || customEmission === 0 || logMutation.status === 'pending'}>Log</Button>
            </div>
          </div>

          {logMutation.status === 'pending' && <p className="text-sm text-[#0071E3]">Logging activity...</p>}
        </motion.div>
      </Dialog>
    </>
  );
}
