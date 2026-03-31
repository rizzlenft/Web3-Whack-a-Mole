import { useState, useEffect, useRef, useCallback } from 'react';

export type GameStatus = 'START' | 'PLAYING' | 'TRANSITIONING' | 'GAME_OVER';
export type GameRound = 1 | 2 | 3;

export type MoleState = {
  id: number;
  active: boolean;
  whacked: boolean;
  jumping: boolean; // playing exit jump animation (flying out of hole)
  pfp: number;
};

const TOTAL_HOLES = 8;
export const PFP_COUNT = 2;
const TRANSITION_MS = 3000;
const JUMP_ANIM_MS = 280; // duration of the visible jump-out animation

const ROUND_CONFIG: Record<GameRound, { duration: number; mode: 'popup' | 'mix' | 'chaos' }> = {
  1: { duration: 20, mode: 'popup' },
  2: { duration: 20, mode: 'mix' },
  3: { duration: 10, mode: 'chaos' },
};

const freshMoles = (): MoleState[] =>
  Array.from({ length: TOTAL_HOLES }, (_, i) => ({
    id: i, active: false, whacked: false, jumping: false, pfp: 0
  }));

export function useGameEngine() {
  const [status, setStatus] = useState<GameStatus>('START');
  const [round, setRound] = useState<GameRound>(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [moles, setMoles] = useState<MoleState[]>(freshMoles());

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Map<string, timeout> so we can key by "mole_N", "jump_N", etc.
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const startTimeRef = useRef<number>(0);

  const statusRef = useRef<GameStatus>('START');
  const roundRef = useRef<GameRound>(1);

  const stopAllTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current.clear();
    timerRef.current = null;
    gameLoopRef.current = null;
  }, []);

  // Helper: set a named timeout, auto-cancelling any previous one with the same key
  const scheduleTimeout = (key: string, fn: () => void, delay: number) => {
    const existing = timeoutsRef.current.get(key);
    if (existing) clearTimeout(existing);
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

    // ── MOLE HOP: visible jump animation from hole to hole ────────────
    // Shows mole jumping OUT of fromId, then appears in a new inactive hole.
    const scheduleMoleHop = (fromId: number, pfp: number, hopCount: number) => {
      if (statusRef.current !== 'PLAYING' || roundRef.current !== r) return;
      const p = getProgress();
      // How long mole is visible at current hole before jumping (slows/speeds with round)
      const visibleMs = Math.max(450, 1300 - 750 * p);

      // Step 1: wait, then trigger jump exit animation
      scheduleTimeout(`vis_${fromId}`, () => {
        if (statusRef.current !== 'PLAYING' || roundRef.current !== r) return;
        // Mole whacked while waiting → skip jump
        setMoles(curr => {
          const m = curr.find(m => m.id === fromId);
          if (!m || !m.active || m.whacked) return curr;
          return curr.map(m => m.id === fromId ? { ...m, jumping: true } : m);
        });

        // Step 2: after jump animation plays, land in new hole
        scheduleTimeout(`jump_${fromId}`, () => {
          if (statusRef.current !== 'PLAYING' || roundRef.current !== r) return;
          let destId = -1;
          setMoles(curr => {
            const src = curr.find(m => m.id === fromId);
            // If it was whacked during the jump animation, just hide
            if (!src || src.whacked) {
              return curr.map(m => m.id === fromId ? { ...m, active: false, jumping: false } : m);
            }
            if (hopCount >= 4) {
              return curr.map(m => m.id === fromId ? { ...m, active: false, jumping: false } : m);
            }
            const inactive = curr.filter(m => !m.active && m.id !== fromId);
            if (inactive.length === 0) {
              return curr.map(m => m.id === fromId ? { ...m, active: false, jumping: false } : m);
            }
            const dest = inactive[Math.floor(Math.random() * inactive.length)];
            destId = dest.id;
            return curr.map(m => {
              if (m.id === fromId) return { ...m, active: false, jumping: false };
              if (m.id === dest.id) return { ...m, active: true, whacked: false, jumping: false, pfp };
              return m;
            });
          });
          // Continue hopping from new hole
          if (destId !== -1) scheduleMoleHop(destId, pfp, hopCount + 1);
        }, JUMP_ANIM_MS);
      }, visibleMs);
    };

    // ── ROUND 1: POPUP ONLY ───────────────────────────────────────────
    const runPopupLoop = () => {
      if (statusRef.current !== 'PLAYING' || roundRef.current !== r) return;
      const p = getProgress();
      const interval = Math.max(320, 1200 - 700 * p);
      const duration = Math.max(450, 2000 - 1300 * p);

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
          next = next.map(m => m.id === hole.id
            ? { ...m, active: true, whacked: false, jumping: false, pfp } : m);
          const hid = hole.id;
          scheduleTimeout(`mole_${hid}`, () => {
            setMoles(c => c.map(m => m.id === hid ? { ...m, active: false, whacked: false, jumping: false } : m));
          }, duration);
        }
        return next;
      });

      gameLoopRef.current = setTimeout(runPopupLoop, interval);
    };

    // ── ROUND 2: MIX — popup + hop, ramps from slow to fast ──────────
    const runMixLoop = () => {
      if (statusRef.current !== 'PLAYING' || roundRef.current !== r) return;
      const p = getProgress();
      // Pacing similar to round 1: slow start, ramps up
      const interval = Math.max(320, 1300 - 800 * p);
      const isHop = Math.random() > 0.45; // ~55% hoppers, ~45% popups

      setMoles(prev => {
        const inactive = prev.filter(m => !m.active);
        if (inactive.length === 0) return prev;
        const count = p > 0.65 && Math.random() > 0.55 ? 2 : 1;
        let next = [...prev];
        const pool = [...inactive];
        for (let i = 0; i < Math.min(count, pool.length); i++) {
          const idx = Math.floor(Math.random() * pool.length);
          const hole = pool.splice(idx, 1)[0];
          const pfp = Math.floor(Math.random() * PFP_COUNT);
          next = next.map(m => m.id === hole.id
            ? { ...m, active: true, whacked: false, jumping: false, pfp } : m);

          if (isHop) {
            // Hopper: visible briefly, then jumps to another hole
            scheduleMoleHop(hole.id, pfp, 0);
          } else {
            // Pure popup: stays for a duration then hides
            const duration = Math.max(500, 2000 - 1200 * p);
            const hid = hole.id;
            scheduleTimeout(`mole_${hid}`, () => {
              setMoles(c => c.map(m => m.id === hid
                ? { ...m, active: false, whacked: false, jumping: false } : m));
            }, duration);
          }
        }
        return next;
      });

      gameLoopRef.current = setTimeout(runMixLoop, interval);
    };

    // ── ROUND 3: CHAOS ────────────────────────────────────────────────
    const runChaosLoop = () => {
      if (statusRef.current !== 'PLAYING' || roundRef.current !== r) return;
      const p = getProgress();
      const interval = Math.max(130, 350 - 190 * p);

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
          const isHop = Math.random() > 0.4;
          next = next.map(m => m.id === hole.id
            ? { ...m, active: true, whacked: false, jumping: false, pfp } : m);

          if (isHop) {
            // Fast hop in chaos
            const hid = hole.id;
            const visMs = Math.max(180, 380 - 170 * p);
            scheduleTimeout(`vis_${hid}`, () => {
              if (statusRef.current !== 'PLAYING') return;
              setMoles(curr => curr.map(m => m.id === hid && m.active && !m.whacked
                ? { ...m, jumping: true } : m));
              scheduleTimeout(`jump_${hid}`, () => {
                if (statusRef.current !== 'PLAYING') return;
                let destId = -1;
                setMoles(curr => {
                  const inact = curr.filter(m => !m.active && m.id !== hid);
                  if (inact.length === 0) return curr.map(m => m.id === hid ? { ...m, active: false, jumping: false } : m);
                  const dest = inact[Math.floor(Math.random() * inact.length)];
                  destId = dest.id;
                  return curr.map(m => {
                    if (m.id === hid) return { ...m, active: false, jumping: false };
                    if (m.id === dest.id) return { ...m, active: true, whacked: false, jumping: false, pfp };
                    return m;
                  });
                });
                if (destId !== -1) {
                  const dur = Math.max(150, 420 - 180 * p);
                  scheduleTimeout(`mole_${destId}`, () => {
                    setMoles(c => c.map(m => m.id === destId
                      ? { ...m, active: false, whacked: false, jumping: false } : m));
                  }, dur);
                }
              }, JUMP_ANIM_MS);
            }, visMs);
          } else {
            const hid = hole.id;
            const dur = Math.max(160, 500 - 200 * p);
            scheduleTimeout(`mole_${hid}`, () => {
              setMoles(c => c.map(m => m.id === hid
                ? { ...m, active: false, whacked: false, jumping: false } : m));
            }, dur);
          }
        }
        return next;
      });

      gameLoopRef.current = setTimeout(runChaosLoop, interval);
    };

    const loopFn = config.mode === 'popup' ? runPopupLoop
      : config.mode === 'mix' ? runMixLoop
      : runChaosLoop;
    gameLoopRef.current = setTimeout(loopFn, 800);
  }, [stopAllTimers]);

  const beginRoundRef = useRef(beginRound);
  beginRoundRef.current = beginRound;

  // Round-end logic
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

  // Auto-advance after transition
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
      // Clear any pending hide/hop timers for this hole
      const existing = timeoutsRef.current.get(`mole_${id}`);
      if (existing) clearTimeout(existing);
      const visTimer = timeoutsRef.current.get(`vis_${id}`);
      if (visTimer) clearTimeout(visTimer);
      const jumpTimer = timeoutsRef.current.get(`jump_${id}`);
      if (jumpTimer) clearTimeout(jumpTimer);
      // Schedule the whacked mole to disappear
      scheduleTimeout(`mole_${id}`, () => {
        setMoles(c => c.map(m => m.id === id ? { ...m, active: false, whacked: false, jumping: false } : m));
      }, 300);
      return prev.map(m => m.id === id ? { ...m, whacked: true, jumping: false } : m);
    });
  }, []);

  useEffect(() => {
    return () => { stopAllTimers(); };
  }, [stopAllTimers]);

  return { status, round, score, timeLeft, moles, startGame, whackMole };
}
