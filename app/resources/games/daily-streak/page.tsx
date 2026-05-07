'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Flame, Check, Trophy, Calendar } from 'lucide-react';

const DAILY_HABITS = [
  { id: 'reusable_bag', emoji: '🛍️', label: 'Used a reusable bag', impact: '0.03 kg CO₂e saved' },
  { id: 'public_transit', emoji: '🚌', label: 'Took public transit or walked', impact: '2.6 kg CO₂e saved' },
  { id: 'no_meat', emoji: '🥗', label: 'Ate a plant-based meal', impact: '0.7 kg CO₂e saved' },
  { id: 'lights_off', emoji: '💡', label: 'Turned off unused lights', impact: '0.1 kg CO₂e saved' },
  { id: 'short_shower', emoji: '🚿', label: 'Took a short shower (< 5 min)', impact: '0.3 kg CO₂e saved' },
  { id: 'reusable_bottle', emoji: '🧴', label: 'Used a reusable water bottle', impact: '0.08 kg CO₂e saved' },
  { id: 'no_food_waste', emoji: '🍽️', label: 'No food wasted today', impact: '0.5 kg CO₂e saved' },
  { id: 'unplug', emoji: '🔌', label: 'Unplugged unused devices', impact: '0.12 kg CO₂e saved' },
];

const STREAK_MESSAGES = [
  { min: 0, emoji: '🌱', title: 'Just planted the seed!', message: 'Start checking off habits to begin your streak.' },
  { min: 1, emoji: '🌿', title: 'Day 1 — It begins!', message: 'Every journey starts with a single step.' },
  { min: 3, emoji: '🌳', title: 'Growing strong!', message: '3 days in. You\'re building real momentum.' },
  { min: 7, emoji: '🔥', title: 'One week streak!', message: 'A full week of eco-conscious choices. Amazing!' },
  { min: 14, emoji: '⭐', title: 'Two weeks!', message: 'You\'re forming lasting habits. Keep it up!' },
  { min: 30, emoji: '🏆', title: 'Monthly champion!', message: '30 days! You\'re officially an eco warrior.' },
];

function getDateKey(date: Date = new Date()) {
  return date.toISOString().split('T')[0];
}

