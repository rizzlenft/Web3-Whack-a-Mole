import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';
import { Link } from 'wouter';
import { useGetLeaderboard } from '@workspace/api-client-react';

interface StartScreenProps {
  onStart: () => void;
}

const TICKER_PHRASES = '🚨 SCAMMER ALERT &nbsp;•&nbsp; RUG DETECTED &nbsp;•&nbsp; NGMI &nbsp;•&nbsp; EXIT SCAM INCOMING &nbsp;•&nbsp; DOWN ONLY &nbsp;•&nbsp; 📉📉📉 &nbsp;•&nbsp; NFA DYOR &nbsp;•&nbsp; NOT YOUR KEYS NOT YOUR COINS &nbsp;•&nbsp; HODL OR FOLD &nbsp;•&nbsp; LIQUIDATION INCOMING &nbsp;•&nbsp; PAPER HANDS DETECTED &nbsp;•&nbsp; SER THIS IS A CASINO &nbsp;•&nbsp; PONZI CONFIRMED &nbsp;•&nbsp; APE IN AND PRAY &nbsp;•&nbsp; BUY HIGH SELL NEVER &nbsp;•&nbsp;';

export function StartScreen({ onStart }: StartScreenProps) {
  const { data: leaderboard } = useGetLeaderboard({ limit: 1 });
  const topScore = leaderboard?.[0]?.score ?? 0;
  const topName  = leaderboard?.[0]?.playerName ?? '---';

  return (
    <div className="w-full h-full flex flex-col items-center text-center relative overflow-hidden game-bg">

      {/* Dark radial vignette — makes title pop over busy rug bg */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{ background: 'radial-gradient(ellipse 80% 85% at 50% 48%, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.38) 55%, transparent 80%)' }}
      />

      {/* ── Top score bar ──────────────────────────────── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full flex-shrink-0 bg-black/80 border-b-2 border-yellow-400/50 flex justify-center items-center gap-2 px-4 py-1.5 relative z-10"
      >
        <Trophy className="w-3 h-3 text-yellow-400 flex-shrink-0" />
        <span className="font-display text-[9px] text-yellow-300 tracking-widest truncate">
          HIGH SCORE: <span className="text-white">{topName}</span>
          {' '}—{' '}
          <span className="text-yellow-400">{topScore.toString().padStart(4, '0')}</span>
        </span>
        <Trophy className="w-3 h-3 text-yellow-400 flex-shrink-0" />
      </motion.div>

      {/* ── Hero ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5 w-full min-h-0 py-2 relative z-10">

        {/* Rat */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, -9, 9, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="text-5xl leading-none filter drop-shadow-[0_0_18px_hsl(315,100%,60%)]"
        >
          🐀
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: -25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
          className="flex flex-col items-center leading-none"
        >
          <h1
            className="font-display text-5xl md:text-7xl text-primary tracking-widest"
            style={{ textShadow: '0 0 12px hsl(315,100%,60%), 0 0 40px hsl(315,100%,60%), 0 0 80px hsl(315,100%,60%,0.5), 0 0 2px #fff' }}
          >
            WEB3
          </h1>
          <h2
            className="font-display text-xl md:text-3xl text-secondary tracking-[0.18em] mt-1"
            style={{ textShadow: '0 0 10px hsl(185,100%,50%), 0 0 28px hsl(185,100%,50%), 0 0 2px #fff' }}
          >
            WHACK-A-MOLE
          </h2>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="font-sans text-sm md:text-base text-secondary uppercase tracking-widest bg-black/70 border border-secondary/30 px-4 py-1.5 rounded"
        >
          Bonk The Scammers. Save The Chain. 📉
        </motion.p>

        {/* Round flow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex items-center gap-3 bg-black/70 border border-zinc-700/80 rounded-full px-6 py-2"
        >
          <span className="font-display text-[9px] text-primary tracking-widest">🐀 BONK</span>
          <span className="text-zinc-500 text-xs">→</span>
          <span className="font-display text-[9px] text-secondary tracking-widest">🌀 FLY</span>
          <span className="text-zinc-500 text-xs">→</span>
          <span className="font-display text-[9px] text-destructive tracking-widest">💀 CHAOS</span>
        </motion.div>

        {/* Scoring legend */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45 }}
          className="flex items-center bg-black/75 border border-zinc-700/70 rounded overflow-hidden"
        >
          <div className="flex flex-col items-center px-5 py-2 border-r border-zinc-700/60">
            <span className="text-xl leading-none">⚡</span>
            <span className="font-display text-[9px] text-accent mt-1">+1 BONK</span>
          </div>
          <div className="flex flex-col items-center px-5 py-2 border-r border-zinc-700/60 bg-yellow-400/8">
            <span className="text-xl leading-none">👑</span>
            <span className="font-display text-[9px] text-yellow-400 mt-1">+5 GOLD</span>
          </div>
          <div className="flex flex-col items-center px-5 py-2 bg-destructive/8">
            <span className="text-xl leading-none">💀</span>
            <span className="font-display text-[9px] text-destructive mt-1">-1 SKULL</span>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex flex-col gap-2.5 w-full max-w-[300px]"
        >
          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px hsl(315,100%,60%,0.7)' }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3.5 font-display text-[12px] text-black bg-primary tracking-widest uppercase flex items-center justify-center gap-2 rounded neon-border-pulse shadow-[0_0_35px_hsl(315,100%,60%,0.6)] whitespace-nowrap"
          >
            <Zap className="w-4 h-4 flex-shrink-0" />
            INSERT COIN TO PLAY
          </motion.button>

          <Link href="/leaderboard" className="w-full">
            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: 'rgba(0,255,255,0.12)' }}
              whileTap={{ scale: 0.96 }}
              className="w-full py-2.5 font-display text-[11px] text-secondary tracking-widest uppercase bg-black/60 border-2 border-secondary/70 rounded box-shadow-cyan flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
              LEADERBOARD
            </motion.button>
          </Link>
        </motion.div>

      </div>

      {/* ── Ticker ─────────────────────────────────────── */}
      <div className="w-full flex-shrink-0 overflow-hidden bg-black/90 border-t-2 border-destructive/60 py-1.5 relative z-10">
        <div
          className="animate-marquee font-display text-[8px] text-destructive tracking-widest"
          dangerouslySetInnerHTML={{ __html: TICKER_PHRASES }}
        />
      </div>

    </div>
  );
}
