'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface LogoItem {
  name: string;
  category?: string;
  icon?: React.ReactNode;
}

export interface LogoLoopProps {
  items: LogoItem[];
  speed?: number; // seconds for complete loop
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
}

export default function LogoLoop({
  items,
  speed = 30,
  direction = 'left',
  pauseOnHover = true,
  className = ''
}: LogoLoopProps) {
  // Duplicate items for infinite seamless scroll
  const duplicatedItems = [...items, ...items];

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden select-none py-6 border-y border-white/10 bg-white/[0.01]',
        className
      )}
    >
      {/* Edge Blur / Fade Masks */}
      <div className="pointer-events-none absolute left-0 inset-y-0 w-24 bg-gradient-to-r from-[#070709] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-[#070709] to-transparent z-10" />

      {/* Marquee Track */}
      <div
        className={cn(
          'flex gap-12 items-center whitespace-nowrap will-change-transform',
          pauseOnHover && 'hover:[animation-play-state:paused]'
        )}
        style={{
          animation: `marquee-${direction} ${speed}s linear infinite`
        }}
      >
        {duplicatedItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 text-xs font-mono text-white/70 hover:text-white transition-colors"
          >
            {item.icon && <span className="text-accent">{item.icon}</span>}
            <span className="font-semibold tracking-wider uppercase text-white/90">
              {item.name}
            </span>
            {item.category && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/50">
                {item.category}
              </span>
            )}
            <span className="text-white/20 ml-6">✦</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee-left {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes marquee-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>
    </div>
  );
}
