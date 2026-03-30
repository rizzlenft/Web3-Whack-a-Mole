import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ArcadeCabinet({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn(
      "w-full max-w-5xl mx-auto min-h-[600px] border-[16px] md:border-[24px] border-[#2A1610] rounded-t-3xl rounded-b-lg p-3 md:p-8 relative overflow-hidden bg-zinc-950",
      "shadow-[0_0_50px_rgba(255,0,255,0.3),inset_0_0_40px_rgba(0,0,0,0.8)]",
      className
    )}
    style={{
      backgroundImage: `linear-gradient(to right, #1A0D09, #3A2015, #1A0D09)`
    }}>
      {/* Side Neon Stripes */}
      <div className="absolute top-0 left-2 w-2 h-full bg-primary shadow-[0_0_20px_var(--color-primary)] opacity-80" />
      <div className="absolute top-0 right-2 w-2 h-full bg-secondary shadow-[0_0_20px_var(--color-secondary)] opacity-80" />

      {/* Glare effect */}
      <div className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-2xl z-50" />
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-white/5 via-transparent to-transparent rotate-45 pointer-events-none z-50" />
      
      {/* Screen Bezel */}
      <div className="w-full h-full border-[12px] border-zinc-900 rounded-2xl relative z-10 overflow-hidden bg-background shadow-inner">
        {/* Pixel Corners */}
        <div className="absolute top-0 left-0 w-4 h-4 bg-zinc-900 z-20" />
        <div className="absolute top-0 right-0 w-4 h-4 bg-zinc-900 z-20" />
        <div className="absolute bottom-0 left-0 w-4 h-4 bg-zinc-900 z-20" />
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-zinc-900 z-20" />

        <div className="scanlines" />
        <div className="crt-flicker w-full h-full relative">
          {children}
        </div>
      </div>

      {/* Coin Slot / Speakers */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 h-6 flex justify-between items-center z-20">
        <div className="w-12 h-2 bg-black border border-zinc-700 rounded-full shadow-[0_0_10px_rgba(255,0,0,0.5)]" />
        <div className="w-12 h-2 bg-black border border-zinc-700 rounded-full shadow-[0_0_10px_rgba(255,0,0,0.5)]" />
      </div>
    </div>
  );
}
