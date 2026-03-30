import React from 'react';

export function GameLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { title: "text-lg md:text-xl", sub: "text-sm md:text-base", emoji: "text-base md:text-lg", gap: "gap-1 md:gap-2", px: "px-2 md:px-4", py: "py-1 md:py-2" },
    md: { title: "text-3xl md:text-5xl", sub: "text-xl md:text-3xl", emoji: "text-2xl md:text-4xl", gap: "gap-2 md:gap-4", px: "px-4 md:px-8", py: "py-2 md:py-4" },
    lg: { title: "text-4xl md:text-6xl", sub: "text-2xl md:text-4xl", emoji: "text-3xl md:text-5xl", gap: "gap-3 md:gap-6", px: "px-6 md:px-10", py: "py-3 md:py-5" },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center justify-center ${s.gap} bg-zinc-950/80 ${s.px} ${s.py} rounded-xl border-2 border-primary/30 box-shadow-neon backdrop-blur-sm ${size === 'lg' ? 'mb-4' : ''}`}>
      <span className={`${s.emoji}`}>🐀</span>
      <div className="flex flex-col items-center justify-center">
        <h2 className={`${s.title} text-primary text-shadow-neon leading-none tracking-widest font-display m-0`}>
          WEB3
        </h2>
        <h3 className={`${s.sub} text-secondary text-shadow-cyan leading-none tracking-widest font-display m-0 mt-2`}>
          WHACK-A-MOLE
        </h3>
      </div>
      <span className={`${s.emoji}`}>📉</span>
    </div>
  );
}
