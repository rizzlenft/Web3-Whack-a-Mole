import { useEmbedded } from '@/contexts/EmbeddedContext';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MoleHole } from '@/components/MoleHole';
import { FlyingMole } from '@/components/FlyingMole';
import { FloatingScore, FloatingScoreEntry } from '@/components/FloatingScore';
import { MoleState, FlyingMoleEntry, GameRound, MoleType, MOLE_POINTS } from '@/hooks/use-game-engine';
import { useSound } from '@/hooks/use-sound';
import { motion, AnimatePresence } from 'framer-motion';

interface GameScreenProps {
  score: number;
  timeLeft: number;
  moles: MoleState[];
  flyingMoles: FlyingMoleEntry[];
  onWhack: (id: number) => void;
  onWhackFlying: (id: string, moleType: MoleType) => void;
  round: GameRound;
}

const ROUND_CONFIG: Record<GameRound, { label: string; sub: string; color: string; border: string; duration: number }> = {
  1: { label: 'ROUND 1', sub: 'BONK EM',  color: 'text-primary',     border: 'border-primary',     duration: 20 },
  2: { label: 'ROUND 2', sub: 'THEY FLY', color: 'text-secondary',   border: 'border-secondary',   duration: 20 },
  3: { label: '⚡ CHAOS', sub: 'NO MERCY', color: 'text-destructive', border: 'border-destructive', duration: 10 },
};

