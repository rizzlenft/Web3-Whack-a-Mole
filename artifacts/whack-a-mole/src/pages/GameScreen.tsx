import React, { useEffect, useState } from 'react';
import { MoleHole } from '@/components/MoleHole';
import { MoleState } from '@/hooks/use-game-engine';
import { Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameLogo } from '@/components/GameLogo';

interface GameScreenProps {
  score: number;
  timeLeft: number;
  moles: MoleState[];
  onWhack: (id: number) => void;
}

export function GameScreen({ score, timeLeft, moles, onWhack }: GameScreenProps) {
  const [combo, setCombo] = useState(0);
  const [lastWhackTime, setLastWhackTime] = useState(0);

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

  // Urgency colors
  const timeColor = timeLeft > 15 ? 'text-accent' : timeLeft > 5 ? 'text-yellow-400' : 'text-destructive';
  const progressPercent = (timeLeft / 30) * 100;

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col p-4 md:p-8 game-bg relative overflow-hidden cursor-mallet">
      
      {/* HUD */}
      <div className="flex flex-col gap-2 mb-3 z-10">
        <div className="flex justify-between items-center bg-card/90 p-4 border-4 border-primary box-shadow-neon rounded-sm">
          <div className="flex flex-col relative">
            <span className="text-secondary font-display text-sm md:text-base mb-1 flex items-center gap-2">
              🪙 SCORE
            </span>
            <span className="text-2xl md:text-3xl font-sans text-primary text-shadow-neon font-bold tracking-widest bg-black px-3 py-1 border-2 border-primary/50 rounded shadow-inner">
              {score.toString().padStart(4, '0')}
            </span>
            <AnimatePresence>
              {combo > 1 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -right-20 top-8 text-accent font-display text-xl text-shadow-neon rotate-12"
                >
                  {combo}x COMBO!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-secondary font-display text-sm md:text-base flex items-center gap-2 mb-1">
              <Timer className="w-4 h-4" /> ⏰ TIME LEFT
            </span>
            <span className={`text-2xl md:text-3xl font-sans font-bold tracking-widest bg-black px-3 py-1 border-2 border-secondary/50 rounded shadow-inner ${timeColor} ${timeLeft <= 5 ? 'animate-pulse' : ''} drop-shadow-[0_0_10px_currentColor]`}>
              {timeLeft.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-3 bg-zinc-900 border-2 border-zinc-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-linear ${timeLeft > 15 ? 'bg-accent' : timeLeft > 5 ? 'bg-yellow-400' : 'bg-destructive'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex justify-center w-full mb-3 z-10 border-b-2 border-primary/30 pb-3 shadow-[0_4px_10px_rgba(255,0,255,0.1)]">
        <GameLogo size="sm" />
      </div>

      {/* Grid */}
      <div className="flex-1 flex items-center justify-center z-10 pb-8">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 w-full max-w-4xl mx-auto">
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
