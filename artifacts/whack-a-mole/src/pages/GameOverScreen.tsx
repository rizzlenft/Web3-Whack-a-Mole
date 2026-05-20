import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubmitScore } from '@workspace/api-client-react';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, CheckCircle2, Zap, Share2, Star } from 'lucide-react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { playGameOver } from '@/hooks/use-sound';

const PB_KEY = 'w3wam_pb';

function getPersonalBest(): number {
  try { return parseInt(localStorage.getItem(PB_KEY) ?? '0', 10) || 0; } catch { return 0; }
}
function savePersonalBest(score: number) {
  try { localStorage.setItem(PB_KEY, String(score)); } catch {}
}

function getFlavorText(s: number): { text: string; color: string } {
  if (s === 0)  return { text: 'ZERO. ABSOLUTE ZERO. 💀',        color: 'text-destructive' };
  if (s <= 5)   return { text: 'NGMI. DOWN ONLY FOR YOU. 📉',     color: 'text-destructive' };
  if (s <= 12)  return { text: 'MID AT BEST. PROBABLY REKT. 🫡',  color: 'text-yellow-400' };
  if (s <= 20)  return { text: 'RESPECTABLE. WAGMI MAYBE. 📈',     color: 'text-accent' };
  if (s <= 30)  return { text: 'BULLISH. ACTUAL ALPHA. 🔥',        color: 'text-primary' };
  if (s <= 50)  return { text: 'LEGENDARY CHAD DETECTED. 👑',      color: 'text-secondary' };
  return          { text: 'ARE YOU EVEN HUMAN SER?? 🤖',           color: 'text-yellow-300' };
}

const LETTERS_GAME = ['G','A','M','E'];
const LETTERS_OVER = ['O','V','E','R'];

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

