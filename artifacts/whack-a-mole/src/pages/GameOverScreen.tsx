import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

export function GameOverScreen({ score, onRestart }: GameOverScreenProps) {
  const [playerName, setPlayerName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();
  
  const { mutate: submitScore, isPending } = useSubmitScore({
    mutation: {
      onSuccess: () => {
        setSubmitted(true);
        queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      }
    }
  });

  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff00ff', '#00ffff', '#39ff14']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff00ff', '#00ffff', '#39ff14']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isPending || submitted) return;
    submitScore({ data: { playerName: playerName.trim(), score } });
  };

  const getFlavorText = () => {
    if (score <= 5) return "LFG... nowhere. Absolutely NGMI. 💀";
    if (score <= 12) return "Mid at best. Probably still gonna zero. 📉";
    if (score <= 20) return "Respectable. WAGMI maybe. 📈";
    return "CHAD DETECTOR. You are the alpha. 👑";
  };

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-center p-8 text-center relative game-bg">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.6 }}
        className="mb-8 z-10"
      >
        <h2 
          className="text-6xl md:text-8xl text-destructive font-display tracking-widest mb-4"
          style={{ textShadow: '4px 4px 0px #ff00ff, -4px -4px 0px #00ffff' }}
        >
          GAME<br/>OVER
        </h2>
        <div className="text-3xl md:text-5xl font-sans text-white bg-black/50 p-4 border-2 border-primary rounded-lg inline-block">
          <span className="text-yellow-400">🪙 ×</span> <span className="text-primary text-shadow-neon font-bold">{score}</span>
        </div>
        <p className="mt-6 text-xl md:text-2xl text-accent font-sans uppercase tracking-widest animate-pulse">
          {getFlavorText()}
        </p>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md bg-zinc-950 border-4 border-secondary p-8 mb-8 box-shadow-cyan z-10 rounded-sm relative"
      >
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <label className="font-display text-secondary text-sm md:text-base text-center animate-[pulse_2s_infinite]">
              ENTER YOUR NAME
            </label>
            <input
              type="text"
              maxLength={15}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
              placeholder="___"
              className="bg-black border-b-4 border-primary text-primary font-display text-2xl md:text-3xl p-4 text-center focus:outline-none focus:border-accent transition-colors placeholder:text-zinc-700 uppercase"
              required
              autoFocus
            />
            <Button 
              type="submit" 
              disabled={isPending || !playerName.trim()} 
              className="w-full mt-2 font-display text-xl animate-[pulse_1s_infinite] hover:animate-none"
              variant="primary"
            >
              {isPending ? 'SAVING...' : 'SUBMIT'}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-accent">
            <CheckCircle2 className="w-16 h-16 mb-4 animate-bounce drop-shadow-[0_0_10px_currentColor]" />
            <h3 className="font-display text-xl">SCORE RECORDED!</h3>
          </div>
        )}
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md z-10">
        <Button variant="secondary" onClick={onRestart} className="flex-1 flex items-center justify-center gap-2 text-lg">
          <RotateCcw className="w-5 h-5" />
          RETRY
        </Button>
        <Link href="/leaderboard" className="flex-1">
          <Button variant="ghost" className="w-full flex items-center justify-center gap-2 text-white border-white text-lg hover:border-secondary hover:text-secondary">
            <Trophy className="w-5 h-5" />
            RANKS
          </Button>
        </Link>
      </div>
    </div>
  );
}
