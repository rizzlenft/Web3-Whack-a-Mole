import React from 'react';
import { motion } from 'framer-motion';
import { FlyingMoleEntry } from '@/hooks/use-game-engine';

const PFP_IMAGES = ['placeholder-pfp.png', 'pfp-2.png'];

interface FlyingMoleProps {
  entry: FlyingMoleEntry;
  srcX: number;
  srcY: number;
  dstX: number;
  dstY: number;
  size: number; // diameter in px
}

export function FlyingMole({ entry, srcX, srcY, dstX, dstY, size }: FlyingMoleProps) {
  const pfpFile = PFP_IMAGES[entry.pfp % PFP_IMAGES.length] ?? PFP_IMAGES[0];
  const pfpSrc = `${import.meta.env.BASE_URL}${pfpFile}`;

  // Arc peak: midpoint horizontally, rises above both holes
  const midX = (srcX + dstX) / 2;
  // Rise by at least 60px, or 40% of the distance between holes
  const dist = Math.hypot(dstX - srcX, dstY - srcY);
  const rise = Math.max(60, dist * 0.5);
  const peakY = Math.min(srcY, dstY) - rise;

  const duration = entry.duration / 1000; // seconds

  // Spin direction based on horizontal movement
  const spinDir = dstX >= srcX ? 1 : -1;

  return (
    <motion.div
      className="absolute pointer-events-none z-50"
      style={{
        width: size,
        height: size,
        left: 0,
        top: 0,
        x: srcX - size / 2,
        y: srcY - size / 2,
      }}
      animate={{
        x: [srcX - size / 2, midX - size / 2, dstX - size / 2],
        y: [srcY - size / 2, peakY - size / 2, dstY - size / 2],
        rotate: [0, spinDir * 270, spinDir * 360],
        scale: [1, 1.15, 0.85],
      }}
      transition={{
        duration,
        ease: 'easeInOut',
        times: [0, 0.42, 1],
      }}
    >
      <div
        className="w-full h-full rounded-full overflow-hidden border-4 border-secondary"
        style={{ boxShadow: '0 0 18px rgba(0,255,255,0.7), 0 4px 20px rgba(0,0,0,0.6)' }}
      >
        <img
          src={pfpSrc}
          alt="Flying scammer"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
    </motion.div>
  );
}
