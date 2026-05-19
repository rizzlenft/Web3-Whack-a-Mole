import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';
import { Link } from 'wouter';
import { useGetLeaderboard } from '@workspace/api-client-react';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const { data: leaderboard } = useGetLeaderboard({ limit: 1 });
  const topScore = leaderboard?.[0]?.score ?? 0;
  const topName  = leaderboard?.[0]?.playerName ?? '---';

  return (
    <div className="w-full h-full flex flex-col items-center text-center relative overflow-hidden game-bg">

      {/* ── Top score bar ──────────────────────────────── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full flex-shrink-0 bg-black/70 border-b border-accent/40 flex justify-center items-center gap-2 px-4 py-1"
      >
        <Trophy className="w-3 h-3 text-yellow-400 flex-shrink-0" />
        <span className="font-display text-[9px] text-accent tracking-widest truncate">
          HIGH SCORE: <span className="text-white">{topName}</span>{' '}
          — <span className="text-primary">{topScore.toString().padStart(4, '0')}</span>
        </span>
        <Trophy className="w-3 h-3 text-yellow-400 flex-shrink-0" />
      </motion.div>

      {/* ── Hero ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2.5 px-5 w-full min-h-0">

        {/* Rat */}
        <motion.div
          animate={{ y: [0, -9, 0], rotate: [0, -7, 7, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          className="text-4xl leading-none"
        >
          🐀
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: -25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4, delay: 0.15 }}
          className="flex flex-col items-center leading-none"
        >
          <h1
            className="font-display text-4xl md:text-6xl text-primary tracking-widest"
            style={{ textShadow: '0 0 10px hsl(315,100%,60%), 0 0 30px hsl(315,100%,60%), 0 0 60px hsl(315,100%,60%,0.5)' }}
          >
            WEB3
          </h1>
          <h2
            className="font-display text-xl md:text-3xl text-secondary tracking-[0.2em] mt-0.5"
            style={{ textShadow: '0 0 8px hsl(185,100%,50%), 0 0 20px hsl(185,100%,50%)' }}
          >
            WHACK-A-MOLE
          </h2>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-sans text-sm md:text-base text-secondary/85 uppercase tracking-widest bg-black/60 border border-secondary/25 px-3 py-1 rounded"
        >
          Bonk The Scammers. Save The Chain. 📉
        </motion.p>

        {/* Round flow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 bg-black/60 border border-zinc-700 rounded-full px-5 py-1.5"
        >
          <span className="font-display text-[9px] text-primary tracking-widest">🐀 BONK</span>
          <span className="text-zinc-600 text-xs">→</span>
          <span className="font-display text-[9px] text-secondary tracking-widest">🌀 FLY</span>
          <span className="text-zinc-600 text-xs">→</span>
          <span className="font-display text-[9px] text-destructive tracking-widest">💀 CHAOS</span>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-2 w-full max-w-[300px]"
        >
          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 font-display text-[11px] text-black bg-primary tracking-widest uppercase flex items-center justify-center gap-2 rounded neon-border-pulse shadow-[0_0_30px_hsl(315,100%,60%,0.5)] whitespace-nowrap"
          >
            <Zap className="w-4 h-4 flex-shrink-0" />
            INSERT COIN TO PLAY
          </motion.button>

          <Link href="/leaderboard" className="w-full">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="w-full py-2 font-display text-[11px] text-secondary tracking-widest uppercase bg-transparent border-2 border-secondary/60 rounded box-shadow-cyan flex items-center justify-center gap-2 hover:bg-secondary/10 transition-colors whitespace-nowrap"
            >
              <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
              LEADERBOARD
            </motion.button>
          </Link>
        </motion.div>

      </div>

      {/* ── Ticker ─────────────────────────────────────── */}
      <div className="w-full flex-shrink-0 overflow-hidden bg-black/80 border-t border-destructive/40 text-destructive font-display text-[9px] py-1">
        <div className="animate-marquee">
          🚨 SCAMMER ALERT &nbsp;•&nbsp; RUG DETECTED &nbsp;•&nbsp; NGMI &nbsp;•&nbsp; EXIT SCAM INCOMING &nbsp;•&nbsp; DOWN ONLY &nbsp;•&nbsp; 📉📉📉 &nbsp;•&nbsp; NFA DYOR &nbsp;•&nbsp; NOT YOUR KEYS NOT YOUR COINS &nbsp;•&nbsp; HODL OR FOLD &nbsp;•&nbsp; LIQUIDATION INCOMING &nbsp;•&nbsp; PAPER HANDS DETECTED &nbsp;•&nbsp;
        </div>
      </div>

    </div>
  );
}
