'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SpeakerToggleProps {
  isMuted: boolean;
  onToggle: () => void;
  className?: string;
  currentProjectTitle?: string;
  currentProjectIndex?: number;
  totalProjects?: number;
  soundBlocked?: boolean;
}

/**
 * SpeakerToggle - Adapted from React Bits toggle motion principles.
 * 
 * Replaces traditional playback scrubbers and notification bells with a compact,
 * audio-reactive mute/unmute control for the cinematic hero background.
 * 
 * Features:
 * - Animated icon spring transitions between Volume2 and VolumeX.
 * - Expanding ambient acoustic rings when sound is live.
 * - Tooltip with accessible ARIA labeling.
 * - Visible keyboard focus indicators and tactile press feedback.
 * - Strict adherence to `prefers-reduced-motion`.
 */
export default function SpeakerToggle({
  isMuted,
  onToggle,
  className,
  currentProjectTitle,
  currentProjectIndex,
  totalProjects,
  soundBlocked = false,
}: SpeakerToggleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const label = soundBlocked
    ? 'Audio blocked by browser policy — Click to retry'
    : isMuted
    ? 'Turn sound on'
    : 'Mute video';

  return (
    <div
      className={cn(
        'relative flex items-center gap-3.5 select-none z-30 pointer-events-auto',
        className
      )}
    >
      {/* Editorial Clip Info & Pagination Indicator */}
      {currentProjectTitle && typeof currentProjectIndex === 'number' && totalProjects && (
        <div className="hidden sm:flex flex-col items-end pr-1 text-right pointer-events-none drop-shadow-md">
          <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-accent font-semibold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>HERO REEL · 0{currentProjectIndex + 1} / 0{totalProjects}</span>
          </div>
          <span className="text-[11px] font-mono font-medium text-white/80 tracking-wider uppercase truncate max-w-[220px]">
            {currentProjectTitle}
          </span>
        </div>
      )}

      {/* Main Interactive Toggle Button Container */}
      <div className="relative group">
        {/* Floating Tooltip */}
        <div
          role="tooltip"
          id="speaker-toggle-tooltip"
          aria-hidden={!isHovered}
          className={cn(
            'absolute bottom-full mb-2.5 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2',
            'px-2.5 py-1 rounded bg-[#0b0b10]/95 border border-white/15 text-[10px] font-mono uppercase tracking-wider text-white whitespace-nowrap shadow-2xl pointer-events-none backdrop-blur-md transition-all duration-200',
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
          )}
        >
          {label}
        </div>

        {/* Dynamic Sound-Wave Pulse Rings (Active when sound is on) */}
        {!isMuted && !prefersReducedMotion && (
          <div className="absolute inset-0 pointer-events-none">
            <motion.span
              className="absolute inset-0 rounded-full border border-accent/60"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: [1, 1.45], opacity: [0.8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
            />
            <motion.span
              className="absolute inset-0 rounded-full border border-accent/40"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: [1, 1.85], opacity: [0.6, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: 'easeOut' }}
            />
          </div>
        )}

        {/* Button */}
        <motion.button
          type="button"
          role="button"
          aria-label={label}
          aria-pressed={!isMuted}
          aria-describedby="speaker-toggle-tooltip"
          onClick={onToggle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
          whileHover={{ scale: prefersReducedMotion ? 1 : 1.06 }}
          whileTap={{ scale: prefersReducedMotion ? 1 : 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={cn(
            'relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full cursor-pointer',
            'bg-black/60 hover:bg-black/80 backdrop-blur-md',
            'border transition-colors duration-200',
            !isMuted
              ? 'border-accent shadow-[0_0_24px_rgba(255,85,0,0.35)] text-accent'
              : 'border-white/20 hover:border-accent/60 text-white/80 hover:text-white shadow-xl',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#070709]'
          )}
        >
          {/* Animated Speaker Icon */}
          <motion.div
            key={isMuted ? 'muted' : 'unmuted'}
            initial={{ scale: prefersReducedMotion ? 1 : 0.75, rotate: prefersReducedMotion ? 0 : -12 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: prefersReducedMotion ? 1 : 0.75, rotate: prefersReducedMotion ? 0 : 12 }}
            transition={{ type: 'spring', stiffness: 450, damping: 22 }}
            className="flex items-center justify-center"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 transition-colors" />
            ) : (
              <Volume2 className="w-5 h-5 text-accent animate-pulse transition-colors" />
            )}
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
}
