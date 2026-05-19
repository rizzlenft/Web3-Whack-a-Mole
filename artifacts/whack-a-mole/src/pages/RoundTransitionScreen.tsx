import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameRound } from '@/hooks/use-game-engine';

const INFO: Record<GameRound, {
  label: string; emoji: string; desc: string;
  textCls: string; glowStyle: React.CSSProperties;
  bgGlow: string; hint: string;
}> = {
  1: {
    label: 'ROUND 1', emoji: '🐀', desc: 'BONK THE SCAMMERS',
    textCls: 'text-primary',
    glowStyle: { textShadow: '0 0 10px hsl(315,100%,60%), 0 0 30px hsl(315,100%,60%), 0 0 60px hsl(315,100%,60%,0.5)' },
    bgGlow: 'from-primary/10',
    hint: '🐀 Moles pop up and wait — click fast before they duck back down!',
  },
  2: {
    label: 'ROUND 2', emoji: '🌀', desc: 'THEY FLY NOW',
    textCls: 'text-secondary',
    glowStyle: { textShadow: '0 0 10px hsl(185,100%,50%), 0 0 30px hsl(185,100%,50%), 0 0 60px hsl(185,100%,50%,0.5)' },
    bgGlow: 'from-secondary/10',
    hint: '🌀 Moles pop up, then launch through the air — catch them at takeoff!',
  },
  3: {
    label: '⚡ CHAOS ⚡', emoji: '💀', desc: 'TOTAL RUG PULL',
    textCls: 'text-destructive',
    glowStyle: { textShadow: '0 0 10px hsl(0,100%,60%), 0 0 30px hsl(0,100%,60%), 0 0 60px hsl(0,100%,60%,0.5)' },
    bgGlow: 'from-destructive/20',
    hint: '💀 Both mechanics at full speed. No mercy. Down only.',
  },
};

interface RoundTransitionScreenProps {
  nextRound: GameRound;
}

export function RoundTransitionScreen({ nextRound }: RoundTransitionScreenProps) {
  const [countdown, setCountdown] = useState(3);
  const info = INFO[nextRound];

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden game-bg">

      {/* Radial background glow */}
      <div className={`absolute inset-0 bg-gradient-radial ${info.bgGlow} to-transparent pointer-events-none`} />

      {/* Chaos pulsing border */}
      {nextRound === 3 && (
        <motion.div
          className="absolute inset-0 border-8 border-destructive/0 pointer-events-none"
          animate={{ borderColor: ['rgba(255,0,0,0)', 'rgba(255,0,0,0.3)', 'rgba(255,0,0,0)'] }}
          transition={{ repeat: Infinity, duration: 0.7 }}
        />
      )}

      <motion.div
        initial={{ scale: 0.15, opacity: 0, y: 60 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.48, duration: 0.6 }}
        className="flex flex-col items-center gap-4 z-10 w-full max-w-sm px-6 text-center"
      >
        {/* Emoji */}
        <motion.div
          animate={{ scale: [1, 1.28, 1], rotate: [0, -14, 14, 0] }}
          transition={{ repeat: Infinity, duration: 1.0 }}
          className="text-6xl md:text-7xl leading-none"
        >
          {info.emoji}
        </motion.div>

        {/* Label + desc */}
        <div>
          <div className={`font-display text-3xl md:text-5xl ${info.textCls} leading-none`} style={info.glowStyle}>
            {info.label}
          </div>
          <div className={`font-display text-sm md:text-xl ${info.textCls} opacity-75 mt-2 tracking-widest`}>
            {info.desc}
          </div>
        </div>

        {/* Countdown */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-display text-[9px] text-zinc-500 tracking-widest">GET READY IN</span>
          <AnimatePresence mode="wait">
            <motion.div
              key={countdown}
              initial={{ scale: 2.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.1, opacity: 0 }}
              transition={{ duration: 0.26 }}
              className={`font-display text-8xl md:text-9xl ${info.textCls} leading-none`}
              style={info.glowStyle}
            >
              {countdown > 0 ? countdown : 'GO!'}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hint */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full bg-black/60 border border-zinc-700 rounded px-4 py-2.5"
        >
          <p className="font-sans text-sm md:text-base text-zinc-300 leading-snug">
            {info.hint}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
