import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoleState } from '@/hooks/use-game-engine';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MoleHoleProps {
  mole: MoleState;
  onWhack: (id: number) => void;
}

export function MoleHole({ mole, onWhack }: MoleHoleProps) {
  const pfpSrc = `${import.meta.env.BASE_URL}placeholder-pfp.png`;

  return (
    <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto select-none">
      
      {/* Background Dirt Hole */}
      <div className="absolute bottom-0 left-0 w-full h-[40%] bg-zinc-950 rounded-[100%] shadow-[inset_0_10px_20px_rgba(0,0,0,1)] border-b-4 border-zinc-800 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(0,0,0,0.8)_100%)] rounded-[100%]" />
      </div>

      {/* The Mole / PFP Container */}
      <div className="absolute bottom-[20%] left-[10%] w-[80%] h-[120%] overflow-hidden z-10">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ 
            y: mole.active && !mole.whacked ? '0%' : '100%',
            scale: mole.whacked ? 0.8 : 1
          }}
          transition={{ 
            type: 'spring', 
            stiffness: 400, 
            damping: 25,
            mass: 1.5
          }}
          className="w-full h-full relative flex items-end justify-center"
        >
          <div className={cn(
            "w-[90%] aspect-square rounded-full border-4 border-primary shadow-[0_0_15px_rgba(255,0,255,0.8)] overflow-hidden bg-background relative",
            mole.whacked ? "brightness-150 contrast-125 sepia" : ""
          )}>
            <img 
              src={pfpSrc} 
              alt="Scammer PFP" 
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
            />
            
            {/* Hit Overlay Flash */}
            <AnimatePresence>
              {mole.whacked && (
                <motion.div
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-white z-20 pointer-events-none"
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Front Lip of Hole for 3D effect */}
      <div className="absolute bottom-[-5%] left-[-5%] w-[110%] h-[45%] rounded-[100%] border-t-8 border-zinc-900 z-20 pointer-events-none opacity-90 shadow-[0_-5px_10px_rgba(0,0,0,0.5)]" />

      {/* Hit / BONK Effect */}
      <AnimatePresence>
        {mole.whacked && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 0, rotate: -20 }}
            animate={{ scale: 1.2, opacity: 1, y: -40, rotate: 10 }}
            exit={{ scale: 1.5, opacity: 0, y: -60 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-40 pointer-events-none"
          >
            <span className="font-display text-2xl md:text-3xl text-yellow-300 text-shadow-neon uppercase tracking-tighter transform -skew-y-6">
              REKT!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invisible Click Target */}
      <button 
        className={cn(
          "absolute inset-0 z-30 w-full h-full rounded-full cursor-mallet outline-none touch-manipulation",
          (!mole.active || mole.whacked) && "cursor-default"
        )}
        onClick={() => onWhack(mole.id)}
        disabled={!mole.active || mole.whacked}
        aria-label="Whack mole"
      />
    </div>
  );
}
