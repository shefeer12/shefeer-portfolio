'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface DriftTile {
  id: string;
  thumbnail: string;
  title: string;
}

export interface DriftWallProps {
  tiles: DriftTile[];
  speed?: number; // duration in seconds
  className?: string;
  onTileClick?: (tile: DriftTile) => void;
}

export default function DriftWall({
  tiles,
  speed = 40,
  className = '',
  onTileClick
}: DriftWallProps) {
  const repeatedTiles = [...tiles, ...tiles, ...tiles];

  return (
    <div
      className={cn(
        'relative w-full h-[360px] overflow-hidden select-none opacity-30 hover:opacity-50 transition-opacity duration-500 pointer-events-none',
        className
      )}
      style={{
        perspective: '1000px',
        transform: 'rotateX(12deg) rotateZ(-4deg)'
      }}
    >
      {/* Drifting Column 1 */}
      <div
        className="flex gap-4 absolute inset-0 items-center will-change-transform animate-drift"
        style={{
          animation: `driftHorizontal ${speed}s linear infinite`
        }}
      >
        {repeatedTiles.map((tile, i) => (
          <div
            key={`${tile.id}-${i}`}
            onClick={() => onTileClick?.(tile)}
            className="flex-shrink-0 w-36 aspect-[9/16] rounded-sm bg-card border border-white/10 overflow-hidden relative"
          >
            <div
              className="absolute inset-0 bg-cover bg-center filter grayscale contrast-125"
              style={{ backgroundImage: `url("${tile.thumbnail}")` }}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes driftHorizontal {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
