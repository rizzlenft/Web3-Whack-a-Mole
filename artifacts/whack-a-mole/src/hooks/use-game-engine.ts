import { useState, useEffect, useRef, useCallback } from 'react';

export type GameStatus = 'START' | 'COUNTDOWN' | 'PLAYING' | 'TRANSITIONING' | 'GAME_OVER';
export type GameRound = 1 | 2 | 3;
export type MoleType = 'normal' | 'golden' | 'skull';

export type MoleState = {
  id: number;
  active: boolean;
  whacked: boolean;
  pfp: number;
  moleType: MoleType;
};

export type FlyingMoleEntry = {
  id: string;
  fromHole: number;
  toHole: number;
  pfp: number;
  duration: number;
};

const TOTAL_HOLES = 8;
export const PFP_COUNT = 2;
const TRANSITION_MS = 3000;
export const MOLE_POINTS: Record<MoleType, number> = { normal: 1, golden: 5, skull: -1 };

const ROUND_CONFIG: Record<GameRound, { duration: number }> = {
  1: { duration: 20 },
  2: { duration: 20 },
  3: { duration: 10 },
};

const freshMoles = (): MoleState[] =>
  Array.from({ length: TOTAL_HOLES }, (_, i) => ({
    id: i, active: false, whacked: false, pfp: 0, moleType: 'normal',
  }));

