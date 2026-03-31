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
    startGame, 
    whackMole 
  } = useGameEngine();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 py-8 relative">
      
      <div 
        className="fixed inset-0 z-[-1] opacity-40 object-cover w-full h-full pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/arcade-bg.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <ArcadeCabinet>
        {status === 'START' && (
          <StartScreen onStart={startGame} />
        )}
        
        {status === 'PLAYING' && (
          <GameScreen 
            score={score} 
            timeLeft={timeLeft} 
            moles={moles} 
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
