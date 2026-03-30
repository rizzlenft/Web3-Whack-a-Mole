import { useState, useEffect, useRef, useCallback } from 'react';

export type GameStatus = 'START' | 'PLAYING' | 'GAME_OVER';

export type MoleState = {
  id: number;
  active: boolean;
  whacked: boolean;
};

const TOTAL_HOLES = 8;
const GAME_DURATION_SEC = 30;

export function useGameEngine() {
  const [status, setStatus] = useState<GameStatus>('START');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SEC);
  const [moles, setMoles] = useState<MoleState[]>(
    Array.from({ length: TOTAL_HOLES }, (_, i) => ({ id: i, active: false, whacked: false }))
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const moleTimeoutsRef = useRef<Record<number, NodeJS.Timeout>>({});
  
  // Track precise time for progression math
  const startTimeRef = useRef<number>(0);

  const stopAllMoles = useCallback(() => {
    Object.values(moleTimeoutsRef.current).forEach(clearTimeout);
    moleTimeoutsRef.current = {};
    setMoles(prev => prev.map(m => ({ ...m, active: false, whacked: false })));
  }, []);

  const endGame = useCallback(() => {
    setStatus('GAME_OVER');
    if (timerRef.current) clearInterval(timerRef.current);
    if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    stopAllMoles();
  }, [stopAllMoles]);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_DURATION_SEC);
    setStatus('PLAYING');
    stopAllMoles();
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const runGameLoop = () => {
      if (status === 'GAME_OVER') return;

      const elapsedMs = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsedMs / (GAME_DURATION_SEC * 1000), 1);

      // Progression Math:
      // Start interval: ~1200ms, End interval: ~350ms
      const currentInterval = 1200 - (850 * progress);
      // Start duration: ~2000ms, End duration: ~600ms
      const currentDuration = 2000 - (1400 * progress);

      setMoles(prevMoles => {
        const inactiveMoles = prevMoles.filter(m => !m.active);
        if (inactiveMoles.length > 0) {
          // Add some randomness to how many moles pop up simultaneously near the end
          const numToSpawn = progress > 0.7 && Math.random() > 0.5 ? 2 : 1;
          
          let nextMoles = [...prevMoles];
          
          for (let i = 0; i < Math.min(numToSpawn, inactiveMoles.length); i++) {
            const randomHole = inactiveMoles[Math.floor(Math.random() * inactiveMoles.length)];
            const holeId = randomHole.id;
            
            nextMoles = nextMoles.map(m => 
              m.id === holeId ? { ...m, active: true, whacked: false } : m
            );

            // Auto-hide mole after duration
            if (moleTimeoutsRef.current[holeId]) {
              clearTimeout(moleTimeoutsRef.current[holeId]);
            }

            moleTimeoutsRef.current[holeId] = setTimeout(() => {
              setMoles(current => 
                current.map(m => m.id === holeId ? { ...m, active: false, whacked: false } : m)
              );
            }, currentDuration);
          }
          return nextMoles;
        }
        return prevMoles;
      });

      gameLoopRef.current = setTimeout(runGameLoop, currentInterval);
    };

    gameLoopRef.current = setTimeout(runGameLoop, 1000); // Initial delay
  }, [endGame, status, stopAllMoles]);

  const whackMole = useCallback((id: number) => {
    setMoles(prev => {
      const mole = prev.find(m => m.id === id);
      if (mole && mole.active && !mole.whacked) {
        setScore(s => s + 1);
        
        // Clear its auto-hide timeout
        if (moleTimeoutsRef.current[id]) {
          clearTimeout(moleTimeoutsRef.current[id]);
        }

        // Hide it fully after a tiny delay for the BONK animation
        moleTimeoutsRef.current[id] = setTimeout(() => {
          setMoles(current => 
            current.map(m => m.id === id ? { ...m, active: false, whacked: false } : m)
          );
        }, 300);

        return prev.map(m => m.id === id ? { ...m, whacked: true } : m);
      }
      return prev;
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
      stopAllMoles();
    };
  }, [stopAllMoles]);

  return {
    status,
    score,
    timeLeft,
    moles,
    startGame,
    whackMole,
    setStatus
  };
}
