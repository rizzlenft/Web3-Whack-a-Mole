import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playCountdownBeep } from '@/hooks/use-sound';

interface CountdownScreenProps {
  onDone: () => void;
}

export function CountdownScreen({ onDone }: CountdownScreenProps) {
  const [count, setCount] = useState<number | 'GO!'>(3);

  useEffect(() => {
    // Play first beep immediately
    playCountdownBeep(false);

    const ticks = [
      setTimeout(() => { setCount(2); playCountdownBeep(false); }, 1000),
      setTimeout(() => { setCount(1); playCountdownBeep(false); }, 2000),
      setTimeout(() => { setCount('GO!'); playCountdownBeep(true); }, 3000),
      setTimeout(() => { onDone(); }, 3500),
    ];
    return () => ticks.forEach(clearTimeout);
  }, [onDone]);

  const isGo = count === 'GO!';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center game-bg relative overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/15 to-transparent pointer-events-none" />

      <div className="flex flex-col items-center gap-4 z-10">
        <p className="font-display text-xs text-secondary tracking-widest animate-pulse">
          GET READY TO BONK
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={String(count)}
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.1, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`font-display leading-none ${isGo ? 'text-accent text-7xl md:text-9xl' : 'text-primary text-8xl md:text-[10rem]'}`}
            style={{
              textShadow: isGo
                ? '0 0 15px hsl(140,100%,55%), 0 0 40px hsl(140,100%,55%)'
                : '0 0 15px hsl(315,100%,60%), 0 0 40px hsl(315,100%,60%)',
            }}
          >
            {count}
          </motion.div>
        </AnimatePresence>

        {isGo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl"
          >
            🐀💥🐀
          </motion.div>
        )}
      </div>
    </div>
  );
}