function pickMoleType(): MoleType {
  const r = Math.random();
  if (r < 0.06) return 'golden'; // 6% golden
  if (r < 0.12) return 'skull';  // 6% skull
  return 'normal';
}

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

  const scheduleRef = useRef((key: string, fn: () => void, delay: number) => {
    const prev = timeoutsRef.current.get(key);
    if (prev) clearTimeout(prev);
    const t = setTimeout(fn, delay);
    timeoutsRef.current.set(key, t);
  });

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

    const sched = scheduleRef.current;
    const getProgress = () =>
      Math.min((Date.now() - startTimeRef.current) / (config.duration * 1000), 1);
    const guard = () => statusRef.current === 'PLAYING' && roundRef.current === r;

    // ── Round 1: classic popup-and-stay ──────────────────────────────
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
          const moleType = pickMoleType();
          const holeDuration = moleType === 'golden' ? Math.min(duration, 900) : duration;
          next = next.map(m => m.id === hole.id
            ? { ...m, active: true, whacked: false, pfp, moleType } : m);
          const hid = hole.id;
          sched(`popup_${hid}`, () => {
            if (!guard()) return;
            setMoles(c => c.map(m => m.id === hid
              ? { ...m, active: false, whacked: false } : m));
          }, holeDuration);
        }
        return next;
      });

      sched(loopKey, () => runPopupLoop(loopKey), interval);
    };

    // ── Round 2: arc-flying popcorn chains ───────────────────────────
    const startPopcornChain = (chainId: number) => {
      const doIteration = (hintHole: number = -1) => {
        if (!guard()) return;
        const pfp = Math.floor(Math.random() * PFP_COUNT);
        const p = getProgress();
        const sitMs = Math.max(200, 380 - 150 * p);
        const flyMs = Math.max(520, 950 - 350 * p);

        setMoles(curr => {
          const inactive = curr.filter(m => !m.active);
          if (inactive.length === 0) {
            sched(`pc_${chainId}_retry`, () => doIteration(), 120);
            return curr;
          }
          const preferred = hintHole !== -1 && !curr[hintHole]?.active
            ? curr.find(m => m.id === hintHole) ?? null : null;
          const target = preferred ?? inactive[Math.floor(Math.random() * inactive.length)];
          const holeId = target.id;
          const moleType = pickMoleType();

          sched(`pc_${chainId}_sit`, () => {
            if (!guard()) return;
            setMoles(inner => {
              const m = inner.find(m => m.id === holeId);
              if (!m || m.whacked) {
                sched(`pc_${chainId}_afterwhack`, () => doIteration(), 200);
                return inner;
              }
              const destHole = Math.floor(Math.random() * TOTAL_HOLES);
              const flyId = `fly_${chainId}_${Date.now()}`;
              setFlyingMoles(fms => [
                ...fms,
                { id: flyId, fromHole: holeId, toHole: destHole, pfp, duration: flyMs },
              ]);
              sched(`pc_${chainId}_fly`, () => {
                if (!guard()) return;
                setFlyingMoles(fms => fms.filter(f => f.id !== flyId));
                doIteration(destHole);
              }, flyMs);
              return inner.map(m => m.id === holeId
                ? { ...m, active: false, whacked: false } : m);
            });
          }, sitMs);

          return curr.map(m => m.id === holeId
            ? { ...m, active: true, whacked: false, pfp, moleType } : m);
        });
      };

      doIteration();
    };

    // ── Round 3: chaos ────────────────────────────────────────────────
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
          const moleType = pickMoleType();
          next = next.map(m => m.id === hole.id
            ? { ...m, active: true, whacked: false, pfp, moleType } : m);
          const hid = hole.id;
          sched(`chaos_popup_${hid}`, () => {
            if (!guard()) return;
            setMoles(c => c.map(m => m.id === hid
              ? { ...m, active: false, whacked: false } : m));
          }, duration);
        }
        return next;
      });

      sched(loopKey, () => runChaosPopup(loopKey), interval);
    };

    const startChaosPopcorn = (chainId: number) => {
      const doIteration = (hintHole: number = -1) => {
        if (!guard()) return;
        const pfp = Math.floor(Math.random() * PFP_COUNT);
        const p = getProgress();
        const sitMs = Math.max(150, 280 - 120 * p);
        const flyMs = Math.max(300, 680 - 280 * p);

        setMoles(curr => {
          const inactive = curr.filter(m => !m.active);
          if (inactive.length === 0) {
            sched(`cpc_${chainId}_retry`, () => doIteration(), 80);
            return curr;
          }
          const preferred = hintHole !== -1 && !curr[hintHole]?.active
            ? curr.find(m => m.id === hintHole) ?? null : null;
          const target = preferred ?? inactive[Math.floor(Math.random() * inactive.length)];
          const holeId = target.id;
          const moleType = pickMoleType();

          sched(`cpc_${chainId}_sit`, () => {
            if (!guard()) return;
            setMoles(inner => {
              const m = inner.find(m => m.id === holeId);
              if (!m || m.whacked) {
                sched(`cpc_${chainId}_afterwhack`, () => doIteration(), 150);
                return inner;
              }
              const destHole = Math.floor(Math.random() * TOTAL_HOLES);
              const flyId = `cfly_${chainId}_${Date.now()}`;
              setFlyingMoles(fms => [
                ...fms,
                { id: flyId, fromHole: holeId, toHole: destHole, pfp, duration: flyMs },
              ]);
              sched(`cpc_${chainId}_fly`, () => {
                if (!guard()) return;
                setFlyingMoles(fms => fms.filter(f => f.id !== flyId));
                doIteration(destHole);
              }, flyMs);
              return inner.map(m => m.id === holeId
                ? { ...m, active: false, whacked: false } : m);
            });
          }, sitMs);

          return curr.map(m => m.id === holeId
            ? { ...m, active: true, whacked: false, pfp, moleType } : m);
        });
      };

      doIteration();
    };

    // ── Start the round ────────────────────────────────────────────────
    if (r === 1) {
      sched('popup_loop', () => runPopupLoop('popup_loop'), 600);
    }
    if (r === 2) {
      sched('pc_start_0', () => startPopcornChain(0), 200);
      sched('pc_start_1', () => startPopcornChain(1), 500);
      sched('pc_start_2', () => startPopcornChain(2), 800);
    }
    if (r === 3) {
      sched('chaos_popup_loop', () => runChaosPopup('chaos_popup_loop'), 300);
      sched('cpc_start_10', () => startChaosPopcorn(10), 450);
      sched('cpc_start_11', () => startChaosPopcorn(11), 700);
      sched('cpc_start_12', () => {
        if (guard()) startChaosPopcorn(12);
      }, config.duration * 1000 * 0.35);
    }
  }, [stopAllTimers]);

  const beginRoundRef = useRef(beginRound);
  beginRoundRef.current = beginRound;

  // Round end
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

  // Auto-advance from transition screen
  useEffect(() => {
    if (status !== 'TRANSITIONING') return;
    const nextRound = (round + 1) as GameRound;
    const t = setTimeout(() => beginRoundRef.current(nextRound), TRANSITION_MS);
    return () => clearTimeout(t);
  }, [status, round]);

  const startGame = useCallback(() => {
    setScore(0);
    setStatus('COUNTDOWN');
    statusRef.current = 'COUNTDOWN';
  }, []);

  const whackMole = useCallback((id: number) => {
    setMoles(prev => {
      const mole = prev.find(m => m.id === id);
      if (!mole || !mole.active || mole.whacked) return prev;
      const pts = MOLE_POINTS[mole.moleType];
      setScore(s => Math.max(0, s + pts));
      const t1 = timeoutsRef.current.get(`popup_${id}`);
      if (t1) clearTimeout(t1);
      const t2 = timeoutsRef.current.get(`chaos_popup_${id}`);
      if (t2) clearTimeout(t2);
      const t = setTimeout(() => {
        setMoles(c => c.map(m => m.id === id
          ? { ...m, active: false, whacked: false } : m));
      }, 300);
      timeoutsRef.current.set(`whack_${id}`, t);
      return prev.map(m => m.id === id ? { ...m, whacked: true } : m);
    });
  }, []);

  // Countdown → begin round 1
  const onCountdownDone = useCallback(() => {
    beginRound(1);
  }, [beginRound]);

  useEffect(() => { return () => stopAllTimers(); }, [stopAllTimers]);

  return { status, round, score, timeLeft, moles, flyingMoles, startGame, whackMole, onCountdownDone };
}
