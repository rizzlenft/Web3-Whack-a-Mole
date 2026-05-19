import React, { useEffect, useRef, useState } from 'react';
import { MoleHole } from '@/components/MoleHole';
import { FlyingMole } from '@/components/FlyingMole';
import { MoleState, FlyingMoleEntry, GameRound } from '@/hooks/use-game-engine';
import { motion, AnimatePresence } from 'framer-motion';

interface GameScreenProps {
  score: number;
  timeLeft: number;
  moles: MoleState[];
  flyingMoles: FlyingMoleEntry[];
  onWhack: (id: number) => void;
  round: GameRound;
}

const ROUND_CONFIG: Record<GameRound, { label: string; color: string; bg: string; duration: number }> = {
  1: { label: 'ROUND 1',    color: 'text-primary',     bg: 'border-primary',     duration: 20 },
  2: { label: 'ROUND 2',    color: 'text-secondary',   bg: 'border-secondary',   duration: 20 },
  3: { label: '⚡ CHAOS ⚡', color: 'text-destructive', bg: 'border-destructive', duration: 10 },
};

const ROUND_SUBTITLES: Record<GameRound, string> = {
  1: 'BONK EM',
  2: 'THEY FLY',
  3: 'NO MERCY',
};

export function GameScreen({ score, timeLeft, moles, flyingMoles, onWhack, round }: GameScreenProps) {
  const [combo, setCombo] = useState(0);
  const [lastWhackTime, setLastWhackTime] = useState(0);
  const [prevScore, setPrevScore] = useState(score);
  const [scorePop, setScorePop] = useState(false);
  const [chaosFlash, setChaosFlash] = useState(false);

  const outerRef = useRef<HTMLDivElement>(null);
  const holeRefs = useRef<(HTMLDivElement | null)[]>(Array(8).fill(null));

  const isChaoMode = round === 3;
  const cfg = ROUND_CONFIG[round];
  const isCritical = timeLeft <= 5;
  const isWarning = timeLeft <= 10 && !isCritical;
  const timeColor = isCritical ? 'text-destructive' : isWarning ? 'text-yellow-400' : 'text-accent';
  const progressPercent = (timeLeft / cfg.duration) * 100;

  useEffect(() => {
    if (score !== prevScore) {
      setPrevScore(score);
      setScorePop(true);
      const t = setTimeout(() => setScorePop(false), 300);
      return () => clearTimeout(t);
    }
  }, [score, prevScore]);

  const handleWhack = (id: number) => {
    const now = Date.now();
    setCombo(c => now - lastWhackTime < 900 ? c + 1 : 1);
    setLastWhackTime(now);
    onWhack(id);
  };

  useEffect(() => {
    const t = setTimeout(() => setCombo(0), 1100);
    return () => clearTimeout(t);
  }, [combo, lastWhackTime]);

  useEffect(() => {
    if (!isChaoMode) return;
    const id = setInterval(() => setChaosFlash(f => !f), 350);
    return () => clearInterval(id);
  }, [isChaoMode]);

  const getHoleCenter = (holeId: number) => {
    const el = holeRefs.current[holeId];
    const outer = outerRef.current;
    if (!el || !outer) return { x: 0, y: 0 };
    const elRect = el.getBoundingClientRect();
    const outerRect = outer.getBoundingClientRect();
    return {
      x: elRect.left - outerRect.left + elRect.width / 2,
      y: elRect.top - outerRect.top + elRect.height / 2,
    };
  };

  const getFlySize = () => {
    const el = holeRefs.current[0];
    if (!el) return 48;
    return el.getBoundingClientRect().width * 0.8;
  };

  return (
    <div
      ref={outerRef}
      className={`w-full h-full min-h-[500px] flex flex-col game-bg relative overflow-hidden cursor-mallet select-none`}
    >
      {/* Chaos strobe */}
      {isChaoMode && (
        <div className={`absolute inset-0 pointer-events-none z-[60] transition-opacity duration-150 bg-destructive ${chaosFlash ? 'opacity-[0.07]' : 'opacity-0'}`} />
      )}

      {/* ── HUD ──────────────────────────────────────────────── */}
      <div className={`flex-shrink-0 border-b-4 ${cfg.bg} bg-black/80 backdrop-blur-sm px-3 py-2 z-20`}>
        <div className="flex items-center justify-between gap-2">

          {/* Score */}
          <div className="flex flex-col items-start min-w-[80px]">
            <span className="font-display text-[8px] text-secondary tracking-widest mb-0.5">SCORE</span>
            <motion.span
              key={score}
              animate={scorePop ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.25 }}
              className={`font-sans text-2xl md:text-3xl font-bold tracking-widest ${isChaoMode ? 'text-destructive' : 'text-primary'} text-shadow-neon`}
            >
              {score.toString().padStart(4, '0')}
            </motion.span>
          </div>

          {/* Centre: round + combo */}
          <div className="flex flex-col items-center flex-1">
            <div className={`font-display text-[9px] md:text-xs ${cfg.color} tracking-widest`}>
              {cfg.label}
            </div>
            <div className={`font-display text-[7px] ${cfg.color} opacity-70 tracking-widest`}>
              {ROUND_SUBTITLES[round]}
            </div>
            <AnimatePresence>
              {combo > 1 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, y: 4 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="font-display text-[8px] text-accent text-shadow-green mt-0.5 whitespace-nowrap"
                >
                  ×{combo} COMBO!
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Timer */}
          <div className="flex flex-col items-end min-w-[80px]">
            <span className="font-display text-[8px] text-secondary tracking-widest mb-0.5">TIME</span>
            <motion.span
              key={timeLeft}
              animate={isCritical ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.4 }}
              className={`font-sans text-2xl md:text-3xl font-bold tracking-widest ${timeColor} drop-shadow-[0_0_8px_currentColor] ${isCritical ? 'animate-pulse' : ''}`}
            >
              {timeLeft.toString().padStart(2, '0')}
            </motion.span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-1.5 w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${isCritical ? 'bg-destructive' : isWarning ? 'bg-yellow-400' : 'bg-accent'}`}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.95, ease: 'linear' }}
          />
        </div>
      </div>

      {/* ── Mole Grid ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center z-10 px-2 py-2">
        <div className="grid grid-cols-4 gap-1 sm:gap-3 md:gap-5 w-full max-w-2xl">
          {moles.map((mole, i) => (
            <div key={mole.id} ref={el => { holeRefs.current[i] = el; }}>
              <MoleHole mole={mole} onWhack={handleWhack} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Flying moles (full-screen overlay) ────────────────── */}
      {flyingMoles.map(fly => {
        const src = getHoleCenter(fly.fromHole);
        const dst = getHoleCenter(fly.toHole);
        return (
          <FlyingMole
            key={fly.id}
            entry={fly}
            srcX={src.x} srcY={src.y}
            dstX={dst.x} dstY={dst.y}
            size={getFlySize()}
          />
        );
      })}
    </div>
  );
}
