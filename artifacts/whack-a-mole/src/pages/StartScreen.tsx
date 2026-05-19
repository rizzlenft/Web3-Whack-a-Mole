import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button';
import { Trophy, Zap } from 'lucide-react';
import { Link } from 'wouter';
import { useGetLeaderboard } from '@workspace/api-client-react';
import { GameLogo } from '@/components/GameLogo';

interface StartScreenProps {
  onStart: () => void;
}

const ROUND_PREVIEWS = [
  { round: 1, label: 'BONK EM', desc: 'Classic popup moles', emoji: '🐀', color: 'border-primary text-primary' },
  { round: 2, label: 'THEY FLY', desc: 'Moles arc through air', emoji: '🌀', color: 'border-secondary text-secondary' },
  { round: 3, label: 'CHAOS', desc: 'Both + max speed', emoji: '💀', color: 'border-destructive text-destructive' },
];

export function StartScreen({ onStart }: StartScreenProps) {
  const { data: leaderboard } = useGetLeaderboard({ limit: 1 });
  const topScore = leaderboard?.[0]?.score ?? 0;
  const topName = leaderboard?.[0]?.playerName ?? '---';

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-between text-center relative overflow-hidden game-bg">

      {/* Top Score Banner */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full bg-black/60 border-b-2 border-accent/50 px-4 py-2 flex justify-center items-center gap-3 z-10"
      >
        <Trophy className="w-4 h-4 text-yellow-400" />
        <span className="font-display text-xs text-accent tracking-widest">
          TOP: {topName} — {topScore.toString().padStart(4, '0')}
        </span>
        <Trophy className="w-4 h-4 text-yellow-400" />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full z-10 px-6 gap-6 py-4">

        {/* Logo + Tagline */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.45, delay: 0.15 }}
          className="flex flex-col items-center gap-3"
        >
          <motion.div
            animate={{ y: [0, -12, 0], rotate: [0, -8, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="text-5xl md:text-6xl"
          >
            🐀
          </motion.div>
          <GameLogo size="lg" />
          <p className="text-base md:text-lg text-secondary font-sans uppercase font-bold tracking-widest bg-black/60 px-4 py-1.5 rounded border border-secondary/30 mt-1">
            Bonk The Scammers. Save The Chain. 📉
          </p>
        </motion.div>

        {/* Round preview strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-2 w-full max-w-md"
        >
          {ROUND_PREVIEWS.map((r, i) => (
            <motion.div
              key={r.round}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 + i * 0.1 }}
              className={`flex flex-col items-center gap-1 bg-black/60 border-2 ${r.color} rounded p-2 md:p-3`}
            >
              <span className="text-xl md:text-2xl">{r.emoji}</span>
              <span className={`font-display text-[7px] md:text-[9px] ${r.color.split(' ')[1]}`}>R{r.round}: {r.label}</span>
              <span className="font-sans text-xs text-zinc-400 leading-tight text-center">{r.desc}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-3 w-full max-w-xs"
        >
          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="w-full py-4 font-display text-base md:text-lg text-black bg-primary rounded tracking-widest uppercase neon-border-pulse flex items-center justify-center gap-3 shadow-[0_0_30px_hsl(315,100%,60%,0.6)]"
          >
            <Zap className="w-5 h-5" />
            INSERT COIN TO PLAY
          </motion.button>

          <Link href="/leaderboard" className="w-full">
            <Button variant="secondary" size="md" className="w-full flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4" />
              LEADERBOARD
            </Button>
          </Link>
        </motion.div>

      </div>

      {/* Ticker */}
      <div className="w-full overflow-hidden bg-black/80 border-t-2 border-destructive/60 text-destructive font-display text-xs py-2 z-10 flex-shrink-0">
        <div className="animate-marquee">
          🚨 SCAMMER ALERT 🚨 &nbsp;•&nbsp; RUG DETECTED &nbsp;•&nbsp; NGMI &nbsp;•&nbsp; EXIT SCAM INCOMING &nbsp;•&nbsp; DOWN ONLY &nbsp;•&nbsp; 📉📉📉 &nbsp;•&nbsp; NFA DYOR &nbsp;•&nbsp; NOT YOUR KEYS NOT YOUR COINS &nbsp;•&nbsp; HODL OR FOLD &nbsp;•&nbsp; LIQUIDATION INCOMING &nbsp;•&nbsp; PAPER HANDS DETECTED &nbsp;•&nbsp;
        </div>
      </div>

    </div>
  );
}
