import React from 'react';
import { useGetLeaderboard } from '@workspace/api-client-react';
import { ArcadeCabinet } from '@/components/ArcadeCabinet';
import { Button } from '@/components/Button';
import { Link } from 'wouter';
import { ArrowLeft, Trophy, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const RANK_STYLES = [
  { medal: '🥇', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  { medal: '🥈', color: 'text-zinc-300',   bg: 'bg-zinc-300/10 border-zinc-300/20' },
  { medal: '🥉', color: 'text-amber-600',  bg: 'bg-amber-600/10 border-amber-600/20' },
];

export function Leaderboard() {
  const { data: entries, isLoading, isError } = useGetLeaderboard({ limit: 10 });

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 py-12 relative game-bg">
      <ArcadeCabinet className="max-w-3xl w-full">
        <div className="flex flex-col h-full min-h-[600px] relative z-10">

          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-8 pt-6 pb-4 border-b-4 border-secondary bg-black/60">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 border border-secondary/40 text-secondary hover:border-secondary">
                <ArrowLeft className="w-4 h-4" /> BACK
              </Button>
            </Link>
            <h1 className="font-display text-lg md:text-2xl text-primary text-shadow-neon flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              HALL OF SHAME
            </h1>
            <div className="w-20 hidden md:block" />
          </div>

          {/* Subtitle */}
          <div className="text-center py-3 bg-black/40 border-b border-secondary/20">
            <span className="font-display text-xs text-accent tracking-widest animate-pulse">
              ⚡ TOP SCAMMER BONKERS ⚡
            </span>
          </div>

          {/* Table */}
          <div className="flex-1 px-4 md:px-8 py-4 flex flex-col min-h-0 overflow-hidden">

            {/* Column headers */}
            <div className="grid grid-cols-12 gap-3 border-b-2 border-secondary/40 pb-2 mb-3 font-display text-secondary text-[9px] md:text-xs uppercase">
              <div className="col-span-2 text-center">RANK</div>
              <div className="col-span-7">PLAYER</div>
              <div className="col-span-3 text-right">SCORE</div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-1">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 text-secondary gap-4">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <span className="font-sans text-xl animate-pulse">SYNCING BLOCKCHAIN...</span>
                </div>
              )}

              {isError && (
                <div className="flex flex-col items-center justify-center py-20 text-destructive gap-4">
                  <AlertCircle className="w-10 h-10" />
                  <span className="font-sans text-xl text-center">NETWORK ERROR.<br/>RPC NODE DOWN.</span>
                </div>
              )}

              {!isLoading && !isError && entries?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-2">
                  <span className="text-4xl">🦗</span>
                  <span className="font-sans text-lg">NO ENTRIES YET. BE FIRST.</span>
                </div>
              )}

              {!isLoading && !isError && entries && entries.length > 0 && entries.map((entry, index) => {
                const rankStyle = RANK_STYLES[index];
                const isTop3 = index < 3;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.07 }}
                    className={`grid grid-cols-12 gap-3 py-2.5 px-2 items-center rounded border ${
                      isTop3
                        ? rankStyle.bg
                        : 'border-transparent hover:bg-secondary/5 hover:border-secondary/20'
                    } transition-colors group`}
                  >
                    <div className="col-span-2 text-center">
                      {isTop3
                        ? <span className="text-xl md:text-2xl group-hover:scale-110 inline-block transition-transform">{rankStyle.medal}</span>
                        : <span className="font-display text-[10px] text-zinc-500">#{index + 1}</span>
                      }
                    </div>
                    <div className={`col-span-7 font-sans text-lg md:text-2xl font-bold uppercase truncate ${isTop3 ? rankStyle.color : 'text-zinc-300 group-hover:text-white'} transition-colors`}>
                      {entry.playerName}
                    </div>
                    <div className={`col-span-3 text-right font-sans text-lg md:text-2xl tracking-widest font-bold ${isTop3 ? 'text-accent' : 'text-zinc-400 group-hover:text-accent'} transition-colors`}>
                      {entry.score.toString().padStart(4, '0')}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-secondary/20 bg-black/40 px-6 py-3 text-center">
            <span className="font-sans text-sm text-zinc-600 tracking-widest">
              NFA • DYOR • NOT YOUR KEYS NOT YOUR COINS
            </span>
          </div>
        </div>
      </ArcadeCabinet>
    </div>
  );
}
