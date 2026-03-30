import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button';
import { Trophy, Hammer } from 'lucide-react';
import { Link } from 'wouter';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center p-8 text-center relative">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-6xl text-primary text-shadow-neon leading-tight mb-4 animate-float">
          WEB3<br />WHACK-A-MOLE
        </h1>
        <p className="text-xl md:text-2xl text-secondary text-shadow-cyan font-sans uppercase">
          Bonk The Scammers. Save The Chain.
        </p>
      </motion.div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-6 w-full max-w-sm"
      >
        <Button size="lg" onClick={onStart} className="w-full group relative overflow-hidden">
          <span className="relative z-10 flex items-center justify-center gap-3">
            <Hammer className="w-6 h-6 group-hover:-rotate-45 transition-transform" />
            INSERT COIN TO PLAY
          </span>
        </Button>
        
        <Link href="/leaderboard" className="w-full">
          <Button variant="secondary" size="md" className="w-full flex items-center justify-center gap-3">
            <Trophy className="w-5 h-5" />
            LEADERBOARD
          </Button>
        </Link>
      </motion.div>
      
    </div>
  );
}
