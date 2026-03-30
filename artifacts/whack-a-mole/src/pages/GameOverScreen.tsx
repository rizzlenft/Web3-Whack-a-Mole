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
    // Fire confetti on game over
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

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center p-8 text-center relative">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-5xl md:text-7xl text-destructive text-shadow-neon mb-2">
          GAME OVER
        </h2>
        <div className="text-2xl md:text-3xl font-sans text-white">
          FINAL SCORE: <span className="text-secondary text-shadow-cyan text-4xl">{score}</span>
        </div>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md bg-card border-4 border-primary p-6 mb-8 box-shadow-neon"
      >
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="font-display text-primary text-sm text-left">ENTER INITIALS:</label>
            <input
              type="text"
              maxLength={15}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
              placeholder="PLAYER 1"
              className="bg-input border-4 border-secondary text-secondary-foreground font-sans text-3xl p-3 focus:outline-none focus:border-primary transition-colors text-white"
              required
            />
            <Button 
              type="submit" 
              disabled={isPending || !playerName.trim()} 
              className="w-full mt-2"
            >
              {isPending ? 'SAVING...' : 'SUBMIT SCORE'}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-accent">
            <CheckCircle2 className="w-16 h-16 mb-4 animate-bounce" />
            <h3 className="font-display text-xl">SCORE SAVED!</h3>
          </div>
        )}
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button variant="secondary" onClick={onRestart} className="flex-1 flex items-center justify-center gap-2">
          <RotateCcw className="w-5 h-5" />
          PLAY AGAIN
        </Button>
        <Link href="/leaderboard" className="flex-1">
          <Button variant="ghost" className="w-full flex items-center justify-center gap-2 text-white border-white">
            <Trophy className="w-5 h-5" />
            RANKS
          </Button>
        </Link>
      </div>
    </div>
  );
}
