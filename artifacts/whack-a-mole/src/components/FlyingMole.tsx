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
  size: number;
}

export function FlyingMole({ entry, srcX, srcY, dstX, dstY, size }: FlyingMoleProps) {
  const pfpFile = PFP_IMAGES[entry.pfp % PFP_IMAGES.length] ?? PFP_IMAGES[0];
  const pfpSrc  = `${import.meta.env.BASE_URL}${pfpFile}`;

  const midX   = (srcX + dstX) / 2;
  const dist   = Math.hypot(dstX - srcX, dstY - srcY);
  const rise   = Math.max(70, dist * 0.55);
  const peakY  = Math.min(srcY, dstY) - rise;
  const duration = entry.duration / 1000;
  const spinDir  = dstX >= srcX ? 1 : -1;

  const isGolden = entry.moleType === 'golden';
  const isSkull  = entry.moleType === 'skull';

  const borderColor = isGolden ? '#fbbf24' : isSkull ? 'hsl(0,100%,60%)' : 'hsl(185,100%,50%)';
  const glowColor   = isGolden
    ? '0 0 22px rgba(251,191,36,0.9), 0 4px 20px rgba(0,0,0,0.7)'
    : isSkull
    ? '0 0 22px rgba(255,0,0,0.8), 0 4px 20px rgba(0,0,0,0.7)'
    : '0 0 18px rgba(0,255,255,0.7), 0 4px 20px rgba(0,0,0,0.6)';

  return (
    <motion.div
      className="absolute pointer-events-none z-50"
      style={{ width: size, height: size, left: 0, top: 0, x: srcX - size / 2, y: srcY - size / 2 }}
      animate={{
        x: [srcX - size / 2, midX - size / 2, dstX - size / 2],
        y: [srcY - size / 2, peakY - size / 2, dstY - size / 2],
        rotate: [0, spinDir * 260, spinDir * 360],
        scale: [1, 1.18, 0.82],
      }}
      transition={{ duration, ease: 'easeInOut', times: [0, 0.42, 1] }}
    >
      <div
        className="w-full h-full rounded-full overflow-hidden border-4 relative"
        style={{ borderColor, boxShadow: glowColor }}
      >
        <img
          src={pfpSrc}
          alt="Flying scammer"
          className={`w-full h-full object-cover ${isSkull ? 'grayscale hue-rotate-180' : ''}`}
          draggable={false}
        />

        {/* Golden shimmer overlay */}
        {isGolden && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{ opacity: [0.2, 0.55, 0.2] }}
            transition={{ repeat: Infinity, duration: 0.45 }}
            style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.5) 0%, transparent 70%)' }}
          />
        )}

        {/* Badge icon */}
        {(isGolden || isSkull) && (
          <div className="absolute bottom-[-2px] right-[-2px] text-[10px] leading-none">
            {isGolden ? '👑' : '💀'}
          </div>
        )}
      </div>

      {/* Comet trail (golden only) */}
      {isGolden && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.25) 0%, transparent 80%)', transform: 'scale(1.6)' }}
          animate={{ opacity: [0.6, 0.1, 0.6] }}
          transition={{ repeat: Infinity, duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}
