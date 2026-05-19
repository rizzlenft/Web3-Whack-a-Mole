import { useRef, useCallback } from 'react';

// Web Audio API sound engine — no external deps, no file loading.
// All sounds are synthesised procedurally.

let _ctx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

function gain(ctx: AudioContext, value: number) {
  const g = ctx.createGain();
  g.gain.value = value;
  return g;
}

// ── Individual synth sounds ──────────────────────────────────────────

export function playBonk() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    // Punchy thump: sine + distorted square
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const g = gain(ctx, 0.45);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(220, t);
    osc1.frequency.exponentialRampToValueAtTime(60, t + 0.12);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(180, t);
    osc2.frequency.exponentialRampToValueAtTime(50, t + 0.10);
    const g2 = gain(ctx, 0.15);
    osc1.connect(g); osc2.connect(g2); g.connect(ctx.destination); g2.connect(ctx.destination);
    g.gain.setValueAtTime(0.45, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    g2.gain.setValueAtTime(0.15, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc1.start(t); osc1.stop(t + 0.2);
    osc2.start(t); osc2.stop(t + 0.15);
  } catch {}
}

export function playMiss() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    // Sad descending blip
    const osc = ctx.createOscillator();
    const g = gain(ctx, 0.18);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.25);
    osc.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc.start(t); osc.stop(t + 0.3);
  } catch {}
}

export function playGoldenBonk() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    // Ascending sparkle arpeggio
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = gain(ctx, 0.22);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.07);
      osc.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.22, t + i * 0.07);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.18);
      osc.start(t + i * 0.07); osc.stop(t + i * 0.07 + 0.2);
    });
  } catch {}
}

export function playCombo(comboCount: number) {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const freqs = [440, 554, 659, 880, 1108];
    const freq = freqs[Math.min(comboCount - 2, freqs.length - 1)];
    const osc = ctx.createOscillator();
    const g = gain(ctx, 0.25);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.setValueAtTime(freq * 1.5, t + 0.06);
    osc.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.start(t); osc.stop(t + 0.2);
  } catch {}
}

export function playRoundStart() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    // Rising 3-note fanfare
    [330, 440, 660].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = gain(ctx, 0.3);
      osc.type = 'square';
      osc.frequency.value = f;
      osc.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.3, t + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.14);
      osc.start(t + i * 0.12); osc.stop(t + i * 0.12 + 0.16);
    });
  } catch {}
}

export function playCountdownBeep(isFinal: boolean) {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const freq = isFinal ? 880 : 440;
    const osc = ctx.createOscillator();
    const g = gain(ctx, 0.3);
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + (isFinal ? 0.4 : 0.12));
    osc.start(t); osc.stop(t + (isFinal ? 0.45 : 0.15));
  } catch {}
}

export function playTimerTick() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = gain(ctx, 0.15);
    osc.type = 'sine';
    osc.frequency.value = 880;
    osc.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.start(t); osc.stop(t + 0.1);
  } catch {}
}

export function playGameOver() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    // Sad trombone descend
    [440, 370, 311, 220].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = gain(ctx, 0.28);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t + i * 0.22);
      osc.frequency.linearRampToValueAtTime(f * 0.85, t + i * 0.22 + 0.22);
      osc.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.28, t + i * 0.22);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.22 + 0.25);
      osc.start(t + i * 0.22); osc.stop(t + i * 0.22 + 0.28);
    });
  } catch {}
}

export function playMolePop() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    // Quick rising pop
    const osc = ctx.createOscillator();
    const g = gain(ctx, 0.08);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(500, t + 0.06);
    osc.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.start(t); osc.stop(t + 0.1);
  } catch {}
}

export function playFlyWhoosh() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(1200, t);
    bpf.frequency.exponentialRampToValueAtTime(400, t + 0.25);
    bpf.Q.value = 2;
    const g = gain(ctx, 0.12);
    src.connect(bpf); bpf.connect(g); g.connect(ctx.destination);
    src.start(t); src.stop(t + 0.28);
  } catch {}
}

// Hook exposing all sounds with stable refs
export function useSound() {
  const bonk        = useCallback(playBonk, []);
  const miss        = useCallback(playMiss, []);
  const goldenBonk  = useCallback(playGoldenBonk, []);
  const combo       = useCallback(playCombo, []);
  const roundStart  = useCallback(playRoundStart, []);
  const countdownBeep = useCallback(playCountdownBeep, []);
  const timerTick   = useCallback(playTimerTick, []);
  const gameOver    = useCallback(playGameOver, []);
  const molePop     = useCallback(playMolePop, []);
  const flyWhoosh   = useCallback(playFlyWhoosh, []);

  return { bonk, miss, goldenBonk, combo, roundStart, countdownBeep, timerTick, gameOver, molePop, flyWhoosh };
}
