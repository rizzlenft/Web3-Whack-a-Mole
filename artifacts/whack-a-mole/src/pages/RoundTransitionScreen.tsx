import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameRound } from '@/hooks/use-game-engine';

const ROUND_INFO: Record<GameRound, {
  label: string; emoji: string; desc: string;
  color: string; glow: string; bgAccent: string; hint: string;
}> = {
  1: {
    label: 'ROUND 1', emoji: '🐀', desc: 'BONK THE SCAMMERS',
    color: 'text-primary', glow: 'text-shadow-neon',
    bgAccent: 'bg-primary/5 border-primary/20',
    hint: '🐀 Moles pop up and wait — click fast before they duck!',
  },
  2: {
    label: 'ROUND 2', emoji: '🌀', desc: 'THEY FLY NOW',
    color: 'text-secondary', glow: 'text-shadow-cyan',
    bgAccent: 'bg-secondary/5 border-secondary/20',
    hint: '🌀 Moles launch through the air between holes — catch them at takeoff!',
  },
  3: {
    label: 'ROUND 3', emoji: '💀', desc: '⚡ TOTAL CHAOS ⚡',
    color: 'text-destructive', glow: 'text-shadow-red',
    bgAccent: 'bg-destructive/10 border-destructive/30',
    hint: '💀 Both mechanics at max speed. No mercy. Down only.',
  },
};

interface RoundTransitionScreenProps {
  nextRound: GameRound;
}

export function RoundTransitionScreen({ nextRound }: RoundTransitionScreenProps) {
  const [countdown, setCountdown] = useState(3);
  const info = ROUND_INFO[nextRound];

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`w-full h-full min-h-[500px] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden game-bg`}>

      {/* Background pulse for chaos */}
      {nextRound === 3 && (
        <>
          <motion.div
            className="absolute inset-0 bg-destructive/10 pointer-events-none"
            animate={{ opacity: [0.05, 0.2, 0.05] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
          <div className="absolute inset-0 border-8 border-destructive/20 pointer-events-none" />
        </>
      )}

      <motion.div
        initial={{ scale: 0.2, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.65 }}
        className="flex flex-col items-center gap-5 z-10 w-full max-w-sm"
      >
        {/* Emoji */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], rotate: [0, -12, 12, 0] }}
          transition={{ repeat: Infinity, duration: 1.1 }}
          className="text-6xl md:text-7xl"
        >
          {info.emoji}
        </motion.div>

        {/* Round label */}
        <div>
          <div className={`font-display text-4xl md:text-6xl ${info.color} ${info.glow} leading-tight`}>
            {info.label}
          </div>
          <div className={`font-display text-lg md:text-2xl ${info.color} opacity-80 mt-2 tracking-widest`}>
            {info.desc}
          </div>
        </div>

        {/* Countdown */}
        <div className="flex flex-col items-center gap-1 mt-2">
          <span className="font-display text-xs text-zinc-400 tracking-widest">GET READY IN</span>
          <AnimatePresence mode="wait">
            <motion.div
              key={countdown}
              initial={{ scale: 2.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.2, opacity: 0 }}
              transition={{ duration: 0.28 }}
              className={`font-display text-7xl md:text-8xl ${info.color} ${info.glow}`}
            >
              {countdown > 0 ? countdown : 'GO!'}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hint badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`w-full border ${info.bgAccent} rounded px-4 py-3`}
        >
          <p className={`font-sans text-base ${info.color} opacity-80 leading-snug`}>
            {info.hint}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
