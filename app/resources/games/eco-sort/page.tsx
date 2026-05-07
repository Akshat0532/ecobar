'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Timer, Zap } from 'lucide-react';

type Bin = 'recycle' | 'compost' | 'landfill' | 'special';

interface WasteItem {
  name: string;
  emoji: string;
  correctBin: Bin;
  tip: string;
}

const WASTE_ITEMS: WasteItem[] = [
  { name: 'Plastic Bottle (PET)', emoji: '🧴', correctBin: 'recycle', tip: 'Empty and rinse before recycling. Leave the cap on.' },
  { name: 'Banana Peel', emoji: '🍌', correctBin: 'compost', tip: 'Fruit peels decompose quickly and make great compost.' },
  { name: 'Styrofoam Cup', emoji: '🥤', correctBin: 'landfill', tip: 'Styrofoam cannot be recycled in most areas. Avoid buying it.' },
  { name: 'Old Battery', emoji: '🔋', correctBin: 'special', tip: 'Batteries contain toxic chemicals — take them to a collection point.' },
  { name: 'Cardboard Box', emoji: '📦', correctBin: 'recycle', tip: 'Flatten boxes to save space. Remove tape and labels if possible.' },
  { name: 'Tea Leaves', emoji: '🍵', correctBin: 'compost', tip: 'Used tea leaves (loose or in biodegradable bags) are great for compost.' },
  { name: 'Chip Bag', emoji: '🍟', correctBin: 'landfill', tip: 'Foil-lined chip bags are mixed material and can\'t be recycled.' },
  { name: 'Glass Jar', emoji: '🫙', correctBin: 'recycle', tip: 'Glass is infinitely recyclable! Rinse it out first.' },
  { name: 'Light Bulb (CFL)', emoji: '💡', correctBin: 'special', tip: 'CFL bulbs contain mercury. Take them to a hazardous waste facility.' },
  { name: 'Egg Shells', emoji: '🥚', correctBin: 'compost', tip: 'Crush them for faster decomposition. Great source of calcium for soil.' },
  { name: 'Aluminum Can', emoji: '🥫', correctBin: 'recycle', tip: 'Aluminum can be recycled forever without quality loss. Rinse first.' },
  { name: 'Plastic Straw', emoji: '🥤', correctBin: 'landfill', tip: 'Too small for recycling machines. Use reusable straws instead.' },
  { name: 'Old Paint Can', emoji: '🎨', correctBin: 'special', tip: 'Paint is hazardous waste. Check with your local disposal center.' },
  { name: 'Coffee Grounds', emoji: '☕', correctBin: 'compost', tip: 'Coffee grounds add nitrogen to compost and can repel pests.' },
  { name: 'Newspaper', emoji: '📰', correctBin: 'recycle', tip: 'Paper is one of the most successfully recycled materials worldwide.' },
];

const BIN_INFO: Record<Bin, { emoji: string; label: string; color: string }> = {
  recycle: { emoji: '♻️', label: 'Recycle', color: '#0071E3' },
  compost: { emoji: '🌱', label: 'Compost', color: '#30D158' },
  landfill: { emoji: '🗑️', label: 'Landfill', color: '#86868B' },
  special: { emoji: '⚠️', label: 'Special Disposal', color: '#FF9500' },
};

type GameState = 'ready' | 'playing' | 'feedback' | 'finished';

