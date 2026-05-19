import React from 'react';
import { useGameEngine, GameRound } from '@/hooks/use-game-engine';
import { ArcadeCabinet } from '@/components/ArcadeCabinet';
import { StartScreen } from './StartScreen';
import { GameScreen } from './GameScreen';
import { GameOverScreen } from './GameOverScreen';
import { RoundTransitionScreen } from './RoundTransitionScreen';

export function Home() {
  const { 
    status, 
    round,
    score, 
    timeLeft, 
    moles,
    flyingMoles,
    startGame, 
    whackMole 
  } = useGameEngine();

  return (
    <div className="h-screen w-full flex items-stretch justify-center p-4 relative overflow-hidden">
      
      <div 
        className="fixed inset-0 z-[-1] opacity-40 pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/arcade-bg.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <ArcadeCabinet className="h-full">
        {status === 'START' && (
          <StartScreen onStart={startGame} />
        )}
        
        {status === 'PLAYING' && (
          <GameScreen 
            score={score} 
            timeLeft={timeLeft} 
            moles={moles}
            flyingMoles={flyingMoles}
            onWhack={whackMole}
            round={round}
          />
        )}

        {status === 'TRANSITIONING' && (
          <RoundTransitionScreen nextRound={(round + 1) as GameRound} />
        )}
        
        {status === 'GAME_OVER' && (
          <GameOverScreen 
            score={score} 
            onRestart={startGame} 
          />
        )}
      </ArcadeCabinet>

    </div>
  );
}
