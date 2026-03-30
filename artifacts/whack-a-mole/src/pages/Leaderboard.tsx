import React from 'react';
import { useGetLeaderboard } from '@workspace/api-client-react';
import { ArcadeCabinet } from '@/components/ArcadeCabinet';
import { Button } from '@/components/Button';
import { Link } from 'wouter';
import { ArrowLeft, Trophy, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function Leaderboard() {
  const { data: entries, isLoading, isError } = useGetLeaderboard({ limit: 10 });

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 py-12 relative">
      
      {/* Background Image Layer */}
      <div 
        className="fixed inset-0 z-[-1] opacity-30 object-cover w-full h-full pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/arcade-bg.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <ArcadeCabinet className="max-w-3xl">
        <div className="p-6 md:p-10 flex flex-col h-full min-h-[600px]">
          
          <div className="flex items-center justify-between mb-10">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 border-secondary text-secondary hover:bg-secondary/20">
                <ArrowLeft className="w-4 h-4" /> BACK
              </Button>
            </Link>
            <h1 className="text-2xl md:text-4xl text-primary text-shadow-neon flex items-center gap-4">
              <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />
              HIGH SCORES
            </h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>

          <div className="flex-1 bg-card/50 border-4 border-primary/50 p-4 md:p-8 box-shadow-cyan overflow-hidden relative">
            
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 border-b-4 border-primary pb-4 mb-4 font-display text-secondary text-xs md:text-sm">
              <div className="col-span-2 text-center">RANK</div>
              <div className="col-span-6">PLAYER</div>
              <div className="col-span-4 text-right">SCORE</div>
            </div>

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 text-primary">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <span className="font-sans text-2xl animate-pulse">LOADING DATA...</span>
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center justify-center py-20 text-destructive">
                <AlertCircle className="w-12 h-12 mb-4" />
                <span className="font-sans text-2xl text-center">CONNECTION ERROR.<br/>PLEASE TRY AGAIN.</span>
              </div>
            )}

            {!isLoading && !isError && entries && entries.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <span className="font-sans text-3xl">NO SCORES YET.</span>
                <span className="font-display text-sm mt-4 text-primary">BE THE FIRST!</span>
              </div>
            )}

            {!isLoading && !isError && entries && entries.length > 0 && (
              <div className="flex flex-col gap-2">
                {entries.map((entry, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={entry.id}
                    className="grid grid-cols-12 gap-4 py-3 border-b-2 border-primary/20 font-sans text-xl md:text-3xl text-white items-center hover:bg-white/5 transition-colors"
                  >
                    <div className="col-span-2 text-center font-display text-sm md:text-base text-yellow-400">
                      {index + 1}
                    </div>
                    <div className="col-span-6 truncate text-shadow-cyan text-secondary">
                      {entry.playerName}
                    </div>
                    <div className="col-span-4 text-right tracking-widest text-shadow-neon text-primary">
                      {entry.score.toString().padStart(4, '0')}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

          </div>

        </div>
      </ArcadeCabinet>
    </div>
  );
}
