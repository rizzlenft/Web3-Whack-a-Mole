import { useEmbedded } from '@/contexts/EmbeddedContext';
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ArcadeCabinet({ children, className }: { children: React.ReactNode; className?: string }) {
  const embedded = useEmbedded();
  return (
    <div
      className={cn(
        "w-full max-w-5xl mx-auto relative flex flex-col min-h-0",
        embedded
          ? "border-[6px] rounded-t-xl rounded-b-lg shadow-[0_0_40px_rgba(255,0,255,0.25)]"
          : "border-[14px] md:border-[20px] rounded-t-[2rem] rounded-b-2xl shadow-[0_0_80px_rgba(255,0,255,0.3),0_0_160px_rgba(0,255,255,0.12),inset_0_0_60px_rgba(0,0,0,0.95)]",
        "border-[#1A0903]",
        className
      )}
      style={{ background: 'linear-gradient(160deg, #160803 0%, #2A1006 35%, #1E0C05 65%, #160803 100%)' }}
    >
      {/* Side neon rails */}
      {!embedded && (
        <>
          <div className="absolute top-4 left-[5px] bottom-4 w-[6px] rounded-full bg-primary opacity-95 shadow-[0_0_30px_8px_hsl(315,100%,60%,0.75)]" />
          <div className="absolute top-4 right-[5px] bottom-4 w-[6px] rounded-full bg-secondary opacity-95 shadow-[0_0_30px_8px_hsl(185,100%,50%,0.75)]" />
        </>
      )}

      {/* Top decorative strip */}
      {!embedded && (
      <div className="absolute top-0 left-[14px] right-[14px] h-[14px] md:h-[20px] flex items-center justify-center gap-2 z-30">
        <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full" />
        {/* Speaker dots */}
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 4 ? 'bg-zinc-500' : 'bg-zinc-700'} border border-zinc-600/50 flex-shrink-0`} />
        ))}
        <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-secondary/40 to-transparent rounded-full" />
      </div>
      )}

      {/* Glass glare */}
      {!embedded && (
        <>
      <div className="absolute top-0 left-0 w-full h-[22%] bg-gradient-to-b from-white/6 to-transparent pointer-events-none rounded-t-2xl z-40" />
      <div className="absolute top-0 left-[-18%] w-[55%] h-full bg-gradient-to-br from-white/[0.03] via-transparent to-transparent rotate-12 pointer-events-none z-40" />
        </>
      )}

      {/* Screen bezel — flex-1 so it fills the vertical space */}
      <div className={cn(
        "flex-1 min-h-0 relative z-10 overflow-hidden bg-background",
        embedded
          ? "m-[2px] border-[4px] border-zinc-900 rounded-lg shadow-[inset_0_0_24px_rgba(0,0,0,0.9)]"
          : "m-[4px] md:m-[6px] border-[10px] border-zinc-900 rounded-2xl shadow-[inset_0_0_40px_rgba(0,0,0,0.9),inset_0_0_2px_rgba(255,255,255,0.05)]"
      )}>
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

      {/* Control panel — below the screen */}
      {!embedded && (
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-2 z-30">
        {/* Left: two action buttons */}
        <div className="flex items-center gap-2.5">
          <button className="w-5 h-5 rounded-full bg-destructive border-2 border-red-900 shadow-[0_0_8px_hsl(0,100%,60%,0.6)] active:scale-90 transition-transform" aria-hidden />
          <button className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-yellow-800 shadow-[0_0_8px_rgba(234,179,8,0.5)] active:scale-90 transition-transform" aria-hidden />
        </div>

        {/* Centre: coin slot */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-14 h-1.5 bg-zinc-950 border border-zinc-700 rounded-full shadow-inner" />
          <span className="font-display text-[6px] text-zinc-700 tracking-widest">INSERT COIN</span>
        </div>

        {/* Right: two buttons */}
        <div className="flex items-center gap-2.5">
          <button className="w-4 h-4 rounded-full bg-secondary border-2 border-cyan-900 shadow-[0_0_8px_hsl(185,100%,50%,0.5)] active:scale-90 transition-transform" aria-hidden />
          <button className="w-5 h-5 rounded-full bg-accent border-2 border-green-900 shadow-[0_0_8px_hsl(140,100%,55%,0.6)] active:scale-90 transition-transform" aria-hidden />
        </div>
      </div>
      )}
    </div>
  );
}
