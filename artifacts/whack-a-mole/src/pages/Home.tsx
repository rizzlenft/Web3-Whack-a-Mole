import React, { useEffect, useState } from 'react';
import { useEmbedded } from '@/contexts/EmbeddedContext';
import { useGameEngine, GameRound } from '@/hooks/use-game-engine';
import { ArcadeCabinet } from '@/components/ArcadeCabinet';
import { StartScreen } from './StartScreen';
import { GameScreen } from './GameScreen';
import { GameOverScreen } from './GameOverScreen';
import { RoundTransitionScreen } from './RoundTransitionScreen';
import { CountdownScreen } from './CountdownScreen';

export function Home() {
  const embedded = useEmbedded();
  const {
    status,
    round,
    score,
    timeLeft,
    moles,
    flyingMoles,
    startGame,
    whackMole,
    whackFlyingMole,
    onCountdownDone,
  } = useGameEngine();

  // Capture score at the moment each round ends (for display in transition screen)
  const [roundEndScore, setRoundEndScore] = useState(0);
  useEffect(() => {
    if (status === 'TRANSITIONING') setRoundEndScore(score);
  }, [status]); // intentionally omit score — capture once when status flips

  return (
    <div
      className={
        embedded
          ? "h-full w-full flex items-stretch justify-center p-0.5 relative overflow-hidden min-h-0"
          : "h-screen w-full flex items-stretch justify-center p-4 relative overflow-hidden"
      }
    >
      <div
        className={`fixed inset-0 z-[-1] pointer-events-none ${embedded ? "opacity-25" : "opacity-40"}`}
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/arcade-bg.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <ArcadeCabinet className="h-full">
        {status === 'START' && <StartScreen onStart={startGame} />}

        {status === 'COUNTDOWN' && <CountdownScreen onDone={onCountdownDone} />}

        {status === 'PLAYING' && (
          <GameScreen
            score={score}
            timeLeft={timeLeft}
            moles={moles}
            flyingMoles={flyingMoles}
            onWhack={whackMole}
            onWhackFlying={whackFlyingMole}
            round={round}
          />
        )}

        {status === 'TRANSITIONING' && (
          <RoundTransitionScreen
            nextRound={(round + 1) as GameRound}
            score={roundEndScore}
          />
        )}

        {status === 'GAME_OVER' && (
          <GameOverScreen score={score} onRestart={startGame} />
        )}
      </ArcadeCabinet>
    </div>
  );
}
