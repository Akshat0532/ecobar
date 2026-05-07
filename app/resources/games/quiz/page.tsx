'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';

const QUESTIONS = [
  {
    question: 'Which sector is the largest contributor to global greenhouse gas emissions?',
    options: ['Transportation', 'Energy & Heat Production', 'Agriculture', 'Fashion Industry'],
    correct: 1,
    explanation: 'Energy and heat production accounts for ~25% of global emissions, making it the single largest sector.',
  },
  {
    question: 'How many trees does it take to offset 1 tonne of CO₂ per year?',
    options: ['5 trees', '15-20 trees', '50 trees', '100 trees'],
    correct: 1,
    explanation: 'A mature tree absorbs about 22 kg of CO₂ per year, so it takes roughly 15-20 trees to offset one tonne annually.',
  },
  {
    question: 'Which food has the highest carbon footprint per kilogram?',
    options: ['Chicken', 'Cheese', 'Beef', 'Rice'],
    correct: 2,
    explanation: 'Beef produces ~60 kg CO₂e per kg — about 10x more than chicken and 100x more than vegetables.',
  },
  {
    question: 'What percentage of global emissions does India contribute?',
    options: ['~3%', '~7%', '~15%', '~25%'],
    correct: 1,
    explanation: 'India contributes ~7% of global emissions, but has one of the lowest per-capita emissions at ~1.9 tonnes/year.',
  },
  {
    question: 'A single long-haul return flight (e.g., Delhi to London) emits roughly how much CO₂e per passenger?',
    options: ['200 kg', '500 kg', '1,500-2,000 kg', '5,000 kg'],
    correct: 2,
    explanation: 'A return flight from Delhi to London emits roughly 1.5-2 tonnes of CO₂e per economy passenger — nearly equal to India\'s annual per-capita average.',
  },
  {
    question: 'Which of these actions saves the MOST CO₂ per year?',
    options: ['Switching to LED bulbs', 'Eating one less meat meal/week', 'Going car-free', 'Recycling everything'],
    correct: 2,
    explanation: 'Going car-free saves an average of 2.4 tonnes CO₂e/year — far more than any other individual action.',
  },
  {
    question: 'The Paris Agreement aims to limit global warming to how many degrees above pre-industrial levels?',
    options: ['1°C', '1.5°C', '2.5°C', '3°C'],
    correct: 1,
    explanation: 'The Paris Agreement targets limiting warming to 1.5°C, with a hard ceiling of 2°C. We\'re currently at ~1.1°C.',
  },
  {
    question: 'What is the carbon footprint of producing a single cotton T-shirt?',
    options: ['0.5 kg CO₂e', '2 kg CO₂e', '8 kg CO₂e', '20 kg CO₂e'],
    correct: 2,
    explanation: 'A cotton T-shirt produces about 8 kg CO₂e from growing cotton, manufacturing, and shipping.',
  },
  {
    question: 'Which renewable energy source currently generates the most electricity globally?',
    options: ['Solar', 'Wind', 'Hydroelectric', 'Geothermal'],
    correct: 2,
    explanation: 'Hydroelectric power generates ~16% of global electricity, more than solar and wind combined (though solar is growing fastest).',
  },
  {
    question: 'What does "Scope 3 emissions" refer to?',
    options: ['Direct emissions from fuel burning', 'Emissions from purchased electricity', 'Value chain and indirect emissions', 'Emissions from government policy'],
    correct: 2,
    explanation: 'Scope 3 covers all indirect emissions in a company\'s value chain — including purchased goods, travel, and waste.',
  },
];

