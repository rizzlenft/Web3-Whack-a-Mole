import React from 'react';
import { MoleHole } from '@/components/MoleHole';
import { MoleState } from '@/hooks/use-game-engine';
import { Timer, Zap } from 'lucide-react';

interface GameScreenProps {
  score: number;
  timeLeft: number;
  moles: MoleState[];
  onWhack: (id: number) => void;
}

export function GameScreen({ score, timeLeft, moles, onWhack }: GameScreenProps) {
  return (
    <div className="w-full h-full min-h-[500px] flex flex-col p-4 md:p-8">
      
      {/* HUD */}
      <div className="flex justify-between items-center bg-card/80 p-4 border-4 border-primary box-shadow-neon rounded-lg mb-8">
        <div className="flex flex-col">
          <span className="text-secondary font-display text-sm md:text-base">SCORE</span>
          <span className="text-3xl md:text-5xl font-sans text-white text-shadow-cyan">
            {score.toString().padStart(4, '0')}
          </span>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-secondary font-display text-sm md:text-base flex items-center gap-2">
            <Timer className="w-4 h-4" /> TIME
          </span>
          <span className={`text-3xl md:text-5xl font-sans text-shadow-neon ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
            {timeLeft.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 lg:gap-12 w-full max-w-4xl">
          {moles.map(mole => (
            <MoleHole 
              key={mole.id} 
              mole={mole} 
              onWhack={onWhack} 
            />
          ))}
        </div>
      </div>

    </div>
  );
}
