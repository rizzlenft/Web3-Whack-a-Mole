import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ArcadeCabinet({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "w-full max-w-5xl mx-auto min-h-[600px] relative",
        "border-[12px] md:border-[18px] border-[#1E0E07]",
        "rounded-t-3xl rounded-b-xl",
        "p-2 md:p-5",
        "shadow-[0_0_60px_rgba(255,0,255,0.25),0_0_120px_rgba(0,255,255,0.1),inset_0_0_50px_rgba(0,0,0,0.9)]",
        className
      )}
      style={{ background: 'linear-gradient(160deg, #1A0A05 0%, #2E1408 40%, #1A0A05 100%)' }}
    >
      {/* Side neon rails */}
      <div className="absolute top-0 left-[6px] w-[5px] h-full rounded-full bg-primary opacity-90 shadow-[0_0_25px_6px_hsl(315,100%,60%,0.8)]" />
      <div className="absolute top-0 right-[6px] w-[5px] h-full rounded-full bg-secondary opacity-90 shadow-[0_0_25px_6px_hsl(185,100%,50%,0.8)]" />

      {/* Top speaker grille dots */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-700 border border-zinc-600" />
        ))}
      </div>

      {/* Glass glare */}
      <div className="absolute top-0 left-0 w-full h-[25%] bg-gradient-to-b from-white/8 to-transparent pointer-events-none rounded-t-2xl z-50" />
      <div className="absolute top-0 left-[-20%] w-[60%] h-full bg-gradient-to-br from-white/4 via-transparent to-transparent rotate-12 pointer-events-none z-50" />

      {/* Screen bezel */}
      <div className="w-full h-full border-[10px] border-zinc-900 rounded-2xl relative z-10 overflow-hidden bg-background shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
        {/* Corner rivets */}
        <div className="absolute top-0 left-0 w-3 h-3 bg-zinc-800 z-20 rounded-br-sm" />
        <div className="absolute top-0 right-0 w-3 h-3 bg-zinc-800 z-20 rounded-bl-sm" />
        <div className="absolute bottom-0 left-0 w-3 h-3 bg-zinc-800 z-20 rounded-tr-sm" />
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-zinc-800 z-20 rounded-tl-sm" />

        <div className="scanlines" />
        <div className="crt-flicker w-full h-full relative">
          {children}
        </div>
      </div>

      {/* Bottom: coin slot + LEDs */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-6 z-30">
        <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_hsl(140,100%,55%)]" />
        <div className="w-16 h-1.5 bg-zinc-950 border border-zinc-700 rounded-full shadow-inner" />
        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(315,100%,60%)]" />
      </div>
    </div>
  );
}
