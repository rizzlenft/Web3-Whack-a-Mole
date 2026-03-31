import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoleState } from '@/hooks/use-game-engine';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEGEN_PHRASES = [
  'REKT!', 'RUGGED!', 'NGMI!', 'GG SER', 'DUMPED!',
  'EXIT SCAM', 'LIQUIDATED', 'PONZI!', 'HACKED!', 'PAPER HANDS',
  'SEND IT!', 'RIP BAGS', 'DOWN ONLY', 'SCAMMER!', 'GONNA ZERO',
];

function getRandomPhrase() {
  return DEGEN_PHRASES[Math.floor(Math.random() * DEGEN_PHRASES.length)];
}

const PFP_IMAGES = ['placeholder-pfp.png', 'pfp-2.png'];

interface MoleHoleProps {
  mole: MoleState;
  onWhack: (id: number) => void;
}

export function MoleHole({ mole, onWhack }: MoleHoleProps) {
  const pfpFile = PFP_IMAGES[mole.pfp % PFP_IMAGES.length] ?? PFP_IMAGES[0];
  const pfpSrc = `${import.meta.env.BASE_URL}${pfpFile}`;
  const currentPhrase = React.useRef(getRandomPhrase());

  React.useEffect(() => {
    if (!mole.active) {
      currentPhrase.current = getRandomPhrase();
    }
  }, [mole.active]);

  // The in-hole mole is visible only when active and NOT jumping
  const moleIsVisible = mole.active && !mole.whacked && !mole.jumping;

  return (
    <div className="relative w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto select-none mt-4">

      {/* Dirt hole background */}
      <div className="absolute bottom-0 left-0 w-full h-[60%] z-0 rounded-full overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.8)] opacity-90 border-b-4 border-zinc-900">
        <img src="/images/dirt-mound.png" alt="Dirt Hole" className="w-full h-full object-cover scale-150" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.9)_20%,_transparent_70%)]" />
      </div>

      {/* Idle indicator */}
      <AnimatePresence>
        {!mole.active && !mole.whacked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-[20%] left-1/2 -translate-x-1/2 text-zinc-500 font-display text-sm animate-pulse z-0"
          >
            ?
          </motion.div>
        )}
      </AnimatePresence>

      {/* The mole in the hole — hidden when jumping (separate jump element handles that) */}
      <div className="absolute bottom-[20%] left-[10%] w-[80%] h-[120%] overflow-hidden z-10 pointer-events-none">
        <motion.div
          initial={{ y: '100%' }}
          animate={{
            y: moleIsVisible ? '0%' : '100%',
            scale: mole.whacked ? 0.8 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
            mass: 1.5,
          }}
          className="w-full h-full relative flex items-end justify-center"
        >
          {moleIsVisible && (
            <div className="absolute bottom-0 w-3/4 h-4 bg-black/60 rounded-full blur-sm -z-10" />
          )}

          <div className={cn(
            "w-[90%] aspect-square rounded-full border-4 shadow-[0_0_20px_rgba(255,0,0,0.8)] overflow-hidden bg-background relative pointer-events-auto",
            moleIsVisible ? "border-destructive animate-[pulse_0.5s_infinite]" : "border-primary",
            mole.whacked ? "brightness-50 contrast-150 sepia grayscale border-zinc-700 shadow-none" : ""
          )}>
            <img
              src={pfpSrc}
              alt="Scammer PFP"
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
            />
            <AnimatePresence>
              {mole.whacked && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-red-500 z-20 pointer-events-none mix-blend-overlay"
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ── JUMP FLIGHT ELEMENT ──────────────────────────────────────────
          Rendered OUTSIDE the overflow-hidden container so the mole can
          visually fly up and out of the hole during a hop animation.      */}
      <AnimatePresence>
        {mole.jumping && !mole.whacked && (
          <motion.div
            className="absolute bottom-[40%] left-[10%] w-[80%] z-40 pointer-events-none"
            initial={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
            animate={{ y: '-220%', scale: 0.45, rotate: 30, opacity: 0 }}
            exit={{}}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <div className="w-[90%] mx-auto aspect-square rounded-full border-4 border-primary overflow-hidden shadow-[0_0_14px_rgba(255,0,255,0.6)]">
              <img
                src={pfpSrc}
                alt="Jumping scammer"
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Front lip of hole for 3D effect */}
      <div className="absolute bottom-[-10%] left-[-5%] w-[110%] h-[40%] bg-[url('/images/dirt-mound.png')] bg-cover bg-bottom rounded-t-[100%] rounded-b-[100%] z-20 pointer-events-none opacity-90 shadow-[0_-5px_15px_rgba(0,0,0,0.8)]" />

      {/* Particle burst on pop-up */}
      <AnimatePresence>
        {mole.active && !mole.whacked && !mole.jumping && (
          <motion.div
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-[10%] left-[10%] w-[80%] h-[50%] bg-[radial-gradient(circle,_#8B4513_10%,_transparent_60%)] z-20 pointer-events-none blur-sm"
          />
        )}
      </AnimatePresence>

      {/* BONK hit phrase */}
      <AnimatePresence>
        {mole.whacked && (
          <motion.div
            initial={{ scale: 0.1, opacity: 0, y: 20, rotate: -30 }}
            animate={{ scale: [1.5, 1.2], opacity: 1, y: -60, rotate: [15, 10] }}
            exit={{ scale: 2, opacity: 0, y: -100 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="absolute top-[-20%] left-0 w-full h-full flex items-center justify-center z-40 pointer-events-none"
          >
            <span className="font-display text-2xl md:text-3xl text-yellow-300 text-shadow-neon uppercase tracking-tighter transform -skew-y-6 text-center leading-tight drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
              {currentPhrase.current}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click target — covers the whole hole area */}
      <button
        className={cn(
          "absolute inset-0 z-30 w-full h-full rounded-full outline-none touch-manipulation",
          mole.active && !mole.whacked ? "cursor-mallet" : "cursor-default"
        )}
        onClick={() => onWhack(mole.id)}
        disabled={!mole.active || mole.whacked}
        aria-label="Whack mole"
      />
    </div>
  );
}
