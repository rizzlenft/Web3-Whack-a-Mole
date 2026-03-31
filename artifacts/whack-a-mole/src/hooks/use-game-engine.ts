import { useState, useEffect, useRef, useCallback } from 'react';

export type GameStatus = 'START' | 'PLAYING' | 'TRANSITIONING' | 'GAME_OVER';
export type GameRound = 1 | 2 | 3;

export type MoleState = {
  id: number;
  active: boolean;
  whacked: boolean;
  pfp: number;
};

export type FlyingMoleEntry = {
  id: string;
  fromHole: number;
  toHole: number;
  pfp: number;
  duration: number; // ms
};

const TOTAL_HOLES = 8;
export const PFP_COUNT = 2;
const TRANSITION_MS = 3000;

const ROUND_CONFIG: Record<GameRound, { duration: number }> = {
  1: { duration: 20 },
  2: { duration: 20 },
  3: { duration: 10 },
};

const freshMoles = (): MoleState[] =>
  Array.from({ length: TOTAL_HOLES }, (_, i) => ({
    id: i, active: false, whacked: false, pfp: 0,
  }));

export function useGameEngine() {
  const [status, setStatus] = useState<GameStatus>('START');
  const [round, setRound] = useState<GameRound>(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [moles, setMoles] = useState<MoleState[]>(freshMoles());
  const [flyingMoles, setFlyingMoles] = useState<FlyingMoleEntry[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const startTimeRef = useRef<number>(0);
  const statusRef = useRef<GameStatus>('START');
  const roundRef = useRef<GameRound>(1);

  const stopAllTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current.clear();
    timerRef.current = null;
  }, []);

  const schedule = (key: string, fn: () => void, delay: number) => {
    const prev = timeoutsRef.current.get(key);
    if (prev) clearTimeout(prev);
    const t = setTimeout(fn, delay);
    timeoutsRef.current.set(key, t);
  };

  const beginRound = useCallback((r: GameRound) => {
    const config = ROUND_CONFIG[r];
    stopAllTimers();
    setMoles(freshMoles());
    setFlyingMoles([]);
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

    const guard = () => statusRef.current === 'PLAYING' && roundRef.current === r;

    // ── ROUND 1: popup-and-stay ───────────────────────────────────────
    const runPopupLoop = (loopKey: string) => {
      if (!guard()) return;
      const p = getProgress();
      const interval = Math.max(300, 1200 - 700 * p);
      const duration = Math.max(450, 2000 - 1300 * p);
      const count = p > 0.6 && Math.random() > 0.5 ? 2 : 1;

      setMoles(prev => {
        const inactive = prev.filter(m => !m.active);
        if (inactive.length === 0) return prev;
        let next = [...prev];
        const pool = [...inactive];
        for (let i = 0; i < Math.min(count, pool.length); i++) {
          const idx = Math.floor(Math.random() * pool.length);
          const hole = pool.splice(idx, 1)[0];
          const pfp = Math.floor(Math.random() * PFP_COUNT);
          next = next.map(m => m.id === hole.id
            ? { ...m, active: true, whacked: false, pfp } : m);
          const hid = hole.id;
          schedule(`popup_${hid}`, () => {
            if (!guard()) return;
            setMoles(c => c.map(m => m.id === hid
              ? { ...m, active: false, whacked: false } : m));
          }, duration);
        }
        return next;
      });

      schedule(loopKey, () => runPopupLoop(loopKey), interval);
    };

    // ── ROUND 2 mechanic: flying arc between holes ────────────────────
    // Each "popcorn chain" manages one PFP that repeatedly pops up,
    // then physically flies through the air to a random new hole.
    const startPopcornChain = (chainId: number) => {
      const doIteration = (hintHole: number = -1) => {
        if (!guard()) return;

        const pfp = Math.floor(Math.random() * PFP_COUNT);
        let holeId = -1;

        setMoles(curr => {
          const inactive = curr.filter(m => !m.active);
          if (inactive.length === 0) return curr;
          // Land at hintHole if it's available, otherwise random
          const preferred = hintHole !== -1 && !curr[hintHole]?.active
            ? curr.find(m => m.id === hintHole) ?? null
            : null;
          const target = preferred ?? inactive[Math.floor(Math.random() * inactive.length)];
          holeId = target.id;
          return curr.map(m => m.id === holeId
            ? { ...m, active: true, whacked: false, pfp } : m);
        });

        if (holeId === -1) {
          schedule(`pc_${chainId}_retry`, () => doIteration(), 120);
          return;
        }

        const p = getProgress();
        const visMs = Math.max(600, 1600 - 900 * p);  // time sitting in hole
        const flyMs = Math.max(500, 1050 - 450 * p);  // time flying through air
        const srcHole = holeId;

        schedule(`pc_${chainId}_sit`, () => {
          if (!guard()) return;

          let wasWhacked = false;
          setMoles(curr => {
            const m = curr.find(m => m.id === srcHole);
            if (!m || m.whacked) { wasWhacked = true; return curr; }
            return curr.map(m => m.id === srcHole
              ? { ...m, active: false, whacked: false } : m);
          });

          if (wasWhacked) {
            // Whacked! Chain picks a fresh hole after a short pause
            schedule(`pc_${chainId}_whacked`, () => doIteration(), 400);
            return;
          }

          // Launch into the air toward a random destination hole
          const destHole = Math.floor(Math.random() * TOTAL_HOLES);
          const flyId = `fly_${chainId}_${Date.now()}`;

          setFlyingMoles(curr => [
            ...curr,
            { id: flyId, fromHole: srcHole, toHole: destHole, pfp, duration: flyMs },
          ]);

          // After flying, land at destination and continue chain
          schedule(`pc_${chainId}_fly`, () => {
            if (!guard()) return;
            setFlyingMoles(curr => curr.filter(f => f.id !== flyId));
            doIteration(destHole); // land here and sit again
          }, flyMs);
        }, visMs);
      };

      doIteration();
    };

    // ── Round loops ───────────────────────────────────────────────────

    if (r === 1) {
      schedule('popup_loop', () => runPopupLoop('popup_loop'), 800);
    }

    if (r === 2) {
      // Start with 1 chain, add more over time
      schedule('pc_start_0', () => startPopcornChain(0), 600);
      schedule('pc_spawn_1', () => { if (guard()) startPopcornChain(1); },
        config.duration * 1000 * 0.4);
      schedule('pc_spawn_2', () => { if (guard()) startPopcornChain(2); },
        config.duration * 1000 * 0.75);
    }

    if (r === 3) {
      // Round 1 popup loop (faster) + popcorn arcing chains simultaneously

      const runChaosPopup = (loopKey: string) => {
        if (!guard()) return;
        const p = getProgress();
        const interval = Math.max(220, 750 - 420 * p);
        const duration = Math.max(280, 950 - 560 * p);
        const count = Math.random() > 0.45 ? 2 : 1;

        setMoles(prev => {
          const inactive = prev.filter(m => !m.active);
          if (inactive.length === 0) return prev;
          let next = [...prev];
          const pool = [...inactive];
          for (let i = 0; i < Math.min(count, pool.length); i++) {
            const idx = Math.floor(Math.random() * pool.length);
            const hole = pool.splice(idx, 1)[0];
            const pfp = Math.floor(Math.random() * PFP_COUNT);
            next = next.map(m => m.id === hole.id
              ? { ...m, active: true, whacked: false, pfp } : m);
            const hid = hole.id;
            schedule(`chaos_popup_${hid}`, () => {
              if (!guard()) return;
              setMoles(c => c.map(m => m.id === hid
                ? { ...m, active: false, whacked: false } : m));
            }, duration);
          }
          return next;
        });

        schedule(loopKey, () => runChaosPopup(loopKey), interval);
      };

      // Faster popcorn chains for chaos
      const startChaosPopcorn = (chainId: number) => {
        const doIteration = (hintHole: number = -1) => {
          if (!guard()) return;
          const pfp = Math.floor(Math.random() * PFP_COUNT);
          let holeId = -1;

          setMoles(curr => {
            const inactive = curr.filter(m => !m.active);
            if (inactive.length === 0) return curr;
            const preferred = hintHole !== -1 && !curr[hintHole]?.active
              ? curr.find(m => m.id === hintHole) ?? null : null;
            const target = preferred ?? inactive[Math.floor(Math.random() * inactive.length)];
            holeId = target.id;
            return curr.map(m => m.id === holeId
              ? { ...m, active: true, whacked: false, pfp } : m);
          });

          if (holeId === -1) {
            schedule(`cpc_${chainId}_retry`, () => doIteration(), 80);
            return;
          }

          const p = getProgress();
          const visMs = Math.max(280, 800 - 450 * p);
          const flyMs = Math.max(320, 700 - 300 * p);
          const srcHole = holeId;

          schedule(`cpc_${chainId}_sit`, () => {
            if (!guard()) return;
            let wasWhacked = false;
            setMoles(curr => {
              const m = curr.find(m => m.id === srcHole);
              if (!m || m.whacked) { wasWhacked = true; return curr; }
              return curr.map(m => m.id === srcHole
                ? { ...m, active: false, whacked: false } : m);
            });
            if (wasWhacked) {
              schedule(`cpc_${chainId}_whacked`, () => doIteration(), 200);
              return;
            }
            const destHole = Math.floor(Math.random() * TOTAL_HOLES);
            const flyId = `cfly_${chainId}_${Date.now()}`;
            setFlyingMoles(curr => [
              ...curr,
              { id: flyId, fromHole: srcHole, toHole: destHole, pfp, duration: flyMs },
            ]);
            schedule(`cpc_${chainId}_fly`, () => {
              if (!guard()) return;
              setFlyingMoles(curr => curr.filter(f => f.id !== flyId));
              doIteration(destHole);
            }, flyMs);
          }, visMs);
        };
        doIteration();
      };

      schedule('chaos_popup_loop', () => runChaosPopup('chaos_popup_loop'), 300);
      schedule('cpc_start_10', () => startChaosPopcorn(10), 500);
      schedule('cpc_start_11', () => startChaosPopcorn(11), 800);
      schedule('cpc_start_12', () => { if (guard()) startChaosPopcorn(12); },
        config.duration * 1000 * 0.4);
    }
  }, [stopAllTimers]);

  const beginRoundRef = useRef(beginRound);
  beginRoundRef.current = beginRound;

  useEffect(() => {
    if (status !== 'PLAYING' || timeLeft > 0) return;
    stopAllTimers();
    setMoles(freshMoles());
    setFlyingMoles([]);
    if (round < 3) {
      setStatus('TRANSITIONING');
      statusRef.current = 'TRANSITIONING';
    } else {
      setStatus('GAME_OVER');
      statusRef.current = 'GAME_OVER';
    }
  }, [timeLeft, status, round, stopAllTimers]);

  useEffect(() => {
    if (status !== 'TRANSITIONING') return;
    const nextRound = (round + 1) as GameRound;
    const t = setTimeout(() => beginRoundRef.current(nextRound), TRANSITION_MS);
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
      const prev1 = timeoutsRef.current.get(`popup_${id}`);
      if (prev1) clearTimeout(prev1);
      const prev2 = timeoutsRef.current.get(`chaos_popup_${id}`);
      if (prev2) clearTimeout(prev2);
      const t = setTimeout(() => {
        setMoles(c => c.map(m => m.id === id
          ? { ...m, active: false, whacked: false } : m));
      }, 300);
      timeoutsRef.current.set(`whack_${id}`, t);
      return prev.map(m => m.id === id ? { ...m, whacked: true } : m);
    });
  }, []);

  useEffect(() => { return () => stopAllTimers(); }, [stopAllTimers]);

  return { status, round, score, timeLeft, moles, flyingMoles, startGame, whackMole };
}
