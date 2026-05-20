import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playCountdownBeep } from '@/hooks/use-sound';

interface CountdownScreenProps {
  onDone: () => void;
}

const FLOATING = ['🐀','📉','💀','🪙','💸','🚨','📊','💎'];

export function CountdownScreen({ onDone }: CountdownScreenProps) {
  const [count, setCount] = useState<number | 'GO!'>(3);

  useEffect(() => {
    playCountdownBeep(false);

    const ticks = [
      setTimeout(() => { setCount(2); playCountdownBeep(false); }, 1000),
      setTimeout(() => { setCount(1); playCountdownBeep(false); }, 2000),
      setTimeout(() => { setCount('GO!'); playCountdownBeep(true); }, 3000),
      setTimeout(() => { onDone(); }, 3600),
    ];
    return () => ticks.forEach(clearTimeout);
  }, [onDone]);

  const isGo = count === 'GO!';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center game-bg relative overflow-hidden">

      {/* Animated floating emojis in background */}
      {FLOATING.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl opacity-20 pointer-events-none select-none"
          style={{ left: `${10 + (i * 11.5) % 85}%`, top: `${8 + (i * 17) % 78}%` }}
          animate={{ y: [-8, 8, -8], rotate: [-10, 10, -10], opacity: [0.12, 0.28, 0.12] }}
          transition={{ repeat: Infinity, duration: 2.2 + i * 0.3, delay: i * 0.25 }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Radial glow that pulses on each count */}
      <AnimatePresence>
        <motion.div
          key={String(count)}
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
          style={{
            background: isGo
              ? 'radial-gradient(circle at center, hsl(140,100%,55%,0.2) 0%, transparent 65%)'
              : 'radial-gradient(circle at center, hsl(315,100%,60%,0.2) 0%, transparent 65%)',
          }}
        />
      </AnimatePresence>

      <div className="flex flex-col items-center gap-5 z-10">

        {/* Label */}
        <motion.p
          animate={{ opacity: isGo ? 0 : 1 }}
          className="font-display text-[10px] text-secondary tracking-widest"
          style={{ textShadow: '0 0 8px hsl(185,100%,50%)' }}
        >
          GET READY TO BONK
        </motion.p>

        {/* Main number */}
        <AnimatePresence mode="wait">
          <motion.div
            key={String(count)}
            initial={{ scale: 3.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.05, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`font-display leading-none ${
              isGo
                ? 'text-accent text-[8rem] md:text-[10rem]'
                : 'text-primary text-[9rem] md:text-[11rem]'
            }`}
            style={{
              textShadow: isGo
                ? '0 0 20px hsl(140,100%,55%), 0 0 55px hsl(140,100%,55%)'
                : '0 0 20px hsl(315,100%,60%), 0 0 55px hsl(315,100%,60%)',
            }}
          >
            {count}
          </motion.div>
        </AnimatePresence>

        {/* GO! burst */}
        <AnimatePresence>
          {isGo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', bounce: 0.6 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-5xl">🐀💥🐀</span>
              <span
                className="font-display text-[10px] text-accent tracking-widest animate-pulse"
                style={{ textShadow: '0 0 8px hsl(140,100%,55%)' }}
              >
                BONK THE SCAMMERS!
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
