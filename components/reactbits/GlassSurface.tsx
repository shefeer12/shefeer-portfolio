'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'medium' | 'deep';
  glowOnHover?: boolean;
}

export default function GlassSurface({
  children,
  className = '',
  intensity = 'medium',
  glowOnHover = false,
  ...props
}: GlassSurfaceProps) {
  const intensityStyles = {
    subtle: 'bg-white/[0.03] backdrop-blur-sm border-white/10',
    medium: 'bg-[#0b0b10]/80 backdrop-blur-md border-white/15 shadow-xl shadow-black/40',
    deep: 'bg-[#070709]/90 backdrop-blur-xl border-white/20 shadow-2xl shadow-black/80'
  };

  return (
    <div
      className={cn(
        'relative rounded-sm border transition-all duration-300',
        intensityStyles[intensity],
        glowOnHover && 'hover:border-accent/50 hover:shadow-accent/5',
        className
      )}
      {...props}
    >
      {/* Specular Top Edge Light */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      {children}
    </div>
  );
}
