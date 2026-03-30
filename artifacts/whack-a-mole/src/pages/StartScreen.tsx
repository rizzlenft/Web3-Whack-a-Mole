import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button';
import { Trophy, Hammer } from 'lucide-react';
import { Link } from 'wouter';
import { useGetLeaderboard } from '@workspace/api-client-react';
import { GameLogo } from '@/components/GameLogo';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const { data: leaderboard } = useGetLeaderboard({ limit: 1 });
  const topScore = leaderboard?.[0]?.score || 0;

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-between p-8 text-center relative overflow-hidden bg-zinc-950 game-bg">
      
      {/* Top Score */}
      <div className="absolute top-4 left-0 w-full flex justify-center text-accent font-display text-sm md:text-base animate-pulse z-10">
        TOP SCORE: {topScore.toString().padStart(4, '0')}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full z-10 pb-16">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="mb-12 flex flex-col items-center"
        >
          <motion.div 
            animate={{ y: [0, -15, 0], rotate: [0, -5, 5, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-6xl mb-4"
          >
            🐀
          </motion.div>
          <GameLogo size="lg" />
          <p className="text-xl md:text-2xl text-secondary text-shadow-cyan font-sans uppercase font-bold tracking-widest bg-zinc-900/80 px-4 py-2 rounded-md border border-secondary/30 mt-4">
            Bonk The Scammers. Save The Chain. 📉
          </p>
        </motion.div>

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-6 w-full max-w-sm"
        >
          <Button size="lg" onClick={onStart} className="w-full min-h-[48px] py-3 group relative overflow-hidden animate-[pulse_2s_infinite]">
            <span className="relative z-10 flex items-center justify-center gap-3">
              <Hammer className="w-6 h-6 group-hover:-rotate-45 transition-transform" />
              INSERT COIN TO PLAY
            </span>
          </Button>
          
          <Link href="/leaderboard" className="w-full">
            <Button variant="secondary" size="md" className="w-full min-h-[48px] py-3 flex items-center justify-center gap-3">
              <Trophy className="w-5 h-5" />
              LEADERBOARD
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Marquee Ticker */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden bg-destructive/20 border-t-2 border-destructive text-destructive font-display text-sm py-3 z-10">
        <div className="animate-marquee">
          🚨 SCAMMER ALERT 🚨 • RUG DETECTED • NGMI • SEND IT • TO THE MOON • EXIT SCAM INCOMING • DOWN ONLY • 📉📉📉 • NFA • DYOR • NOT YOUR KEYS NOT YOUR COINS • HODL • 
        </div>
      </div>
      
    </div>
  );
}
