import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameRound } from '@/hooks/use-game-engine';
import { playCountdownBeep, playRoundStart } from '@/hooks/use-sound';

const INFO: Record<GameRound, {
  label: string; emoji: string; desc: string;
  textCls: string; glowStyle: React.CSSProperties;
  bgGlow: string; hint: string;
}> = {
  1: {
    label: 'ROUND 1', emoji: '🐀', desc: 'BONK THE SCAMMERS',
    textCls: 'text-primary',
    glowStyle: { textShadow: '0 0 10px hsl(315,100%,60%), 0 0 35px hsl(315,100%,60%), 0 0 70px hsl(315,100%,60%,0.4)' },
    bgGlow: 'from-primary/15',
    hint: '🐀 Moles pop up — click fast before they duck back down! 👑 Gold = +5 | 💀 Skull = -1',
  },
  2: {
    label: 'ROUND 2', emoji: '🌀', desc: 'THEY FLY NOW',
    textCls: 'text-secondary',
    glowStyle: { textShadow: '0 0 10px hsl(185,100%,50%), 0 0 35px hsl(185,100%,50%), 0 0 70px hsl(185,100%,50%,0.4)' },
    bgGlow: 'from-secondary/15',
    hint: '🌀 Moles pop up, then LAUNCH through the air — hit them at takeoff for easy points!',
  },
  3: {
    label: '⚡ CHAOS ⚡', emoji: '💀', desc: 'TOTAL RUG PULL',
    textCls: 'text-destructive',
    glowStyle: { textShadow: '0 0 10px hsl(0,100%,60%), 0 0 35px hsl(0,100%,60%), 0 0 70px hsl(0,100%,60%,0.4)' },
    bgGlow: 'from-destructive/20',
    hint: '💀 Both mechanics — FULL SPEED. No mercy. Down only. This is your last 10 seconds.',
  },
};

interface RoundTransitionScreenProps {
  nextRound: GameRound;
}

export function RoundTransitionScreen({ nextRound }: RoundTransitionScreenProps) {
  const [countdown, setCountdown] = useState(3);
  const info = INFO[nextRound];

  useEffect(() => {
    // Beep on first render
    playCountdownBeep(false);

    const t = setInterval(() => {
      setCountdown(c => {
        const next = Math.max(0, c - 1);
        if (next === 0) {
          playRoundStart();
        } else {
          playCountdownBeep(false);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden game-bg">

      {/* Radial background glow */}
      <div className={`absolute inset-0 bg-gradient-radial ${info.bgGlow} to-transparent pointer-events-none`} />

      {/* Chaos pulsing border */}
      {nextRound === 3 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ border: '8px solid transparent' }}
          animate={{ borderColor: ['rgba(255,0,0,0)', 'rgba(255,0,0,0.4)', 'rgba(255,0,0,0)'] }}
          transition={{ repeat: Infinity, duration: 0.55 }}
        />
      )}

      {/* Scanlines overlay */}
      <div className="scanlines" />

      <motion.div
        initial={{ scale: 0.1, opacity: 0, y: 60 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.55 }}
        className="flex flex-col items-center gap-4 z-10 w-full max-w-sm px-6 text-center"
      >
        {/* Emoji */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -16, 16, 0] }}
          transition={{ repeat: Infinity, duration: 0.85 }}
          className="text-6xl md:text-7xl leading-none"
        >
          {info.emoji}
        </motion.div>

        {/* Label + desc */}
        <div>
          <div
            className={`font-display text-3xl md:text-5xl ${info.textCls} leading-none`}
            style={info.glowStyle}
          >
            {info.label}
          </div>
          <div className={`font-display text-sm md:text-lg ${info.textCls} opacity-80 mt-2 tracking-widest`}>
            {info.desc}
          </div>
        </div>

        {/* Countdown */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-display text-[9px] text-zinc-500 tracking-widest">
            {countdown > 0 ? 'GET READY IN' : 'GO GO GO!!!'}
          </span>
          <AnimatePresence mode="wait">
            <motion.div
              key={countdown}
              initial={{ scale: 2.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.05, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className={`font-display leading-none ${
                countdown === 0
                  ? `text-accent text-7xl md:text-8xl`
                  : `text-8xl md:text-9xl ${info.textCls}`
              }`}
              style={countdown === 0
                ? { textShadow: '0 0 15px hsl(140,100%,55%), 0 0 40px hsl(140,100%,55%)' }
                : info.glowStyle
              }
            >
              {countdown > 0 ? countdown : 'GO!'}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hint */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full bg-black/65 border border-zinc-700/80 rounded px-4 py-2.5"
        >
          <p className="font-sans text-sm md:text-base text-zinc-200 leading-snug">
            {info.hint}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
