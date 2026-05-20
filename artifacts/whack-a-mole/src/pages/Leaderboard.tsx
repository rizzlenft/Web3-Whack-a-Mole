import React from 'react';
import { useGetLeaderboard } from '@workspace/api-client-react';
import { ArcadeCabinet } from '@/components/ArcadeCabinet';
import { Button } from '@/components/Button';
import { Link } from 'wouter';
import { ArrowLeft, Trophy, Loader2, AlertCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const RANK_STYLES = [
  {
    medal: '🥇', color: 'text-yellow-300', scoreCls: 'text-yellow-300',
    bg: 'bg-gradient-to-r from-yellow-400/18 via-yellow-400/10 to-transparent border-yellow-400/40',
    rowSize: 'text-xl md:text-2xl',
  },
  {
    medal: '🥈', color: 'text-zinc-300', scoreCls: 'text-zinc-300',
    bg: 'bg-gradient-to-r from-zinc-300/12 via-zinc-300/6 to-transparent border-zinc-300/25',
    rowSize: 'text-lg md:text-xl',
  },
  {
    medal: '🥉', color: 'text-amber-500', scoreCls: 'text-amber-400',
    bg: 'bg-gradient-to-r from-amber-600/12 via-amber-600/6 to-transparent border-amber-600/25',
    rowSize: 'text-lg md:text-xl',
  },
];

const TOTAL_SLOTS = 10;

export function Leaderboard() {
  const { data: entries, isLoading, isError } = useGetLeaderboard({ limit: TOTAL_SLOTS });

  return (
    <div className="h-screen w-full flex items-stretch justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 z-[-1] game-bg opacity-55 pointer-events-none" />

      <ArcadeCabinet className="h-full">
        <div className="flex flex-col h-full relative z-10">

          {/* ── Header ─────────────────────────────────────── */}
          <div className="flex items-center justify-between px-5 md:px-8 pt-5 pb-4 border-b-4 border-secondary bg-black/75 flex-shrink-0">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 border border-secondary/50 text-secondary hover:border-secondary hover:bg-secondary/10 whitespace-nowrap"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> BACK
              </Button>
            </Link>
            <h1 className="font-display text-lg md:text-2xl text-primary text-shadow-neon flex items-center gap-2">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              HALL OF SHAME
            </h1>
            <div className="w-16 hidden md:block" />
          </div>

          {/* ── Subtitle ────────────────────────────────────── */}
          <div className="text-center py-2 bg-black/55 border-b border-secondary/25 flex-shrink-0">
            <motion.span
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="font-display text-[9px] text-accent tracking-widest"
            >
              ⚡ TOP SCAMMER BONKERS ⚡
            </motion.span>
          </div>

          {/* ── Table ──────────────────────────────────────── */}
          <div className="flex-1 px-4 md:px-8 py-3 flex flex-col min-h-0 overflow-hidden">

            {/* Column headers */}
            <div className="grid grid-cols-12 gap-2 border-b-2 border-secondary/40 pb-2 mb-2 font-display text-secondary text-[8px] md:text-[10px] uppercase tracking-widest flex-shrink-0">
              <div className="col-span-2 text-center">RANK</div>
              <div className="col-span-7">PLAYER</div>
              <div className="col-span-3 text-right">SCORE</div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-1">
              {isLoading && (
                <div className="flex flex-col items-center justify-center flex-1 text-secondary gap-4">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <span className="font-sans text-xl animate-pulse">SYNCING BLOCKCHAIN...</span>
                </div>
              )}

              {isError && (
                <div className="flex flex-col items-center justify-center flex-1 text-destructive gap-4">
                  <AlertCircle className="w-10 h-10" />
                  <span className="font-sans text-xl text-center">NETWORK ERROR.<br />RPC NODE DOWN.</span>
                </div>
              )}

              {!isLoading && !isError && (
                <>
                  {Array.from({ length: TOTAL_SLOTS }).map((_, index) => {
                    const entry = entries?.[index];
                    const rankStyle = RANK_STYLES[index];
                    const isTop3 = index < 3;

                    if (entry) {
                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -28 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.055 }}
                          className={`grid grid-cols-12 gap-2 py-2.5 px-3 items-center rounded border ${
                            isTop3 ? rankStyle.bg : 'border-transparent hover:bg-secondary/5 hover:border-secondary/20'
                          } transition-colors group`}
                        >
                          <div className="col-span-2 text-center">
                            {isTop3
                              ? <span className="text-xl md:text-2xl">{rankStyle.medal}</span>
                              : <span className="font-display text-[9px] text-zinc-500">#{index + 1}</span>
                            }
                          </div>
                          <div className={`col-span-7 font-sans font-bold uppercase truncate ${
                            isTop3 ? `${rankStyle.color} ${rankStyle.rowSize}` : 'text-base md:text-lg text-zinc-300 group-hover:text-white'
                          } transition-colors`}>
                            {entry.playerName}
                          </div>
                          <div className={`col-span-3 text-right font-sans font-bold tracking-widest ${
                            isTop3 ? `${rankStyle.scoreCls} ${rankStyle.rowSize}` : 'text-base md:text-lg text-zinc-400 group-hover:text-accent'
                          } transition-colors`}>
                            {entry.score.toString().padStart(4, '0')}
                          </div>
                        </motion.div>
                      );
                    }

                    // Empty placeholder slot
                    return (
                      <motion.div
                        key={`empty-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: (entries?.length ?? 0) * 0.055 + (index - (entries?.length ?? 0)) * 0.03 }}
                        className="grid grid-cols-12 gap-2 py-2 px-3 items-center rounded border border-zinc-800/30"
                      >
                        <div className="col-span-2 text-center">
                          <span className="font-display text-[8px] text-zinc-700">#{index + 1}</span>
                        </div>
                        <div className="col-span-7 font-display text-[9px] text-zinc-700 tracking-widest">
                          {index === (entries?.length ?? 0) ? '— YOUR NAME HERE? —' : '— — —'}
                        </div>
                        <div className="col-span-3 text-right font-sans text-base text-zinc-800 tracking-widest">
                          ----
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* CTA if board empty */}
                  {(!entries || entries.length === 0) && (
                    <div className="flex flex-col items-center gap-3 py-6">
                      <span className="text-4xl">🦗</span>
                      <span className="font-sans text-base text-zinc-500">NO BONKERS YET. BE FIRST.</span>
                      <Link href="/">
                        <motion.button
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                          className="mt-1 px-6 py-2 font-display text-[10px] text-black bg-primary tracking-widest rounded neon-border-pulse flex items-center gap-2"
                        >
                          <Zap className="w-3 h-3" /> PLAY NOW
                        </motion.button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Footer ──────────────────────────────────────── */}
          <div className="border-t-2 border-secondary/20 bg-black/60 px-6 py-2.5 text-center flex-shrink-0">
            <span className="font-sans text-xs text-zinc-600 tracking-widest">
              NFA • DYOR • NOT YOUR KEYS NOT YOUR COINS
            </span>
          </div>

        </div>
      </ArcadeCabinet>
    </div>
  );
}
