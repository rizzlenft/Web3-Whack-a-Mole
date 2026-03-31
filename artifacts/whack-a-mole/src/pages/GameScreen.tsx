import React, { useEffect, useState } from 'react';
import { MoleHole } from '@/components/MoleHole';
import { MoleState, GameRound } from '@/hooks/use-game-engine';
import { Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameLogo } from '@/components/GameLogo';

interface GameScreenProps {
  score: number;
  timeLeft: number;
  moles: MoleState[];
  onWhack: (id: number) => void;
  round: GameRound;
}

const ROUND_LABELS: Record<GameRound, { label: string; color: string; emoji: string }> = {
  1: { label: 'BONK \'EM', color: 'text-accent', emoji: '🐀' },
  2: { label: 'THEY\'RE HOPPING', color: 'text-secondary', emoji: '🏃' },
  3: { label: '⚡ CHAOS ⚡', color: 'text-destructive', emoji: '💀' },
};

export function GameScreen({ score, timeLeft, moles, onWhack, round }: GameScreenProps) {
  const [combo, setCombo] = useState(0);
  const [lastWhackTime, setLastWhackTime] = useState(0);
  const [chaosFlash, setChaosFlash] = useState(false);

  const isChaoMode = round === 3;
  const roundInfo = ROUND_LABELS[round];

  const handleWhack = (id: number) => {
    const now = Date.now();
    if (now - lastWhackTime < 800) {
      setCombo(c => c + 1);
    } else {
      setCombo(1);
    }
    setLastWhackTime(now);
    onWhack(id);
  };

  useEffect(() => {
    const timer = setTimeout(() => setCombo(0), 1000);
    return () => clearTimeout(timer);
  }, [combo, lastWhackTime]);

  // Chaos round: flash effect
  useEffect(() => {
    if (!isChaoMode) return;
    const interval = setInterval(() => {
      setChaosFlash(f => !f);
    }, 400);
    return () => clearInterval(interval);
  }, [isChaoMode]);

  const timeColor = timeLeft > 10 ? 'text-accent' : timeLeft > 5 ? 'text-yellow-400' : 'text-destructive';
  const progressPercent = (timeLeft / (round === 3 ? 10 : 20)) * 100;

  return (
    <div className={`w-full h-full min-h-[500px] flex flex-col p-2 md:p-4 game-bg relative overflow-hidden cursor-mallet ${isChaoMode ? 'chaos-mode' : ''}`}>
      
      {/* Chaos flash overlay */}
      {isChaoMode && (
        <div className={`absolute inset-0 pointer-events-none z-50 transition-opacity duration-200 ${chaosFlash ? 'opacity-10' : 'opacity-0'} bg-destructive`} />
      )}

      {/* HUD */}
      <div className="flex flex-col gap-1 mb-2 z-10">
        <div className={`flex justify-between items-center bg-card/90 px-3 py-2 border-4 rounded-sm ${isChaoMode ? 'border-destructive shadow-[0_0_20px_rgba(255,0,0,0.6)]' : 'border-primary box-shadow-neon'}`}>
          {/* Score */}
          <div className="flex flex-col">
            <span className="text-secondary font-display text-xs mb-0.5 flex items-center gap-1">
              🪙 SCORE
            </span>
            <div className="relative">
              <span className="text-2xl md:text-3xl font-sans text-primary text-shadow-neon font-bold tracking-widest bg-black px-3 py-0.5 border-2 border-primary/50 rounded shadow-inner">
                {score.toString().padStart(4, '0')}
              </span>
              <AnimatePresence>
                {combo > 1 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -right-16 top-1 text-accent font-display text-sm text-shadow-neon rotate-12 whitespace-nowrap"
                  >
                    {combo}x COMBO!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Round Indicator */}
          <div className="flex flex-col items-center">
            <span className="font-display text-xs text-zinc-400 uppercase mb-0.5">ROUND</span>
            <div className={`font-display text-lg md:text-xl ${roundInfo.color} text-shadow-neon`}>
              {round} / 3
            </div>
            <div className={`font-display text-xs ${roundInfo.color} uppercase tracking-wider`}>
              {roundInfo.emoji} {roundInfo.label}
            </div>
          </div>

          {/* Timer */}
          <div className="flex flex-col items-end">
            <span className="text-secondary font-display text-xs flex items-center gap-1 mb-0.5">
              <Timer className="w-3 h-3" /> TIME
            </span>
            <span className={`text-2xl md:text-3xl font-sans font-bold tracking-widest bg-black px-3 py-0.5 border-2 border-secondary/50 rounded shadow-inner ${timeColor} ${timeLeft <= 5 ? 'animate-pulse' : ''} drop-shadow-[0_0_8px_currentColor]`}>
              {timeLeft.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-zinc-900 border border-zinc-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${timeLeft > 10 ? 'bg-accent' : timeLeft > 5 ? 'bg-yellow-400' : 'bg-destructive animate-pulse'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Mini logo header */}
      <div className="flex justify-center mb-1 z-10">
        <GameLogo size="sm" />
      </div>

      {/* Mole Grid */}
      <div className="flex-1 flex items-center justify-center z-10">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 w-full max-w-2xl">
          {moles.map(mole => (
            <MoleHole
              key={mole.id}
              mole={mole}
              onWhack={handleWhack}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
