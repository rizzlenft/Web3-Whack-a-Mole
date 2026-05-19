import React, { useCallback, useEffect, useRef, useState } from 'react';
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

const ROUND_CONFIG: Record<GameRound, { label: string; sub: string; color: string; border: string; duration: number }> = {
  1: { label: 'ROUND 1', sub: 'BONK EM',   color: 'text-primary',     border: 'border-primary',     duration: 20 },
  2: { label: 'ROUND 2', sub: 'THEY FLY',  color: 'text-secondary',   border: 'border-secondary',   duration: 20 },
  3: { label: '⚡ CHAOS', sub: 'NO MERCY',  color: 'text-destructive', border: 'border-destructive', duration: 10 },
};

export function GameScreen({ score, timeLeft, moles, flyingMoles, onWhack, round }: GameScreenProps) {
  const [combo, setCombo]             = useState(0);
  const [lastWhackTime, setLWT]       = useState(0);
  const [prevScore, setPrevScore]     = useState(score);
  const [scorePop, setScorePop]       = useState(false);
  const [whackFlash, setWhackFlash]   = useState(false);
  const [chaosFlash, setChaosFlash]   = useState(false);

  const outerRef  = useRef<HTMLDivElement>(null);
  const holeRefs  = useRef<(HTMLDivElement | null)[]>(Array(8).fill(null));

  const cfg        = ROUND_CONFIG[round];
  const isChaos    = round === 3;
  const isCritical = timeLeft <= 5;
  const isWarning  = timeLeft <= 10 && !isCritical;
  const timeCls    = isCritical ? 'text-destructive' : isWarning ? 'text-yellow-400' : 'text-accent';
  const pct        = Math.max(0, (timeLeft / cfg.duration) * 100);
  const barCls     = isCritical ? 'bg-destructive' : isWarning ? 'bg-yellow-400' : 'bg-accent';

  // Score pop
  useEffect(() => {
    if (score === prevScore) return;
    setPrevScore(score);
    setScorePop(true);
    const t = setTimeout(() => setScorePop(false), 280);
    return () => clearTimeout(t);
  }, [score, prevScore]);

  // Combo reset
  useEffect(() => {
    const t = setTimeout(() => setCombo(0), 1100);
    return () => clearTimeout(t);
  }, [combo, lastWhackTime]);

  // Chaos strobe
  useEffect(() => {
    if (!isChaos) return;
    const id = setInterval(() => setChaosFlash(f => !f), 340);
    return () => clearInterval(id);
  }, [isChaos]);

  const handleWhack = useCallback((id: number) => {
    const now = Date.now();
    setCombo(c => now - lastWhackTime < 900 ? c + 1 : 1);
    setLWT(now);
    setWhackFlash(true);
    setTimeout(() => setWhackFlash(false), 80);
    onWhack(id);
  }, [lastWhackTime, onWhack]);

  const getHoleCenter = (holeId: number) => {
    const el = holeRefs.current[holeId];
    const outer = outerRef.current;
    if (!el || !outer) return { x: 0, y: 0 };
    const er = el.getBoundingClientRect();
    const or = outer.getBoundingClientRect();
    return { x: er.left - or.left + er.width / 2, y: er.top - or.top + er.height / 2 };
  };

  const getFlySize = () => {
    const el = holeRefs.current[0];
    return el ? el.getBoundingClientRect().width * 0.8 : 48;
  };

  return (
    <div
      ref={outerRef}
      className="w-full h-full flex flex-col game-bg relative overflow-hidden cursor-mallet select-none"
    >
      {/* Whack flash */}
      {whackFlash && (
        <div className="absolute inset-0 z-[70] pointer-events-none bg-white opacity-20" />
      )}
      {/* Chaos strobe */}
      {isChaos && (
        <div className={`absolute inset-0 z-[65] pointer-events-none bg-destructive transition-opacity duration-150 ${chaosFlash ? 'opacity-[0.08]' : 'opacity-0'}`} />
      )}

      {/* ── HUD ──────────────────────────────────────────── */}
      <div className={`flex-shrink-0 ${cfg.border} border-b-4 bg-black/85 px-3 pt-2 pb-1.5 z-20`}>

        {/* Row: score | round+combo | timer */}
        <div className="flex items-center justify-between gap-2">

          {/* Score */}
          <div className="flex flex-col items-start min-w-[76px]">
            <span className="font-display text-[7px] text-secondary/70 tracking-widest leading-none mb-0.5">SCORE</span>
            <motion.span
              key={score}
              animate={scorePop ? { scale: [1, 1.35, 1] } : {}}
              transition={{ duration: 0.22 }}
              className={`font-sans text-3xl font-bold tracking-widest leading-none ${isChaos ? 'text-destructive' : 'text-primary'} drop-shadow-[0_0_8px_currentColor]`}
            >
              {score.toString().padStart(4, '0')}
            </motion.span>
          </div>

          {/* Centre */}
          <div className="flex flex-col items-center flex-1">
            <span className={`font-display text-[9px] ${cfg.color} tracking-widest leading-none`}>{cfg.label}</span>
            <span className={`font-display text-[7px] ${cfg.color} opacity-60 tracking-widest leading-none mt-0.5`}>{cfg.sub}</span>
            <AnimatePresence>
              {combo > 1 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="font-display text-[8px] text-accent drop-shadow-[0_0_4px_hsl(140,100%,55%)] mt-0.5 whitespace-nowrap"
                >
                  ×{combo} COMBO!
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Timer */}
          <div className="flex flex-col items-end min-w-[76px]">
            <span className="font-display text-[7px] text-secondary/70 tracking-widest leading-none mb-0.5">TIME</span>
            <motion.span
              key={timeLeft}
              animate={isCritical ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.35 }}
              className={`font-sans text-3xl font-bold tracking-widest leading-none ${timeCls} drop-shadow-[0_0_8px_currentColor] ${isCritical ? 'animate-pulse' : ''}`}
            >
              {timeLeft.toString().padStart(2, '0')}
            </motion.span>
          </div>

        </div>

        {/* Timer bar */}
        <div className="mt-1.5 w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${barCls}`}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: 'linear' }}
          />
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center z-10 px-2 py-1">
        <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-4 w-full max-w-2xl">
          {moles.map((mole, i) => (
            <div key={mole.id} ref={el => { holeRefs.current[i] = el; }}>
              <MoleHole mole={mole} onWhack={handleWhack} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Flying moles ─────────────────────────────────── */}
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
