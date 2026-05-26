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
  'REKT SER', 'DOWN BAD', 'GM NEVER', 'COPE', 'WAGMI NOT',
];

const GOLDEN_PHRASES = ['5× GOLD!', 'CHAD!', 'ALPHA!', 'MOONING!', 'LFG!!!'];
const SKULL_PHRASES  = ['-1 REKT', 'HACKED!', 'RUG PULL', 'OH NO SER'];

const PFP_IMAGES = [
  'placeholder-pfp.png',
  'pfp-2.png',
  'pfp-3.png',
  'pfp-4.png',
  'pfp-5.png',
  'pfp-6.png',
  'pfp-7.png',
];

function getRandomPhrase(phrases: string[]) {
  return phrases[Math.floor(Math.random() * phrases.length)];
}

interface MoleHoleProps {
  mole: MoleState;
  onWhack: (id: number) => void;
}

export function MoleHole({ mole, onWhack }: MoleHoleProps) {
  const pfpFile = PFP_IMAGES[mole.pfp % PFP_IMAGES.length] ?? PFP_IMAGES[0];
  const pfpSrc  = `${import.meta.env.BASE_URL}${pfpFile}`;

  const phrasePool = mole.moleType === 'golden' ? GOLDEN_PHRASES
    : mole.moleType === 'skull' ? SKULL_PHRASES
    : DEGEN_PHRASES;

  const phrase = React.useRef(getRandomPhrase(phrasePool));

  React.useEffect(() => {
    if (!mole.active) {
      phrase.current = getRandomPhrase(
        mole.moleType === 'golden' ? GOLDEN_PHRASES
        : mole.moleType === 'skull' ? SKULL_PHRASES
        : DEGEN_PHRASES
      );
    }
  }, [mole.active, mole.moleType]);

  const visible = mole.active && !mole.whacked;

  const isGolden = mole.moleType === 'golden';
  const isSkull  = mole.moleType === 'skull';

  const borderCls = visible
    ? isGolden ? 'border-yellow-400 shadow-[0_0_28px_rgba(251,191,36,1),0_0_8px_rgba(251,191,36,0.6)]'
    : isSkull  ? 'border-destructive shadow-[0_0_24px_rgba(255,0,0,0.9)]'
    : 'border-primary neon-border-pulse shadow-[0_0_24px_rgba(255,0,255,0.9)]'
    : 'border-zinc-800';

  const phraseColor = isGolden ? 'text-yellow-300' : isSkull ? 'text-destructive' : 'text-yellow-300';

  return (
    <div className="relative w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto select-none mt-3">

      {/* ── Hole pit ─────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 w-full h-[60%] z-0 rounded-full overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.9)]">
        <img src="/images/dirt-mound.png" alt="" className="w-full h-full object-cover scale-150" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_60%,_rgba(0,0,0,0.95)_28%,_transparent_70%)]" />
      </div>

      {/* Golden shimmer ring around hole */}
      {isGolden && visible && (
        <motion.div
          className="absolute bottom-[5%] left-[5%] w-[90%] h-[55%] rounded-full pointer-events-none z-[1]"
          animate={{ boxShadow: ['0 0 12px rgba(251,191,36,0.6)', '0 0 30px rgba(251,191,36,0.9)', '0 0 12px rgba(251,191,36,0.6)'] }}
          transition={{ repeat: Infinity, duration: 0.7 }}
        />
      )}

      {/* Idle ambient glow */}
      <AnimatePresence>
        {!mole.active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-[12%] left-[20%] w-[60%] h-[22%] bg-primary/30 rounded-full blur-md z-0 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* ── Mole rising ──────────────────────────────────── */}
      <div className="absolute bottom-[18%] left-[8%] w-[84%] h-[115%] overflow-hidden z-10 pointer-events-none">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: visible ? '0%' : '100%', scale: mole.whacked ? 0.75 : 1 }}
          transition={{ type: 'spring', stiffness: 440, damping: 28, mass: 1.3 }}
          className="w-full h-full flex items-end justify-center"
        >
          {visible && <div className="absolute bottom-0 w-3/4 h-3 bg-black/70 rounded-full blur-sm" />}

          {/* PFP circle */}
          <div className={cn(
            "w-[88%] aspect-square rounded-full border-4 overflow-hidden bg-zinc-950 relative pointer-events-auto transition-all",
            borderCls,
            mole.whacked ? "brightness-40 shadow-none" : ""
          )}>
            {/* Golden overlay */}
            {isGolden && visible && (
              <motion.div
                className="absolute inset-0 z-10 pointer-events-none rounded-full"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)' }}
              />
            )}
            {/* Skull overlay */}
            {isSkull && visible && (
              <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center text-2xl md:text-3xl opacity-70">
                💀
              </div>
            )}

            <img
              src={pfpSrc}
              alt="Scammer PFP"
              className={cn("w-full h-full object-cover pointer-events-none", isSkull ? "hue-rotate-180 grayscale" : "")}
              draggable={false}
            />

            {/* Whack red flash */}
            <AnimatePresence>
              {mole.whacked && (
                <motion.div
                  initial={{ opacity: 0.85 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="absolute inset-0 bg-red-600 z-20 pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* Explosion burst */}
            <AnimatePresence>
              {mole.whacked && (
                <motion.div
                  initial={{ scale: 0.3, opacity: 1 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.32 }}
                  className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none text-2xl md:text-3xl"
                >
                  {isGolden ? '✨' : isSkull ? '☠️' : '💥'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Golden crown badge */}
      {isGolden && visible && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [-5, 5, -5] }}
          transition={{ rotate: { repeat: Infinity, duration: 0.6 } }}
          className="absolute top-[-8%] left-1/2 -translate-x-1/2 z-30 text-base md:text-xl pointer-events-none"
        >
          👑
        </motion.div>
      )}

      {/* Front dirt lip */}
      <div className="absolute bottom-[-8%] left-[-4%] w-[108%] h-[38%] bg-[url('/images/dirt-mound.png')] bg-cover bg-bottom rounded-t-[100%] rounded-b-[100%] z-20 pointer-events-none opacity-90 shadow-[0_-4px_12px_rgba(0,0,0,0.9)]" />

      {/* Dirt burst on pop */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0.8, scale: 0.6 }}
            animate={{ opacity: 0, scale: 1.6 }}
            transition={{ duration: 0.28 }}
            className="absolute bottom-[8%] left-[10%] w-[80%] h-[45%] bg-[radial-gradient(circle,_#8B4513_10%,_transparent_65%)] z-20 pointer-events-none blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Hit phrase */}
      <AnimatePresence>
        {mole.whacked && (
          <motion.div
            initial={{ scale: 0.2, opacity: 0, y: 10, rotate: -22 }}
            animate={{ scale: 1.3, opacity: 1, y: -52, rotate: 8 }}
            exit={{ scale: 1.9, opacity: 0, y: -95 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="absolute top-[-10%] left-[-15%] w-[130%] flex items-center justify-center z-40 pointer-events-none"
          >
            <span
              className={`font-display text-sm md:text-xl ${phraseColor} uppercase tracking-tight text-center leading-none drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]`}
              style={{
                textShadow: isGolden
                  ? '2px 2px 0 #000, 0 0 12px #fbbf24'
                  : isSkull
                  ? '2px 2px 0 #000, 0 0 12px hsl(0,100%,60%)'
                  : '2px 2px 0 #000, 0 0 10px hsl(315,100%,60%)',
              }}
            >
              {phrase.current}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click target */}
      <button
        className={cn(
          "absolute inset-0 z-30 w-full h-full rounded-full outline-none touch-manipulation",
          visible ? "cursor-mallet" : "cursor-default"
        )}
        onClick={() => onWhack(mole.id)}
        disabled={!mole.active || mole.whacked}
        aria-label="Whack mole"
      />
    </div>
  );
}