export default function EcoSortPage() {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [items, setItems] = useState<WasteItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [lastResult, setLastResult] = useState<{ correct: boolean; tip: string } | null>(null);
  const [results, setResults] = useState<boolean[]>([]);

  const startGame = useCallback(() => {
    const shuffled = [...WASTE_ITEMS].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(90);
    setLastResult(null);
    setResults([]);
    setGameState('playing');
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) { setGameState('finished'); return; }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleSort = (bin: Bin) => {
    if (gameState !== 'playing' || currentIndex >= items.length) return;
    const item = items[currentIndex];
    const correct = item.correctBin === bin;

    if (correct) {
      const bonus = streak >= 3 ? 15 : 10;
      setScore((s) => s + bonus);
      setStreak((s) => s + 1);
      setBestStreak((b) => Math.max(b, streak + 1));
    } else {
      setScore((s) => Math.max(0, s - 5));
      setStreak(0);
    }

    setLastResult({ correct, tip: item.tip });
    setResults((r) => [...r, correct]);
    setGameState('feedback');

    setTimeout(() => {
      if (currentIndex >= items.length - 1) {
        setGameState('finished');
      } else {
        setCurrentIndex((i) => i + 1);
        setLastResult(null);
        setGameState('playing');
      }
    }, 1200);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/resources" className="inline-flex items-center gap-2 text-sm font-medium text-[#0071E3] hover:underline mb-8">
        <ArrowLeft size={16} strokeWidth={1.5} /> Back to Resources
      </Link>

      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">♻️ Eco Sort Challenge</h1>
        <p className="mt-2 text-sm text-[#86868B]">Sort waste into the right bin — beat the clock!</p>
      </div>

      {gameState === 'ready' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
          <div className="rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-8 space-y-6">
            <div className="text-6xl">♻️</div>
            <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">How to Play</h2>
            <div className="grid gap-4 sm:grid-cols-2 text-left">
              {[
                { icon: '📦', text: 'Items appear one at a time' },
                { icon: '🎯', text: 'Click the correct bin to sort' },
                { icon: '⏱️', text: '90 seconds on the clock' },
                { icon: '🔥', text: 'Build streaks for bonus points!' },
              ].map((rule) => (
                <div key={rule.text} className="flex gap-3 rounded-xl bg-white dark:bg-[#2C2C2E] p-3">
                  <span className="text-xl">{rule.icon}</span>
                  <span className="text-sm text-[#86868B]">{rule.text}</span>
                </div>
              ))}
            </div>
            <div className="text-sm text-[#86868B]">
              <p>✅ Correct: <span className="text-[#30D158] font-semibold">+10 pts</span> (🔥 streak bonus: <span className="text-[#FF9500] font-semibold">+15 pts</span>)</p>
              <p>❌ Wrong: <span className="text-[#FF3B30] font-semibold">−5 pts</span></p>
            </div>
          </div>
          <button onClick={startGame} className="rounded-full bg-[#0071E3] px-8 py-4 text-lg font-semibold text-white hover:bg-[#0077ED] active:scale-[0.97] transition-all shadow-apple-blue">
            Start Sorting!
          </button>
        </motion.div>
      )}

      {(gameState === 'playing' || gameState === 'feedback') && currentIndex < items.length && (
        <div className="space-y-6">
          {/* Stats bar */}
          <div className="flex items-center justify-between rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] px-5 py-3">
            <div className="flex items-center gap-2">
              <Timer size={16} className="text-[#86868B]" />
              <span className={`text-sm font-bold ${timeLeft <= 15 ? 'text-[#FF3B30] animate-pulse' : 'text-[#1D1D1F] dark:text-[#F5F5F7]'}`}>{formatTime(timeLeft)}</span>
            </div>
            <div className="text-sm font-semibold text-[#0071E3]">{currentIndex + 1}/{items.length}</div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{score} pts</span>
              {streak >= 3 && (
                <span className="flex items-center gap-1 text-xs font-bold text-[#FF9500] bg-[#FF9500]/10 px-2 py-0.5 rounded-full animate-pulse">
                  <Zap size={12} /> {streak}x
                </span>
              )}
            </div>
          </div>

          {/* Current Item */}
          <AnimatePresence mode="wait">
            <motion.div key={currentIndex} initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -30, scale: 0.9 }} transition={{ duration: 0.3 }}
              className="rounded-2xl bg-white dark:bg-[#1C1C1E] p-8 text-center shadow-apple-md">
              <div className="text-6xl mb-4">{items[currentIndex].emoji}</div>
              <h2 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{items[currentIndex].name}</h2>
              <p className="text-sm text-[#86868B] mt-2">Where does this go?</p>
            </motion.div>
          </AnimatePresence>

          {/* Feedback */}
          <AnimatePresence>
            {lastResult && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }}
                className={`rounded-xl p-3 text-sm text-center ${lastResult.correct ? 'bg-[#30D158]/10 text-[#30D158]' : 'bg-[#FF3B30]/10 text-[#FF3B30]'}`}>
                {lastResult.correct ? '✅ Correct!' : '❌ Wrong!'} — {lastResult.tip}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bins */}
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(BIN_INFO) as [Bin, typeof BIN_INFO[Bin]][]).map(([bin, info]) => (
              <motion.button key={bin} onClick={() => handleSort(bin)} disabled={gameState === 'feedback'}
                className="rounded-2xl border-2 border-[#D2D2D7] dark:border-[#38383A] bg-white dark:bg-[#2C2C2E] p-5 text-center transition-all hover:border-current hover:shadow-apple-md disabled:opacity-60"
                style={{ '--tw-border-opacity': 1, color: info.color } as any}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <div className="text-3xl mb-2">{info.emoji}</div>
                <p className="text-sm font-semibold" style={{ color: info.color }}>{info.label}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8">
          <div className="text-7xl">{score >= 100 ? '🏆' : score >= 60 ? '🌟' : '🌱'}</div>
          <div>
            <h2 className="text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {score >= 100 ? 'Sorting Master!' : score >= 60 ? 'Great Effort!' : 'Keep Practicing!'}
            </h2>
            <p className="mt-2 text-[#86868B]">{results.filter(Boolean).length} out of {results.length} items sorted correctly</p>
          </div>

          <div className="rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-8">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-3xl font-bold text-[#0071E3]">{score}</div>
                <p className="text-xs text-[#86868B]">Points</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#FF9500]">{bestStreak}x</div>
                <p className="text-xs text-[#86868B]">Best Streak</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#30D158]">{Math.round((results.filter(Boolean).length / results.length) * 100)}%</div>
                <p className="text-xs text-[#86868B]">Accuracy</p>
              </div>
            </div>
            <div className="flex gap-1.5 mt-4 justify-center">
              {results.map((correct, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${correct ? 'bg-[#30D158]' : 'bg-[#FF3B30]'}`} />
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={startGame} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0071E3] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0077ED] active:scale-[0.97] transition-all">
              <RotateCcw size={16} /> Play Again
            </button>
            <Link href="/resources" className="inline-flex items-center justify-center gap-2 rounded-full bg-black/5 dark:bg-white/10 px-6 py-3 text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/10 dark:hover:bg-white/15 transition-all">
              Back to Resources
            </Link>
          </div>
        </motion.div>
      )}
    </main>
  );
}
