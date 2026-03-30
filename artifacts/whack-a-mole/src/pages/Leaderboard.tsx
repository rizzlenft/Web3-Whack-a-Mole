import React from 'react';
import { useGetLeaderboard } from '@workspace/api-client-react';
import { ArcadeCabinet } from '@/components/ArcadeCabinet';
import { Button } from '@/components/Button';
import { Link } from 'wouter';
import { ArrowLeft, Trophy, Loader2, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function Leaderboard() {
  const { data: entries, isLoading, isError } = useGetLeaderboard({ limit: 10 });
  const lastUpdated = new Date().toLocaleTimeString();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 py-12 relative game-bg">
      
      <ArcadeCabinet className="max-w-4xl w-full">
        <div className="p-4 md:p-8 flex flex-col h-full min-h-[600px] z-10 relative">
          
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 border-secondary text-secondary hover:bg-secondary/20">
                <ArrowLeft className="w-4 h-4" /> BACK
              </Button>
            </Link>
            <h1 className="text-2xl md:text-4xl text-primary text-shadow-neon flex items-center gap-4">
              <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />
              HALL OF SHAME 🏆
            </h1>
            <div className="w-24 hidden md:block" />
          </div>

          <div className="text-center mb-6 text-accent font-display text-sm md:text-base animate-pulse">
            Biggest Rug Pullers Caught
          </div>

          <div className="flex-1 bg-zinc-950 border-4 border-secondary p-4 md:p-6 box-shadow-cyan overflow-hidden relative flex flex-col rounded-md shadow-inner">
            
            {/* Terminal Header */}
            <div className="flex justify-between items-center border-b-2 border-secondary/50 pb-2 mb-4 text-secondary/70 font-sans text-sm md:text-base">
              <span>TRADING_TERMINAL_V1.0</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4"/> LAST UPDATED: {lastUpdated}</span>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 border-b-4 border-secondary/50 pb-4 mb-4 font-display text-secondary text-xs md:text-sm uppercase">
              <div className="col-span-2 text-center">RANK</div>
              <div className="col-span-6">PLAYER_ID</div>
              <div className="col-span-4 text-right">SCORE (🪙)</div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 text-secondary">
                  <Loader2 className="w-12 h-12 animate-spin mb-4" />
                  <span className="font-sans text-2xl animate-pulse">SYNCING BLOCKCHAIN...</span>
                </div>
              )}

              {isError && (
                <div className="flex flex-col items-center justify-center py-20 text-destructive">
                  <AlertCircle className="w-12 h-12 mb-4" />
                  <span className="font-sans text-2xl text-center text-shadow-neon">NETWORK ERROR.<br/>RPC NODE DOWN.</span>
                </div>
              )}

              {!isLoading && !isError && entries && entries.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <span className="font-sans text-3xl">NO DATA FOUND.</span>
                </div>
              )}

              {!isLoading && !isError && entries && entries.length > 0 && (
                <div className="flex flex-col gap-2">
                  {entries.map((entry, index) => {
                    let rankEmoji = '4️⃣';
                    if (index === 0) rankEmoji = '🥇';
                    if (index === 1) rankEmoji = '🥈';
                    if (index === 2) rankEmoji = '🥉';
                    if (index > 3) rankEmoji = `${index + 1}️⃣`;

                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={entry.id}
                        className="grid grid-cols-12 gap-4 py-3 border-b border-secondary/20 font-sans text-xl md:text-3xl text-zinc-300 items-center hover:bg-secondary/10 hover:text-white transition-colors cursor-default group"
                      >
                        <div className="col-span-2 text-center text-2xl group-hover:scale-110 transition-transform">
                          {rankEmoji}
                        </div>
                        <div className="col-span-6 truncate font-bold group-hover:text-shadow-cyan group-hover:text-secondary transition-all uppercase">
                          {entry.playerName}
                        </div>
                        <div className="col-span-4 text-right tracking-widest text-accent group-hover:text-shadow-neon group-hover:text-primary transition-all">
                          {entry.score.toString().padStart(4, '0')}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      </ArcadeCabinet>
    </div>
  );
}
