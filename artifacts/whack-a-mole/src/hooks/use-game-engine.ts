import { useState, useEffect, useRef, useCallback } from 'react';

export type GameStatus = 'START' | 'PLAYING' | 'TRANSITIONING' | 'GAME_OVER';
export type GameRound = 1 | 2 | 3;

export type MoleState = {
  id: number;
  active: boolean;
  whacked: boolean;
  pfp: number;
};

const TOTAL_HOLES = 8;
export const PFP_COUNT = 2;
const TRANSITION_MS = 3000;

const ROUND_CONFIG: Record<GameRound, { duration: number; mode: 'popup' | 'hop' | 'chaos' }> = {
  1: { duration: 20, mode: 'popup' },
  2: { duration: 20, mode: 'hop' },
  3: { duration: 10, mode: 'chaos' },
};

const freshMoles = (): MoleState[] =>
  Array.from({ length: TOTAL_HOLES }, (_, i) => ({ id: i, active: false, whacked: false, pfp: 0 }));

export function useGameEngine() {
  const [status, setStatus] = useState<GameStatus>('START');
  const [round, setRound] = useState<GameRound>(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [moles, setMoles] = useState<MoleState[]>(freshMoles());

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moleTimeoutsRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const startTimeRef = useRef<number>(0);

  const statusRef = useRef<GameStatus>('START');
  const roundRef = useRef<GameRound>(1);

  const stopAllTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    Object.values(moleTimeoutsRef.current).forEach(clearTimeout);
    moleTimeoutsRef.current = {};
    timerRef.current = null;
    gameLoopRef.current = null;
  }, []);

  const beginRound = useCallback((r: GameRound) => {
    const config = ROUND_CONFIG[r];

    stopAllTimers();
    setMoles(freshMoles());
    setRound(r);
    setStatus('PLAYING');
    setTimeLeft(config.duration);

    roundRef.current = r;
    statusRef.current = 'PLAYING';
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    const getProgress = () =>
      Math.min((Date.now() - startTimeRef.current) / (config.duration * 1000), 1);

    // ── ROUND 1: POPUP ────────────────────────────────────────────────
    const runPopupLoop = () => {
      if (statusRef.current !== 'PLAYING' || roundRef.current !== r) return;
      const p = getProgress();
      const interval = Math.max(300, 1200 - 700 * p);
      const duration = Math.max(400, 2000 - 1300 * p);

      setMoles(prev => {
        const inactive = prev.filter(m => !m.active);
        if (inactive.length === 0) return prev;
        const count = p > 0.6 && Math.random() > 0.5 ? 2 : 1;
        let next = [...prev];
        const pool = [...inactive];
        for (let i = 0; i < Math.min(count, pool.length); i++) {
          const idx = Math.floor(Math.random() * pool.length);
          const hole = pool.splice(idx, 1)[0];
          const pfp = Math.floor(Math.random() * PFP_COUNT);
          next = next.map(m => m.id === hole.id ? { ...m, active: true, whacked: false, pfp } : m);
          const hid = hole.id;
          if (moleTimeoutsRef.current[hid]) clearTimeout(moleTimeoutsRef.current[hid]);
          moleTimeoutsRef.current[hid] = setTimeout(() => {
            setMoles(c => c.map(m => m.id === hid ? { ...m, active: false, whacked: false } : m));
          }, duration);
        }
        return next;
      });

      gameLoopRef.current = setTimeout(runPopupLoop, interval);
    };

    // ── ROUND 2: HOP ─────────────────────────────────────────────────
    const hopMole = (fromId: number, pfp: number, hopCount: number) => {
      if (statusRef.current !== 'PLAYING' || roundRef.current !== r) return;
      const hopDelay = Math.max(300, 1400 - 900 * getProgress());
      if (moleTimeoutsRef.current[fromId]) clearTimeout(moleTimeoutsRef.current[fromId]);
      moleTimeoutsRef.current[fromId] = setTimeout(() => {
        if (statusRef.current !== 'PLAYING' || roundRef.current !== r) return;
        let nextId = -1;
        setMoles(curr => {
          if (hopCount >= 5) {
            return curr.map(m => m.id === fromId ? { ...m, active: false, whacked: false } : m);
          }
          const inactive = curr.filter(m => !m.active && m.id !== fromId);
          if (inactive.length === 0) {
            return curr.map(m => m.id === fromId ? { ...m, active: false, whacked: false } : m);
          }
          const dest = inactive[Math.floor(Math.random() * inactive.length)];
          nextId = dest.id;
          return curr.map(m => {
            if (m.id === fromId) return { ...m, active: false, whacked: false };
            if (m.id === dest.id) return { ...m, active: true, whacked: false, pfp };
            return m;
          });
        });
        if (nextId !== -1) hopMole(nextId, pfp, hopCount + 1);
      }, hopDelay);
    };

    const runHopLoop = () => {
      if (statusRef.current !== 'PLAYING' || roundRef.current !== r) return;
      const p = getProgress();
      const interval = Math.max(400, 1100 - 650 * p);

      setMoles(prev => {
        const inactive = prev.filter(m => !m.active);
        if (inactive.length === 0) return prev;
        const hole = inactive[Math.floor(Math.random() * inactive.length)];
        const pfp = Math.floor(Math.random() * PFP_COUNT);
        hopMole(hole.id, pfp, 0);
        return prev.map(m => m.id === hole.id ? { ...m, active: true, whacked: false, pfp } : m);
      });

      gameLoopRef.current = setTimeout(runHopLoop, interval);
    };

    // ── ROUND 3: CHAOS ───────────────────────────────────────────────
    const runChaosLoop = () => {
      if (statusRef.current !== 'PLAYING' || roundRef.current !== r) return;
      const p = getProgress();
      const interval = Math.max(120, 350 - 200 * p);

      setMoles(prev => {
        const inactive = prev.filter(m => !m.active);
        if (inactive.length <= 1) return prev;
        const count = Math.random() > 0.4 ? 2 : 1;
        let next = [...prev];
        const pool = [...inactive];
        for (let i = 0; i < Math.min(count, pool.length); i++) {
          const idx = Math.floor(Math.random() * pool.length);
          const hole = pool.splice(idx, 1)[0];
          const pfp = Math.floor(Math.random() * PFP_COUNT);
          const isHop = Math.random() > 0.45;
          next = next.map(m => m.id === hole.id ? { ...m, active: true, whacked: false, pfp } : m);
          const hid = hole.id;
          if (moleTimeoutsRef.current[hid]) clearTimeout(moleTimeoutsRef.current[hid]);
          if (isHop) {
            moleTimeoutsRef.current[hid] = setTimeout(() => {
              if (statusRef.current !== 'PLAYING') return;
              let destId = -1;
              setMoles(curr => {
                const inact = curr.filter(m => !m.active && m.id !== hid);
                if (inact.length === 0) return curr.map(m => m.id === hid ? { ...m, active: false, whacked: false } : m);
                const dest = inact[Math.floor(Math.random() * inact.length)];
                destId = dest.id;
                return curr.map(m => {
                  if (m.id === hid) return { ...m, active: false, whacked: false };
                  if (m.id === dest.id) return { ...m, active: true, whacked: false, pfp };
                  return m;
                });
              });
              if (destId !== -1) {
                const d = destId;
                if (moleTimeoutsRef.current[d]) clearTimeout(moleTimeoutsRef.current[d]);
                moleTimeoutsRef.current[d] = setTimeout(() => {
                  setMoles(c => c.map(m => m.id === d ? { ...m, active: false, whacked: false } : m));
                }, Math.max(150, 400 - 150 * p));
              }
            }, Math.max(180, 380 - 180 * p));
          } else {
            moleTimeoutsRef.current[hid] = setTimeout(() => {
              setMoles(c => c.map(m => m.id === hid ? { ...m, active: false, whacked: false } : m));
            }, Math.max(150, 500 - 200 * p));
          }
        }
        return next;
      });

      gameLoopRef.current = setTimeout(runChaosLoop, interval);
    };

    const loopFn = config.mode === 'popup' ? runPopupLoop
      : config.mode === 'hop' ? runHopLoop
      : runChaosLoop;
    gameLoopRef.current = setTimeout(loopFn, 800);
  }, [stopAllTimers]);

  // Keep a ref to beginRound so the transition effect always calls the latest version
  const beginRoundRef = useRef(beginRound);
  beginRoundRef.current = beginRound;

  // When timeLeft hits 0 during PLAYING, trigger round-end logic
  useEffect(() => {
    if (status !== 'PLAYING' || timeLeft > 0) return;
    stopAllTimers();
    setMoles(freshMoles());
    if (round < 3) {
      setStatus('TRANSITIONING');
      statusRef.current = 'TRANSITIONING';
    } else {
      setStatus('GAME_OVER');
      statusRef.current = 'GAME_OVER';
    }
  }, [timeLeft, status, round, stopAllTimers]);

  // Auto-advance from TRANSITIONING to next round
  useEffect(() => {
    if (status !== 'TRANSITIONING') return;
    const nextRound = (round + 1) as GameRound;
    const t = setTimeout(() => {
      beginRoundRef.current(nextRound);
    }, TRANSITION_MS);
    return () => clearTimeout(t);
  }, [status, round]);

  const startGame = useCallback(() => {
    setScore(0);
    beginRound(1);
  }, [beginRound]);

  const whackMole = useCallback((id: number) => {
    setMoles(prev => {
      const mole = prev.find(m => m.id === id);
      if (!mole || !mole.active || mole.whacked) return prev;
      setScore(s => s + 1);
      if (moleTimeoutsRef.current[id]) clearTimeout(moleTimeoutsRef.current[id]);
      moleTimeoutsRef.current[id] = setTimeout(() => {
        setMoles(c => c.map(m => m.id === id ? { ...m, active: false, whacked: false } : m));
      }, 280);
      return prev.map(m => m.id === id ? { ...m, whacked: true } : m);
    });
  }, []);

  useEffect(() => {
    return () => { stopAllTimers(); };
  }, [stopAllTimers]);

  return { status, round, score, timeLeft, moles, startGame, whackMole };
}
