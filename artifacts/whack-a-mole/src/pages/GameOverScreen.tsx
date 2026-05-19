import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/Button';
import { useSubmitScore } from '@workspace/api-client-react';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, CheckCircle2 } from 'lucide-react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

function getFlavorText(score: number) {
  if (score === 0) return { text: "ZERO. ABSOLUTE ZERO. 💀", color: "text-destructive" };
  if (score <= 5) return { text: "NGMI. DOWN ONLY FOR YOU. 📉", color: "text-destructive" };
  if (score <= 12) return { text: "MID AT BEST. PROBABLY REKT. 🫡", color: "text-yellow-400" };
  if (score <= 20) return { text: "RESPECTABLE. WAGMI MAYBE. 📈", color: "text-accent" };
  if (score <= 30) return { text: "BULLISH. ACTUAL ALPHA. 🔥", color: "text-primary" };
  return { text: "LEGENDARY CHAD DETECTED. 👑", color: "text-secondary" };
}

const GAME_LETTERS = ['G', 'A', 'M', 'E'];
const OVER_LETTERS = ['O', 'V', 'E', 'R'];

export function GameOverScreen({ score, onRestart }: GameOverScreenProps) {
  const [playerName, setPlayerName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();
  const flavor = getFlavorText(score);

  const { mutate: submitScore, isPending } = useSubmitScore({
    mutation: {
      onSuccess: () => {
        setSubmitted(true);
        queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      }
    }
  });

  useEffect(() => {
    const end = Date.now() + 2800;
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors: ['#ff00ff', '#00ffff', '#39ff14'] });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors: ['#ff00ff', '#00ffff', '#39ff14'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    const t = setTimeout(frame, 200);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isPending || submitted) return;
    submitScore({ data: { playerName: playerName.trim(), score } });
  };

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-center p-5 text-center relative game-bg overflow-hidden">

      {/* Scanline overlay tint */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* GAME OVER letters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 mb-3"
      >
        <div className="flex justify-center gap-1 md:gap-2">
          {GAME_LETTERS.map((l, i) => (
            <motion.span
              key={`g${i}`}
              initial={{ y: -60, opacity: 0, rotate: -20 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.55, delay: i * 0.07 }}
              className="font-display text-4xl md:text-6xl text-destructive"
              style={{ textShadow: '3px 3px 0 #ff00ff, -3px -3px 0 #00ffff' }}
            >
              {l}
            </motion.span>
          ))}
        </div>
        <div className="flex justify-center gap-1 md:gap-2 mt-1">
          {OVER_LETTERS.map((l, i) => (
            <motion.span
              key={`o${i}`}
              initial={{ y: 60, opacity: 0, rotate: 20 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.55, delay: 0.28 + i * 0.07 }}
              className="font-display text-4xl md:text-6xl text-destructive"
              style={{ textShadow: '3px 3px 0 #ff00ff, -3px -3px 0 #00ffff' }}
            >
              {l}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Score */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.6, delay: 0.6 }}
        className="relative z-10 mb-2"
      >
        <div className="bg-black/70 border-4 border-primary rounded px-6 py-3 box-shadow-neon inline-block">
          <span className="font-display text-xs text-secondary tracking-widest block mb-1">FINAL SCORE</span>
          <span className="font-sans text-5xl md:text-7xl text-primary text-shadow-neon font-bold tracking-widest">
            {score.toString().padStart(4, '0')}
          </span>
        </div>
      </motion.div>

      {/* Flavor text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className={`relative z-10 font-sans text-lg md:text-xl ${flavor.color} uppercase tracking-widest animate-pulse mb-4`}
      >
        {flavor.text}
      </motion.p>

      {/* Submit form */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.75 }}
        className="relative z-10 w-full max-w-sm bg-black/80 border-4 border-secondary rounded box-shadow-cyan p-5 mb-4"
      >
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <label className="font-display text-secondary text-xs tracking-widest">
                ENTER YOUR NAME TO CLAIM GLORY
              </label>
              <input
                type="text"
                maxLength={15}
                value={playerName}
                onChange={e => setPlayerName(e.target.value.toUpperCase())}
                placeholder="YOUR_NAME"
                className="bg-zinc-950 border-b-4 border-primary text-primary font-display text-xl md:text-2xl p-3 text-center focus:outline-none focus:border-secondary transition-colors placeholder:text-zinc-700 uppercase tracking-widest w-full"
                required
                autoFocus
              />
              <Button
                type="submit"
                disabled={isPending || !playerName.trim()}
                variant="primary"
                className="w-full text-base"
              >
                {isPending ? '⏳ SAVING...' : '⚡ SUBMIT SCORE'}
              </Button>
            </motion.form>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="flex flex-col items-center gap-3 py-4 text-accent"
            >
              <CheckCircle2 className="w-14 h-14 animate-bounce drop-shadow-[0_0_10px_currentColor]" />
              <span className="font-display text-sm text-shadow-green">SCORE RECORDED!</span>
              <span className="font-sans text-base text-zinc-400">You're on the board, ser 🫡</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex gap-3 w-full max-w-sm z-10"
      >
        <Button variant="secondary" onClick={onRestart} className="flex-1 flex items-center justify-center gap-2">
          <RotateCcw className="w-4 h-4" />
          RETRY
        </Button>
        <Link href="/leaderboard" className="flex-1">
          <Button variant="ghost" className="w-full flex items-center justify-center gap-2 border-2 border-primary/40 text-primary hover:border-primary">
            <Trophy className="w-4 h-4" />
            RANKS
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
