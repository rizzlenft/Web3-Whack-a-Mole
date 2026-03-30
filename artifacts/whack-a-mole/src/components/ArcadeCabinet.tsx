import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ArcadeCabinet({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn(
      "w-full max-w-5xl mx-auto min-h-[600px] border-[12px] md:border-[20px] border-zinc-900 rounded-3xl p-2 md:p-6 bg-black/60 backdrop-blur-sm relative overflow-hidden",
      "shadow-[0_0_50px_rgba(255,0,255,0.2),inset_0_0_30px_rgba(0,255,255,0.1)]",
      className
    )}>
      {/* Glare effect */}
      <div className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-2xl z-50" />
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-white/5 via-transparent to-transparent rotate-45 pointer-events-none z-50" />
      
      {/* Screen Border */}
      <div className="w-full h-full border-4 border-zinc-800 rounded-xl relative z-10 overflow-hidden bg-background/80">
        <div className="scanlines" />
        <div className="crt-flicker w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