function loadData(): { checkedDays: Record<string, string[]>; streak: number; bestStreak: number } {
  if (typeof window === 'undefined') return { checkedDays: {}, streak: 0, bestStreak: 0 };
  try {
    const raw = localStorage.getItem('eco_streak_data');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { checkedDays: {}, streak: 0, bestStreak: 0 };
}

function saveData(data: { checkedDays: Record<string, string[]>; streak: number; bestStreak: number }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('eco_streak_data', JSON.stringify(data));
}

function calculateStreak(checkedDays: Record<string, string[]>): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = getDateKey(d);
    if (checkedDays[key] && checkedDays[key].length > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export default function DailyStreakPage() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<{ checkedDays: Record<string, string[]>; streak: number; bestStreak: number }>({ checkedDays: {}, streak: 0, bestStreak: 0 });

  useEffect(() => {
    setMounted(true);
    setData(loadData());
  }, []);

  const todayKey = getDateKey();
  const todayHabits = useMemo(() => data.checkedDays[todayKey] || [], [data.checkedDays, todayKey]);

  const toggleHabit = (habitId: string) => {
    const currentDay = data.checkedDays[todayKey] || [];
    const updated = currentDay.includes(habitId)
      ? currentDay.filter((h) => h !== habitId)
      : [...currentDay, habitId];

    const newCheckedDays = { ...data.checkedDays, [todayKey]: updated };
    const newStreak = calculateStreak(newCheckedDays);
    const newBest = Math.max(data.bestStreak, newStreak);
    const newData = { checkedDays: newCheckedDays, streak: newStreak, bestStreak: newBest };
    setData(newData);
    saveData(newData);
  };

  const streakMessage = useMemo(() => {
    const sorted = [...STREAK_MESSAGES].sort((a, b) => b.min - a.min);
    return sorted.find((m) => data.streak >= m.min) || STREAK_MESSAGES[0];
  }, [data.streak]);

  const totalSavedToday = useMemo(() => {
    return todayHabits.reduce((sum, id) => {
      const habit = DAILY_HABITS.find((h) => h.id === id);
      if (!habit) return sum;
      const num = parseFloat(habit.impact);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }, [todayHabits]);

  // Generate last 28 days for calendar
  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = getDateKey(d);
      const habits = data.checkedDays[key] || [];
      days.push({ date: d, key, count: habits.length, isToday: i === 0 });
    }
    return days;
  }, [data.checkedDays]);

  if (!mounted) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 rounded-full bg-[#D2D2D7] dark:bg-[#38383A]" />
          <div className="h-32 rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E]" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/resources" className="inline-flex items-center gap-2 text-sm font-medium text-[#0071E3] hover:underline mb-8">
        <ArrowLeft size={16} strokeWidth={1.5} /> Back to Resources
      </Link>

      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">🔥 Daily Eco Streak</h1>
        <p className="mt-2 text-sm text-[#86868B]">Build eco-friendly habits one day at a time</p>
      </div>

      {/* Streak Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-[#FF9500]/10 to-[#FF3B30]/5 dark:from-[#FF9500]/20 dark:to-[#FF3B30]/10 p-8 text-center mb-8">
        <div className="text-5xl mb-3">{streakMessage.emoji}</div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame size={24} className="text-[#FF9500]" />
          <span className="text-4xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{data.streak}</span>
          <span className="text-lg text-[#86868B]">day streak</span>
        </div>
        <p className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{streakMessage.title}</p>
        <p className="text-xs text-[#86868B] mt-1">{streakMessage.message}</p>
        {data.bestStreak > 0 && (
          <div className="flex items-center justify-center gap-1 mt-3 text-xs text-[#86868B]">
            <Trophy size={12} /> Best streak: {data.bestStreak} days
          </div>
        )}
      </motion.div>

      {/* Today's Habits */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Today&rsquo;s Habits</h2>
          <span className="text-sm font-semibold text-[#30D158]">
            {todayHabits.length}/{DAILY_HABITS.length} done
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-full overflow-hidden mb-5">
          <motion.div className="h-full bg-gradient-to-r from-[#30D158] to-[#00C7FF] rounded-full"
            animate={{ width: `${(todayHabits.length / DAILY_HABITS.length) * 100}%` }} transition={{ duration: 0.5 }} />
        </div>

        <div className="space-y-2">
          {DAILY_HABITS.map((habit, i) => {
            const checked = todayHabits.includes(habit.id);
            return (
              <motion.button key={habit.id} onClick={() => toggleHabit(habit.id)} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className={`w-full flex items-center gap-4 rounded-xl p-4 text-left transition-all ${
                  checked
                    ? 'bg-[#30D158]/10 ring-1 ring-[#30D158]/30'
                    : 'bg-[#F5F5F7] dark:bg-[#1C1C1E] hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E]'
                }`}>
                <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  checked ? 'bg-[#30D158] text-white' : 'bg-white dark:bg-[#2C2C2E] border border-[#D2D2D7] dark:border-[#38383A]'
                }`}>
                  {checked && <Check size={16} strokeWidth={2.5} />}
                </div>
                <span className="text-xl">{habit.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${checked ? 'text-[#30D158]' : 'text-[#1D1D1F] dark:text-[#F5F5F7]'}`}>{habit.label}</p>
                  <p className="text-xs text-[#86868B]">{habit.impact}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {todayHabits.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-xl bg-[#30D158]/10 p-4 text-center">
            <p className="text-sm text-[#30D158] font-semibold">
              🌿 You&rsquo;ve saved ~{totalSavedToday.toFixed(2)} kg CO₂e today!
            </p>
          </motion.div>
        )}
      </div>

      {/* Calendar Heatmap */}
      <div className="rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-[#0071E3]" />
          <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Last 28 Days</h3>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs text-[#86868B] font-medium">{d}</div>
          ))}
          {calendarDays.map((day) => {
            const intensity = day.count === 0 ? 'bg-white dark:bg-[#2C2C2E]'
              : day.count <= 2 ? 'bg-[#30D158]/20'
              : day.count <= 5 ? 'bg-[#30D158]/40'
              : 'bg-[#30D158]/70';

            return (
              <div key={day.key}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs transition-all ${intensity} ${day.isToday ? 'ring-2 ring-[#0071E3]' : ''}`}
                title={`${day.date.toLocaleDateString()}: ${day.count} habits`}>
                {day.count > 0 ? <span className="text-[10px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{day.count}</span> : null}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 mt-3 text-xs text-[#86868B]">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded bg-white dark:bg-[#2C2C2E]" />
            <div className="w-3 h-3 rounded bg-[#30D158]/20" />
            <div className="w-3 h-3 rounded bg-[#30D158]/40" />
            <div className="w-3 h-3 rounded bg-[#30D158]/70" />
          </div>
          <span>More</span>
        </div>
      </div>
    </main>
  );
}
