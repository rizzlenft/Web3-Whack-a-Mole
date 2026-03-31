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

const ROUND_CONFIG: Record<GameRound, { duration: number }> = {
  1: { duration: 20 },
  2: { duration: 20 },
  3: { duration: 10 },
};

const freshMoles = (): MoleState[] =>
  Array.from({ length: TOTAL_HOLES }, (_, i) => ({
    id: i, active: false, whacked: false, pfp: 0
  }));

export function useGameEngine() {
  const [status, setStatus] = useState<GameStatus>('START');
  const [round, setRound] = useState<GameRound>(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [moles, setMoles] = useState<MoleState[]>(freshMoles());

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

  // Set a named timeout; cancels any prior timeout with the same key
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

    // ── ROUND 1 mechanic: popup-and-stay ─────────────────────────────
    // Moles pop up, wait to be clicked, then sink back down.
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

    // ── ROUND 2 mechanic: popcorn chain ──────────────────────────────
    // A single PFP repeatedly pops up from a random hole, then sinks
    // into a new random hole (possibly the same one) — like popcorn.
    const runPopcornChain = (chainId: number) => {
      if (!guard()) return;
      const p = getProgress();
      const visibleMs = Math.max(500, 1500 - 900 * p);  // how long mole stays up
      const gapMs = Math.max(80, 200 - 110 * p);          // gap before next pop
      const pfp = Math.floor(Math.random() * PFP_COUNT);

      let activatedHole = -1;

      setMoles(curr => {
        const inactive = curr.filter(m => !m.active);
        if (inactive.length === 0) return curr;
        const target = inactive[Math.floor(Math.random() * inactive.length)];
        activatedHole = target.id;
        return curr.map(m => m.id === target.id
          ? { ...m, active: true, whacked: false, pfp } : m);
      });

      if (activatedHole === -1) {
        // All holes busy — retry quickly
        schedule(`pc_retry_${chainId}`, () => runPopcornChain(chainId), 120);
        return;
      }

      const hid = activatedHole;
      schedule(`pc_${chainId}`, () => {
        if (!guard()) return;
        setMoles(curr => {
          const m = curr.find(m => m.id === hid);
          if (!m || m.whacked) return curr; // already handled by whackMole
          return curr.map(m => m.id === hid
            ? { ...m, active: false, whacked: false } : m);
        });
        // Brief gap, then pop up from a brand-new random hole
        schedule(`pc_gap_${chainId}`, () => runPopcornChain(chainId), gapMs);
      }, visibleMs);
    };

    // ── Start the round loops ─────────────────────────────────────────

    if (r === 1) {
      // Round 1: pure popup-and-stay
      schedule('popup_loop', () => runPopupLoop('popup_loop'), 800);
    }

    if (r === 2) {
      // Round 2: pure popcorn — starts with 1 chain, adds more over time
      schedule('pc_start_0', () => runPopcornChain(0), 600);

      // Add 2nd popcorn chain at 40% through the round
      schedule('pc_spawn_1', () => {
        if (!guard()) return;
        runPopcornChain(1);
      }, config.duration * 1000 * 0.4);

      // Add 3rd popcorn chain at 75% through
      schedule('pc_spawn_2', () => {
        if (!guard()) return;
        runPopcornChain(2);
      }, config.duration * 1000 * 0.75);
    }

    if (r === 3) {
      // Round 3: popup-and-stay (round 1) PLUS popcorn chains (round 2), all fast
      // Popup loop — more aggressive pacing
      const runChaosPopup = (loopKey: string) => {
        if (!guard()) return;
        const p = getProgress();
        const interval = Math.max(200, 700 - 400 * p);
        const duration = Math.max(280, 900 - 550 * p);

        setMoles(prev => {
          const inactive = prev.filter(m => !m.active);
          if (inactive.length === 0) return prev;
          const count = Math.random() > 0.45 ? 2 : 1;
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

      // Popcorn chains — faster timing
      const runChaosPopcorn = (chainId: number) => {
        if (!guard()) return;
        const p = getProgress();
        const visibleMs = Math.max(250, 800 - 500 * p);
        const gapMs = Math.max(50, 120 - 60 * p);
        const pfp = Math.floor(Math.random() * PFP_COUNT);
        let activatedHole = -1;

        setMoles(curr => {
          const inactive = curr.filter(m => !m.active);
          if (inactive.length === 0) return curr;
          const target = inactive[Math.floor(Math.random() * inactive.length)];
          activatedHole = target.id;
          return curr.map(m => m.id === target.id
            ? { ...m, active: true, whacked: false, pfp } : m);
        });

        if (activatedHole === -1) {
          schedule(`cpc_retry_${chainId}`, () => runChaosPopcorn(chainId), 80);
          return;
        }

        const hid = activatedHole;
        schedule(`cpc_${chainId}`, () => {
          if (!guard()) return;
          setMoles(curr => {
            const m = curr.find(m => m.id === hid);
            if (!m || m.whacked) return curr;
            return curr.map(m => m.id === hid
              ? { ...m, active: false, whacked: false } : m);
          });
          schedule(`cpc_gap_${chainId}`, () => runChaosPopcorn(chainId), gapMs);
        }, visibleMs);
      };

      // Start everything simultaneously
      schedule('chaos_popup_loop', () => runChaosPopup('chaos_popup_loop'), 400);
      schedule('cpc_start_0', () => runChaosPopcorn(10), 500);
      schedule('cpc_start_1', () => runChaosPopcorn(11), 700);
      schedule('cpc_start_2', () => {
        if (!guard()) return;
        runChaosPopcorn(12);
      }, config.duration * 1000 * 0.35);
    }
  }, [stopAllTimers]);

  const beginRoundRef = useRef(beginRound);
  beginRoundRef.current = beginRound;

  // Round-end effect
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

  // Auto-advance from transition
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
      // Clear any pending hide timer for this hole
      const prev1 = timeoutsRef.current.get(`popup_${id}`);
      if (prev1) clearTimeout(prev1);
      const prev2 = timeoutsRef.current.get(`chaos_popup_${id}`);
      if (prev2) clearTimeout(prev2);
      // Schedule disappear
      const t = setTimeout(() => {
        setMoles(c => c.map(m => m.id === id
          ? { ...m, active: false, whacked: false } : m));
      }, 300);
      timeoutsRef.current.set(`whack_${id}`, t);
      return prev.map(m => m.id === id ? { ...m, whacked: true } : m);
    });
  }, []);

  useEffect(() => { return () => stopAllTimers(); }, [stopAllTimers]);

  return { status, round, score, timeLeft, moles, startGame, whackMole };
}