type GameState = 'playing' | 'answered' | 'finished';

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [answers, setAnswers] = useState<boolean[]>([]);

  const question = QUESTIONS[currentQuestion];

  const handleAnswer = (index: number) => {
    if (gameState === 'answered') return;
    setSelectedAnswer(index);
    setGameState('answered');
    const isCorrect = index === question.correct;
    if (isCorrect) setScore((s) => s + 1);
    setAnswers((a) => [...a, isCorrect]);
  };

  const handleNext = () => {
    if (currentQuestion >= QUESTIONS.length - 1) {
      setGameState('finished');
    } else {
      setCurrentQuestion((q) => q + 1);
      setSelectedAnswer(null);
      setGameState('playing');
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setGameState('playing');
    setAnswers([]);
  };

  const getScoreRating = () => {
    const pct = (score / QUESTIONS.length) * 100;
    if (pct >= 90) return { emoji: '🏆', title: 'Climate Expert!', desc: 'You really know your stuff. Share your knowledge with friends!' };
    if (pct >= 70) return { emoji: '🌟', title: 'Eco Enthusiast!', desc: 'Great job! A few more reads and you\'ll be an expert.' };
    if (pct >= 50) return { emoji: '🌱', title: 'Growing Learner', desc: 'You\'re on the right track. Check out our articles to learn more.' };
    return { emoji: '📚', title: 'Just Getting Started', desc: 'No worries! Explore our resources to boost your climate knowledge.' };
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/resources" className="inline-flex items-center gap-2 text-sm font-medium text-[#0071E3] hover:underline mb-8">
        <ArrowLeft size={16} strokeWidth={1.5} /> Back to Resources
      </Link>

      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
          🧠 Carbon Footprint Quiz
        </h1>
        <p className="mt-2 text-sm text-[#86868B]">Test your climate knowledge — 10 questions, instant feedback</p>
      </div>

      <AnimatePresence mode="wait">
        {gameState !== 'finished' ? (
          <motion.div key={currentQuestion} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Question {currentQuestion + 1} of {QUESTIONS.length}</span>
                <span className="text-[#0071E3] font-semibold">Score: {score}/{QUESTIONS.length}</span>
              </div>
              <div className="h-2 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-[#0071E3] to-[#00C7FF] rounded-full" animate={{ width: `${((currentQuestion + (gameState === 'answered' ? 1 : 0)) / QUESTIONS.length) * 100}%` }} transition={{ duration: 0.5 }} />
              </div>
              {/* Dot indicators */}
              <div className="flex gap-1.5 mt-3 justify-center">
                {QUESTIONS.map((_, i) => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i < answers.length
                      ? answers[i] ? 'bg-[#30D158]' : 'bg-[#FF3B30]'
                      : i === currentQuestion ? 'bg-[#0071E3] scale-125' : 'bg-[#D2D2D7] dark:bg-[#38383A]'
                  }`} />
                ))}
              </div>
            </div>

            {/* Question */}
            <div className="rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed">{question.question}</h2>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {question.options.map((option, i) => {
                let style = 'border-[#D2D2D7] dark:border-[#38383A] bg-white dark:bg-[#2C2C2E] hover:border-[#0071E3]/40';
                if (gameState === 'answered') {
                  if (i === question.correct) style = 'border-[#30D158] bg-[#30D158]/10';
                  else if (i === selectedAnswer) style = 'border-[#FF3B30] bg-[#FF3B30]/10';
                  else style = 'border-[#D2D2D7] dark:border-[#38383A] bg-white/50 dark:bg-[#2C2C2E]/50 opacity-50';
                }

                return (
                  <motion.button key={i} onClick={() => handleAnswer(i)} disabled={gameState === 'answered'}
                    className={`w-full rounded-xl border-2 px-5 py-4 text-left text-sm font-medium transition-all ${style}`}
                    whileHover={gameState === 'playing' ? { scale: 1.01 } : {}} whileTap={gameState === 'playing' ? { scale: 0.99 } : {}}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#F5F5F7] dark:bg-[#38383A] flex items-center justify-center text-xs font-bold text-[#86868B]">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-[#1D1D1F] dark:text-[#F5F5F7]">{option}</span>
                      </div>
                      {gameState === 'answered' && i === question.correct && <CheckCircle size={20} className="text-[#30D158]" />}
                      {gameState === 'answered' && i === selectedAnswer && i !== question.correct && <XCircle size={20} className="text-[#FF3B30]" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {gameState === 'answered' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6">
                  <div className={`rounded-xl p-4 ${selectedAnswer === question.correct ? 'bg-[#30D158]/10' : 'bg-[#FF9500]/10'}`}>
                    <p className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
                      {selectedAnswer === question.correct ? '✅ Correct!' : '❌ Not quite!'}
                    </p>
                    <p className="text-sm text-[#86868B]">{question.explanation}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next Button */}
            {gameState === 'answered' && (
              <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={handleNext}
                className="w-full rounded-full bg-[#0071E3] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0077ED] active:scale-[0.97] transition-all">
                {currentQuestion >= QUESTIONS.length - 1 ? 'See Results' : 'Next Question →'}
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            {(() => {
              const rating = getScoreRating();
              return (
                <div className="text-center space-y-8">
                  <div className="text-7xl">{rating.emoji}</div>
                  <div>
                    <h2 className="text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{rating.title}</h2>
                    <p className="mt-2 text-[#86868B]">{rating.desc}</p>
                  </div>

                  <div className="rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-8">
                    <div className="text-5xl font-bold text-[#0071E3]">{score}/{QUESTIONS.length}</div>
                    <p className="text-sm text-[#86868B] mt-2">questions answered correctly</p>
                    <div className="flex gap-2 mt-4 justify-center">
                      {answers.map((correct, i) => (
                        <div key={i} className={`w-4 h-4 rounded-full ${correct ? 'bg-[#30D158]' : 'bg-[#FF3B30]'}`} />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={handleRestart}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0071E3] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0077ED] active:scale-[0.97] transition-all">
                      <RotateCcw size={16} /> Play Again
                    </button>
                    <Link href="/resources" className="inline-flex items-center justify-center gap-2 rounded-full bg-black/5 dark:bg-white/10 px-6 py-3 text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/10 dark:hover:bg-white/15 transition-all">
                      Explore Resources
                    </Link>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
