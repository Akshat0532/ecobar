'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ACTIVE_CHALLENGES, getProgressMessage, hasUserReduced, type Challenge } from '@/lib/challenges';

export function CommunityChallenges() {
  const [joinedChallenges, setJoinedChallenges] = useState<Set<string>>(new Set());
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Community Challenges</h1>
        <p className="text-lg text-[#86868B] max-w-2xl mx-auto leading-relaxed">
          Join time-bound sustainability challenges. Track your progress without shame—we celebrate reductions, not competition.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {ACTIVE_CHALLENGES.map((challenge, idx) => (
          <ChallengeCard key={challenge.id} challenge={challenge} isJoined={joinedChallenges.has(challenge.id)}
            isExpanded={expandedChallenge === challenge.id}
            onJoin={() => setJoinedChallenges((prev) => new Set(prev).add(challenge.id))}
            onExpand={() => setExpandedChallenge(expandedChallenge === challenge.id ? null : challenge.id)}
            delay={idx * 0.1} />
        ))}
      </div>

      <Card className="text-center">
        <p className="text-sm text-[#86868B]">
          🔒 <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">Privacy First:</strong> No public leaderboards comparing exact kg values. We show aggregate progress: &quot;73% of participants reduced emissions this month.&quot;
        </p>
      </Card>
    </div>
  );
}

function ChallengeCard({ challenge, isJoined, isExpanded, onJoin, onExpand, delay }: {
  challenge: Challenge; isJoined: boolean; isExpanded: boolean; onJoin: () => void; onExpand: () => void; delay: number;
}) {
  const teamProgress = Math.floor(Math.random() * (challenge.teamGoalValue * 0.95));
  const progressPercent = Math.min((teamProgress / challenge.teamGoalValue) * 100, 100);
  const participantCount = Math.floor(Math.random() * 5000) + 500;
  const reducedPercent = Math.floor(Math.random() * 40) + 55;
  const daysLeft = Math.ceil((challenge.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className={`overflow-hidden cursor-pointer transition-all ${isJoined ? 'ring-1 ring-[#0071E3]/30' : 'hover:shadow-apple-md'}`}>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-4xl">{challenge.emoji}</span>
              <div>
                <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{challenge.title}</h3>
                <p className="text-xs text-[#86868B] mt-1">{daysLeft} days left • {participantCount.toLocaleString()} joined</p>
              </div>
            </div>
            {isJoined && <span className="px-3 py-1 bg-[#0071E3]/10 text-[#0071E3] text-xs font-bold rounded-full">✓ JOINED</span>}
          </div>

          <p className="text-sm text-[#86868B]">{challenge.description}</p>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#86868B]">Team Goal</span>
              <span className="text-[#0071E3] font-semibold">{teamProgress.toLocaleString()} / {challenge.teamGoalValue.toLocaleString()} {challenge.teamGoalUnit}</span>
            </div>
            <div className="w-full bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-full h-3 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ delay: delay + 0.3, duration: 0.8 }}
                className="h-full bg-gradient-to-r from-[#0071E3] to-[#00C7FF] rounded-full" />
            </div>
          </div>

          {isExpanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 pt-3 border-t border-[#D2D2D7] dark:border-[#38383A]">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F5F5F7] dark:bg-[#2C2C2E] p-3 rounded-xl text-center">
                  <p className="text-2xl font-bold text-[#0071E3]">{reducedPercent}%</p>
                  <p className="text-xs text-[#86868B] mt-1">Reduced emissions</p>
                </div>
                <div className="bg-[#F5F5F7] dark:bg-[#2C2C2E] p-3 rounded-xl text-center">
                  <p className="text-2xl font-bold text-[#0071E3]">{100 - reducedPercent}%</p>
                  <p className="text-xs text-[#86868B] mt-1">Still improving</p>
                </div>
              </div>
              <p className="text-xs text-[#86868B] bg-[#F5F5F7] dark:bg-[#2C2C2E] p-3 rounded-xl italic">
                &quot;{reducedPercent}% of participants reduced their {challenge.category} emissions this month. You&apos;re in good company! 🌱&quot;
              </p>
            </motion.div>
          )}

          <div className="flex gap-2 pt-2">
            {isJoined ? (
              <>
                <Button onClick={onExpand} variant="secondary" className="flex-1">{isExpanded ? 'Close' : 'View Stats'} →</Button>
                <Button onClick={() => {}} className="flex-1">Log Activity</Button>
              </>
            ) : (
              <Button onClick={onJoin} className="w-full">Join Challenge</Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
