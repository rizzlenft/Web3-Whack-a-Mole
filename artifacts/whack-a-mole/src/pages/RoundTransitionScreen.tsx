import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameRound } from '@/hooks/use-game-engine';

const ROUND_INFO: Record<GameRound, { label: string; emoji: string; desc: string; color: string }> = {
  1: { label: 'ROUND 1', emoji: '🐀', desc: 'BONK THE SCAMMERS', color: 'text-primary' },
  2: { label: 'ROUND 2', emoji: '🏃', desc: 'THEY\'RE HOPPING — POPUP + JUMP MODE', color: 'text-secondary' },
  3: { label: 'ROUND 3', emoji: '💀', desc: '⚡ CHAOS MODE — TOTAL RUG PULL ⚡', color: 'text-destructive' },
};

interface RoundTransitionScreenProps {
  nextRound: GameRound;
}

export function RoundTransitionScreen({ nextRound }: RoundTransitionScreenProps) {
  const [countdown, setCountdown] = useState(3);
  const info = ROUND_INFO[nextRound];

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`w-full h-full min-h-[500px] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden ${nextRound === 3 ? 'animate-pulse' : ''}`}>
      {/* Background flash for chaos */}
      {nextRound === 3 && (
        <div className="absolute inset-0 bg-destructive/10 animate-pulse pointer-events-none" />
      )}

      <motion.div
        initial={{ scale: 0.3, opacity: 0, y: 60 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-7xl mb-2"
        >
          {info.emoji}
        </motion.div>

        <div className={`font-display text-5xl md:text-7xl text-shadow-neon ${info.color}`}>
          {info.label}
        </div>
        <div className="font-sans text-xl md:text-2xl text-white/80 uppercase tracking-widest max-w-sm">
          {info.desc}
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="font-display text-secondary text-base uppercase tracking-widest">
            GET READY IN
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`font-display text-6xl md:text-8xl text-shadow-neon ${info.color}`}
            >
              {countdown > 0 ? countdown : 'GO!'}
            </motion.div>
          </AnimatePresence>
        </div>

        {nextRound === 2 && (
          <div className="mt-4 font-display text-sm text-secondary/70 uppercase tracking-wider border border-secondary/30 px-4 py-2 rounded">
            📉 Some moles will JUMP between holes — watch for the arc
          </div>
        )}
        {nextRound === 3 && (
          <div className="mt-4 font-display text-sm text-destructive/80 uppercase tracking-wider border border-destructive/40 px-4 py-2 rounded animate-pulse">
            💀 Everything at once. No mercy. Down only.
          </div>
        )}
      </motion.div>
    </div>
  );
}