export function GameOverScreen({ score, onRestart }: GameOverScreenProps) {
  const [playerName, setPlayerName] = useState('');
  const [submitted, setSubmitted]   = useState(false);
  const [copied, setCopied]         = useState(false);
  const [shareText, setShareText]   = useState<string | null>(null);
  const queryClient = useQueryClient();
  const flavor = getFlavorText(score);

  const prevPB  = getPersonalBest();
  const isNewPB = score > prevPB;
  const pbGap   = prevPB > 0 && !isNewPB ? prevPB - score : 0;

  useEffect(() => {
    if (isNewPB) savePersonalBest(score);
  }, [isNewPB, score]);

  const { mutate: submitScore, isPending } = useSubmitScore({
    mutation: {
      onSuccess: () => {
        setSubmitted(true);
        queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      }
    }
  });

  useEffect(() => {
    playGameOver();
    const end = Date.now() + 2400;
    const burst = () => {
      confetti({ particleCount: 5, angle: 60,  spread: 55, origin: { x: 0 }, colors: ['#ff00ff','#00ffff','#39ff14'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ff00ff','#00ffff','#39ff14'] });
      if (Date.now() < end) requestAnimationFrame(burst);
    };
    const t = setTimeout(burst, 180);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isNewPB) return;
    setTimeout(() => {
      confetti({ particleCount: 90, spread: 110, origin: { y: 0.35 }, colors: ['#fbbf24','#f59e0b','#fde68a'] });
    }, 500);
  }, [isNewPB]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isPending || submitted) return;
    submitScore({ data: { playerName: playerName.trim(), score } });
  };

  const SHARE_MSG = `🐀 Web3 Whack-A-Mole — I scored ${score.toString().padStart(4, '0')} bonks!\nCan you beat me? Bonk the scammers, save the chain 📉`;

  const handleShare = async () => {
    // 1. Try native share (works on mobile and desktop if not in a locked iframe)
    if (navigator.share) {
      try { await navigator.share({ title: 'Web3 Whack-A-Mole', text: SHARE_MSG }); return; } catch {}
    }
    // 2. Try clipboard API (may be blocked in cross-origin iframes)
    try {
      await navigator.clipboard.writeText(SHARE_MSG);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      return;
    } catch {}
    // 3. Fallback: show selectable text overlay so the user can copy manually
    setShareText(SHARE_MSG);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-4 py-2 text-center relative game-bg overflow-hidden">

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* Animated radial glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.4, 0.75, 0.4] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 35%, hsl(315,100%,60%,0.18) 0%, transparent 70%)' }}
      />

      {/* ── GAME OVER letters ──────────────────────────────── */}
      <div className="relative z-10">
        <div className="flex justify-center gap-1.5 md:gap-2.5">
          {LETTERS_GAME.map((l, i) => (
            <motion.span
              key={`g${i}`}
              initial={{ y: -60, opacity: 0, rotate: -20 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.55, delay: i * 0.07 }}
              className="font-display text-4xl md:text-5xl text-destructive select-none"
              style={{ textShadow: '3px 3px 0 hsl(315,100%,60%), -2px -2px 0 hsl(185,100%,50%), 0 0 20px hsl(0,100%,60%)' }}
            >
              {l}
            </motion.span>
          ))}
        </div>
        <div className="flex justify-center gap-1.5 md:gap-2.5">
          {LETTERS_OVER.map((l, i) => (
            <motion.span
              key={`o${i}`}
              initial={{ y: 60, opacity: 0, rotate: 20 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.55, delay: 0.28 + i * 0.07 }}
              className="font-display text-4xl md:text-5xl text-destructive select-none"
              style={{ textShadow: '3px 3px 0 hsl(315,100%,60%), -2px -2px 0 hsl(185,100%,50%), 0 0 20px hsl(0,100%,60%)' }}
            >
              {l}
            </motion.span>
          ))}
        </div>
      </div>

      {/* ── Score ────────────────────────────────────────────── */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.65, delay: 0.58 }}
        className="relative z-10 flex flex-col items-center gap-1.5"
      >
        <div className="bg-black/85 border-4 border-primary rounded px-8 py-3 box-shadow-neon">
          <span className="font-display text-[9px] text-secondary tracking-widest block mb-0.5">FINAL SCORE</span>
          <span
            className="font-sans text-5xl md:text-7xl text-primary font-bold tracking-widest"
            style={{ textShadow: '0 0 12px hsl(315,100%,60%), 0 0 35px hsl(315,100%,60%)' }}
          >
            {score.toString().padStart(4, '0')}
          </span>
        </div>

        {/* PB row */}
        <AnimatePresence>
          {isNewPB ? (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.7, delay: 0.72 }}
              className="flex items-center gap-1.5 bg-yellow-400/20 border-2 border-yellow-400/70 rounded-full px-4 py-1.5"
            >
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="font-display text-[9px] text-yellow-300 tracking-widest">NEW PERSONAL BEST!</span>
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            </motion.div>
          ) : prevPB > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-2"
            >
              <span className="font-display text-[8px] text-zinc-500 tracking-widest">
                PB: {prevPB.toString().padStart(4, '0')}
              </span>
              {pbGap > 0 && (
                <span className="font-display text-[8px] text-destructive tracking-widest">
                  ({pbGap} MORE TO BEAT)
                </span>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className={`font-sans text-sm md:text-base ${flavor.color} uppercase tracking-widest`}
        >
          {flavor.text}
        </motion.p>
      </motion.div>

      {/* ── Submit form ──────────────────────────────────────── */}
      <motion.div
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.72 }}
        className="relative z-10 w-full max-w-xs bg-black/88 border-4 border-secondary rounded box-shadow-cyan px-4 py-3"
      >
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form key="form" exit={{ opacity: 0, scale: 0.9 }} onSubmit={handleSubmit} className="flex flex-col gap-2.5">
              <label className="font-display text-secondary text-[9px] tracking-widest">ENTER NAME TO CLAIM GLORY</label>
              <input
                type="text"
                maxLength={15}
                value={playerName}
                onChange={e => setPlayerName(e.target.value.toUpperCase())}
                placeholder="YOUR_NAME"
                className="bg-zinc-950 border-b-4 border-primary text-primary font-display text-xl p-2 text-center focus:outline-none focus:border-secondary transition-colors placeholder:text-zinc-700 uppercase tracking-widest w-full"
                required
                autoFocus
              />
              <motion.button
                type="submit"
                disabled={isPending || !playerName.trim()}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="w-full py-2.5 font-display text-[10px] tracking-widest text-black bg-primary rounded flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed neon-border-pulse"
              >
                <Zap className="w-3.5 h-3.5" />
                {isPending ? 'SAVING...' : 'SUBMIT SCORE'}
              </motion.button>
            </motion.form>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="flex flex-col items-center gap-2 py-2 text-accent"
            >
              <CheckCircle2 className="w-10 h-10 animate-bounce drop-shadow-[0_0_12px_currentColor]" />
              <span className="font-display text-[10px] text-shadow-green tracking-widest">SCORE RECORDED!</span>
              <span className="font-sans text-sm text-zinc-400">You're on the board, ser 🫡</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Action buttons ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.98 }}
        className="flex gap-2 w-full max-w-xs z-10"
      >
        <motion.button
          onClick={onRestart}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="flex-1 py-2.5 font-display text-[10px] text-secondary-foreground bg-secondary tracking-widest flex items-center justify-center gap-1.5 rounded border-b-4 border-secondary/50 box-shadow-cyan"
        >
          <RotateCcw className="w-3 h-3" /> RETRY
        </motion.button>

        <motion.button
          onClick={handleShare}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="flex-1 py-2.5 font-display text-[10px] text-accent tracking-widest flex items-center justify-center gap-1.5 rounded border-2 border-accent/60 hover:border-accent hover:bg-accent/10 transition-colors box-shadow-green"
        >
          <Share2 className="w-3 h-3" />
          {copied ? 'COPIED!' : 'SHARE'}
        </motion.button>

        <Link href="/leaderboard" className="flex-1">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="w-full py-2.5 font-display text-[10px] text-primary border-2 border-primary/60 tracking-widest flex items-center justify-center gap-1.5 rounded hover:border-primary hover:bg-primary/10 transition-colors"
          >
            <Trophy className="w-3 h-3" /> RANKS
          </motion.button>
        </Link>
      </motion.div>

      {/* ── Share text fallback (iframe / clipboard blocked) ─── */}
      <AnimatePresence>
        {shareText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[80] flex items-center justify-center bg-black/80 px-6"
            onClick={() => setShareText(null)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-zinc-950 border-4 border-secondary rounded box-shadow-cyan p-4 flex flex-col gap-3"
            >
              <span className="font-display text-[9px] text-secondary tracking-widest">COPY & SHARE</span>
              <textarea
                readOnly
                rows={3}
                value={shareText}
                onFocus={e => e.target.select()}
                className="w-full bg-zinc-900 border-2 border-secondary/40 text-zinc-200 font-sans text-sm p-2 rounded resize-none focus:outline-none focus:border-secondary"
              />
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    try { await navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
                    setShareText(null);
                  }}
                  className="flex-1 py-2 font-display text-[9px] text-black bg-secondary rounded tracking-widest"
                >
                  {copied ? 'COPIED!' : 'COPY TEXT'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShareText(null)}
                  className="flex-1 py-2 font-display text-[9px] text-zinc-400 border border-zinc-700 rounded tracking-widest"
                >
                  CLOSE
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
