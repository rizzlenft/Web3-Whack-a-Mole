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
  if (s === 0)  return { text: 'ZERO. ABSOLUTE ZERO. 💀',          color: 'text-destructive' };
  if (s <= 5)   return { text: 'NGMI. DOWN ONLY FOR YOU. 📉',       color: 'text-destructive' };
  if (s <= 12)  return { text: 'MID AT BEST. PROBABLY REKT. 🫡',    color: 'text-yellow-400' };
  if (s <= 20)  return { text: 'RESPECTABLE. WAGMI MAYBE. 📈',       color: 'text-accent' };
  if (s <= 30)  return { text: 'BULLISH. ACTUAL ALPHA. 🔥',          color: 'text-primary' };
  if (s <= 50)  return { text: 'LEGENDARY CHAD DETECTED. 👑',        color: 'text-secondary' };
  return          { text: 'ARE YOU EVEN HUMAN SER?? 🤖',             color: 'text-yellow-300' };
}

const G = ['G','A','M','E'];
const O = ['O','V','E','R'];

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

export function GameOverScreen({ score, onRestart }: GameOverScreenProps) {
  const [playerName, setPlayerName] = useState('');
  const [submitted, setSubmitted]   = useState(false);
  const [copied, setCopied]         = useState(false);
  const queryClient = useQueryClient();
  const flavor = getFlavorText(score);

  const prevPB  = getPersonalBest();
  const isNewPB = score > prevPB;

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
    const end = Date.now() + 2800;
    const burst = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ff00ff','#00ffff','#39ff14'] });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ff00ff','#00ffff','#39ff14'] });
      if (Date.now() < end) requestAnimationFrame(burst);
    };
    const t = setTimeout(burst, 200);
    return () => clearTimeout(t);
  }, []);

  // Extra confetti burst on new PB
  useEffect(() => {
    if (!isNewPB) return;
    setTimeout(() => {
      confetti({ particleCount: 80, spread: 100, origin: { y: 0.4 }, colors: ['#fbbf24','#f59e0b','#fde68a'] });
    }, 600);
  }, [isNewPB]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isPending || submitted) return;
    submitScore({ data: { playerName: playerName.trim(), score } });
  };

  const handleShare = async () => {
    const text = `🐀 Web3 Whack-A-Mole — I scored ${score.toString().padStart(4, '0')} bonks!\nCan you beat me? Bonk the scammers, save the chain 📉`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Web3 Whack-A-Mole', text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2.5 px-5 py-3 text-center relative game-bg overflow-hidden">
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      {/* ── GAME OVER ─────────────────────────────────────── */}
      <div className="relative z-10">
        <div className="flex justify-center gap-1 md:gap-2">
          {G.map((l, i) => (
            <motion.span key={`g${i}`}
              initial={{ y: -50, opacity: 0, rotate: -15 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.55, delay: i * 0.06 }}
              className="font-display text-3xl md:text-5xl text-destructive"
              style={{ textShadow: '3px 3px 0 #ff00ff, -2px -2px 0 #00ffff' }}
            >{l}</motion.span>
          ))}
        </div>
        <div className="flex justify-center gap-1 md:gap-2">
          {O.map((l, i) => (
            <motion.span key={`o${i}`}
              initial={{ y: 50, opacity: 0, rotate: 15 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.55, delay: 0.24 + i * 0.06 }}
              className="font-display text-3xl md:text-5xl text-destructive"
              style={{ textShadow: '3px 3px 0 #ff00ff, -2px -2px 0 #00ffff' }}
            >{l}</motion.span>
          ))}
        </div>
      </div>

      {/* ── Score + PB ────────────────────────────────────── */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.65, delay: 0.55 }}
        className="relative z-10 flex flex-col items-center gap-1"
      >
        <div className="bg-black/80 border-4 border-primary rounded px-6 py-2.5 box-shadow-neon">
          <span className="font-display text-[9px] text-secondary tracking-widest block mb-0.5">FINAL SCORE</span>
          <span className="font-sans text-5xl md:text-6xl text-primary font-bold tracking-widest"
            style={{ textShadow: '0 0 10px hsl(315,100%,60%), 0 0 30px hsl(315,100%,60%)' }}
          >
            {score.toString().padStart(4, '0')}
          </span>
        </div>

        {/* Personal best indicator */}
        <AnimatePresence>
          {isNewPB ? (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.7, delay: 0.7 }}
              className="flex items-center gap-1.5 bg-yellow-400/20 border border-yellow-400/60 rounded-full px-3 py-1"
            >
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="font-display text-[9px] text-yellow-400 tracking-widest">NEW PERSONAL BEST!</span>
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            </motion.div>
          ) : prevPB > 0 ? (
            <span className="font-display text-[8px] text-zinc-500 tracking-widest">
              PB: {prevPB.toString().padStart(4, '0')}
            </span>
          ) : null}
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className={`font-sans text-base md:text-lg ${flavor.color} uppercase tracking-widest animate-pulse`}
        >
          {flavor.text}
        </motion.p>
      </motion.div>

      {/* ── Submit form ────────────────────────────────────── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 w-full max-w-xs bg-black/85 border-4 border-secondary rounded box-shadow-cyan p-3.5"
      >
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form key="form" exit={{ opacity: 0, scale: 0.92 }} onSubmit={handleSubmit} className="flex flex-col gap-2.5">
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
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="flex flex-col items-center gap-2 py-2 text-accent"
            >
              <CheckCircle2 className="w-10 h-10 animate-bounce drop-shadow-[0_0_10px_currentColor]" />
              <span className="font-display text-[10px] text-shadow-green">SCORE RECORDED!</span>
              <span className="font-sans text-sm text-zinc-400">You're on the board, ser 🫡</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Action buttons ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.95 }}
        className="flex gap-2 w-full max-w-xs z-10"
      >
        <motion.button
          onClick={onRestart}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
          className="flex-1 py-2 font-display text-[10px] text-secondary-foreground bg-secondary tracking-widest flex items-center justify-center gap-1.5 rounded border-b-4 border-secondary/50 box-shadow-cyan"
        >
          <RotateCcw className="w-3 h-3" /> RETRY
        </motion.button>

        <motion.button
          onClick={handleShare}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
          className="flex-1 py-2 font-display text-[10px] text-accent tracking-widest flex items-center justify-center gap-1.5 rounded border-2 border-accent/50 hover:border-accent hover:bg-accent/10 transition-colors box-shadow-green"
        >
          <Share2 className="w-3 h-3" />
          {copied ? 'COPIED!' : 'SHARE'}
        </motion.button>

        <Link href="/leaderboard" className="flex-1">
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
            className="w-full py-2 font-display text-[10px] text-primary border-2 border-primary/50 tracking-widest flex items-center justify-center gap-1.5 rounded hover:border-primary hover:bg-primary/10 transition-colors"
          >
            <Trophy className="w-3 h-3" /> RANKS
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
