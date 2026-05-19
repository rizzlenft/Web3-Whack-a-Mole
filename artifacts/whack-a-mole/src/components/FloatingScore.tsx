import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type FloatingScoreEntry = {
  id: string;
  x: number;
  y: number;
  value: number;   // points awarded (1, 5, -1 etc.)
  label?: string;  // optional override text
};

interface FloatingScoreProps {
  entries: FloatingScoreEntry[];
}

export function FloatingScore({ entries }: FloatingScoreProps) {
  return (
    <AnimatePresence>
      {entries.map(e => {
        const isBonus  = e.value >= 5;
        const isMinus  = e.value < 0;
        const colorCls = isBonus ? 'text-yellow-300' : isMinus ? 'text-destructive' : 'text-accent';
        const sizeCls  = isBonus ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl';
        const text     = e.label ?? (e.value > 0 ? `+${e.value}` : `${e.value}`);

        return (
          <motion.div
            key={e.id}
            initial={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            animate={{ opacity: 0, y: -80, scale: 1.4, x: '-50%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            style={{ position: 'absolute', left: e.x, top: e.y, pointerEvents: 'none', zIndex: 80 }}
          >
            <span
              className={`font-display ${sizeCls} ${colorCls} whitespace-nowrap`}
              style={{
                textShadow: isBonus
                  ? '0 0 8px #fbbf24, 0 0 20px #fbbf24'
                  : isMinus
                  ? '0 0 8px hsl(0,100%,60%)'
                  : '0 0 8px hsl(140,100%,55%)',
              }}
            >
              {text}
            </span>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}