export function GameScreen({ score, timeLeft, moles, flyingMoles, onWhack, onWhackFlying, round }: GameScreenProps) {
  const embedded = useEmbedded();
  const [combo, setCombo]           = useState(0);
  const [lastWhackTime, setLWT]     = useState(0);
  const [prevScore, setPrevScore]   = useState(score);
  const [scorePop, setScorePop]     = useState(false);
  const [whackFlash, setWhackFlash] = useState(false);
  const [shake, setShake]           = useState(false);
  const [chaosFlash, setChaosFlash] = useState(false);
  const [floats, setFloats]         = useState<FloatingScoreEntry[]>([]);

  const outerRef = useRef<HTMLDivElement>(null);
  const holeRefs = useRef<(HTMLDivElement | null)[]>(Array(8).fill(null));
  const prevTimeRef = useRef(timeLeft);

  const snd = useSound();

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

  // Timer tick sound when critical
  useEffect(() => {
    if (isCritical && prevTimeRef.current !== timeLeft) {
      snd.timerTick();
    }
    prevTimeRef.current = timeLeft;
  }, [timeLeft, isCritical, snd]);

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

  // Remove floats after animation
  useEffect(() => {
    if (floats.length === 0) return;
    const t = setTimeout(() => setFloats(f => f.slice(1)), 900);
    return () => clearTimeout(t);
  }, [floats]);

  const getHoleCenter = useCallback((holeId: number) => {
    const el = holeRefs.current[holeId];
    const outer = outerRef.current;
    if (!el || !outer) return { x: 0, y: 0 };
    const er = el.getBoundingClientRect();
    const or = outer.getBoundingClientRect();
    return { x: er.left - or.left + er.width / 2, y: er.top - or.top + er.height * 0.3 };
  }, []);

  const getFlySize = () => {
    const el = holeRefs.current[0];
    return el ? el.getBoundingClientRect().width * 0.8 : 48;
  };

  const handleWhack = useCallback((id: number) => {
    const mole = moles.find(m => m.id === id);
    if (!mole || !mole.active || mole.whacked) return;

    const now = Date.now();
    const newCombo = now - lastWhackTime < 900 ? combo + 1 : 1;
    setCombo(newCombo);
    setLWT(now);

    // Flash & shake
    setWhackFlash(true);
    setTimeout(() => setWhackFlash(false), 80);
    setShake(true);
    setTimeout(() => setShake(false), 350);

    // Sounds
    if (mole.moleType === 'golden') {
      snd.goldenBonk();
    } else {
      snd.bonk();
      if (newCombo > 1) snd.combo(newCombo);
    }

    // Floating score
    const pts = MOLE_POINTS[mole.moleType];
    const center = getHoleCenter(id);
    const label = mole.moleType === 'golden' ? '+5 👑' : mole.moleType === 'skull' ? '-1 💀' : newCombo >= 3 ? `+1 ×${newCombo}🔥` : undefined;
    setFloats(f => [
      ...f,
      { id: `${id}_${now}`, x: center.x, y: center.y, value: pts, label },
    ]);

    onWhack(id);
  }, [moles, combo, lastWhackTime, onWhack, snd, getHoleCenter]);

  // Mole pop sound — fire when a mole becomes newly active
  const prevMolesRef = useRef(moles);
  useEffect(() => {
    const prev = prevMolesRef.current;
    moles.forEach((m, i) => {
      if (m.active && !prev[i]?.active) snd.molePop();
    });
    prevMolesRef.current = moles;
  }, [moles, snd]);

  // Flying mole whoosh
  const prevFlyRef = useRef(flyingMoles);
  useEffect(() => {
    const prevIds = new Set(prevFlyRef.current.map(f => f.id));
    flyingMoles.forEach(f => {
      if (!prevIds.has(f.id)) snd.flyWhoosh();
    });
    prevFlyRef.current = flyingMoles;
  }, [flyingMoles, snd]);

  const handleFlyWhack = useCallback((id: string, moleType: MoleType, clientX: number, clientY: number) => {
    const outer = outerRef.current;
    const or = outer ? outer.getBoundingClientRect() : { left: 0, top: 0 };
    const x = clientX - or.left;
    const y = clientY - or.top;
    const pts = MOLE_POINTS[moleType];
    const label = moleType === 'golden' ? '+5 👑 MID-AIR!' : moleType === 'skull' ? '-1 💀 DODGED' : '+1 MID-AIR!';
    setFloats(f => [...f, { id: `fly_${id}_${Date.now()}`, x, y, value: pts, label }]);
    setWhackFlash(true);
    setTimeout(() => setWhackFlash(false), 80);
    setShake(true);
    setTimeout(() => setShake(false), 350);
    if (moleType === 'golden') snd.goldenBonk();
    else snd.bonk();
    onWhackFlying(id, moleType);
  }, [onWhackFlying, snd]);

  return (
    <div
      ref={outerRef}
      className={`w-full h-full flex flex-col game-bg relative overflow-hidden cursor-mallet select-none ${shake ? 'animate-shake' : ''}`}
    >
      {/* Round color tint — unique identity per round */}
      <div
        className="absolute inset-0 pointer-events-none z-[1] transition-colors duration-1000"
        style={{
          background: round === 1
            ? 'radial-gradient(ellipse 80% 70% at 50% 60%, hsl(315,100%,60%,0.07) 0%, transparent 70%)'
            : round === 2
            ? 'radial-gradient(ellipse 80% 70% at 50% 60%, hsl(185,100%,50%,0.07) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 80% 70% at 50% 60%, hsl(0,100%,60%,0.1) 0%, transparent 70%)',
        }}
      />

      {/* Whack flash */}
      {whackFlash && <div className="absolute inset-0 z-[70] pointer-events-none bg-white opacity-[0.18]" />}
      {/* Chaos strobe */}
      {isChaos && (
        <div className={`absolute inset-0 z-[65] pointer-events-none bg-destructive transition-opacity duration-150 ${chaosFlash ? 'opacity-[0.08]' : 'opacity-0'}`} />
      )}

      {/* ── HUD ──────────────────────────────────────────── */}
      <div className={`flex-shrink-0 ${cfg.border} border-b-4 bg-black/85 px-3 pt-2 pb-1.5 z-20`}>
        <div className="flex items-center justify-between gap-2">

          {/* Score */}
          <div className="flex flex-col items-start min-w-[76px]">
            <span className="font-display text-[7px] text-secondary/70 tracking-widest leading-none mb-0.5">SCORE</span>
            <motion.span
              key={score}
              animate={scorePop ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.22 }}
              className={`font-sans font-bold tracking-widest leading-none ${isChaos ? 'text-destructive' : 'text-primary'} drop-shadow-[0_0_8px_currentColor] ${embedded ? "text-xl" : "text-3xl"}`}
            >
              {score.toString().padStart(4, '0')}
            </motion.span>
          </div>

          {/* Centre: round + combo */}
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
                  ×{combo} COMBO!{combo >= 5 ? '🔥' : ''}
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
              className={`font-sans font-bold tracking-widest leading-none ${timeCls} drop-shadow-[0_0_8px_currentColor] ${isCritical ? 'animate-pulse' : ''} ${embedded ? "text-xl" : "text-3xl"}`}
            >
              {timeLeft.toString().padStart(2, '0')}
            </motion.span>
          </div>
        </div>

        {/* Timer bar */}
        <div className="mt-1.5 w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${barCls}`}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: 'linear' }}
          />
        </div>

        {/* Mole type legend */}
        <div className="flex items-center justify-center gap-4 mt-1.5">
          <span className="font-display text-[7px] text-accent tracking-widest">⚡ +1</span>
          <span className="font-display text-[7px] text-yellow-400 tracking-widest">👑 +5</span>
          <span className="font-display text-[7px] text-destructive tracking-widest">💀 -1</span>
        </div>
      </div>

      {/* ── Last-5s urgency banner ────────────────────────── */}
      <AnimatePresence>
        {isCritical && (
          <motion.div
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-shrink-0 bg-destructive/25 border-b-2 border-destructive/60 flex items-center justify-center gap-2 py-1 z-20"
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 0.4 }}
              className="font-display text-[9px] text-destructive tracking-widest whitespace-nowrap"
            >
              ⚠️ LAST {timeLeft}s — BONK FASTER SER ⚠️
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Grid ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center z-10 px-2 py-1">
        <div className={`grid grid-cols-4 w-full max-w-2xl ${embedded ? "gap-0.5" : "gap-1 sm:gap-2 md:gap-4"}`}>
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
            onWhack={handleFlyWhack}
          />
        );
      })}

      {/* ── Floating score popups ─────────────────────────── */}
      <FloatingScore entries={floats} />
    </div>
  );
}
