'use client';

import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';

export default function TargetCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPointerFine, setIsPointerFine] = useState(false);

  useEffect(() => {
    // Strictly desktop-only with fine pointer & no reduced motion
    const pointerQuery = window.matchMedia('(pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateCapability = () => {
      setIsPointerFine(pointerQuery.matches && !motionQuery.matches);
    };

    updateCapability();

    pointerQuery.addEventListener('change', updateCapability);
    motionQuery.addEventListener('change', updateCapability);

    if (!pointerQuery.matches || motionQuery.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check for custom cursor label (e.g. over gallery project cards)
      const labeledCard = target.closest<HTMLElement>('[data-cursor-label]');
      if (labeledCard) {
        setCursorLabel(labeledCard.getAttribute('data-cursor-label') || 'PLAY');
        setIsHoveringInteractive(true);
        return;
      } else {
        setCursorLabel(null);
      }

      // Check generic interactive targets
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('.project-card')
      ) {
        setIsHoveringInteractive(true);
      } else {
        setIsHoveringInteractive(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setCursorLabel(null);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      pointerQuery.removeEventListener('change', updateCapability);
      motionQuery.removeEventListener('change', updateCapability);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  if (!isPointerFine || !isVisible) return null;

  return (
    <div
      className="pointer-events-none fixed z-50 transition-transform duration-75 ease-out select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)'
      }}
      aria-hidden="true"
    >
      {cursorLabel ? (
        /* Cinematic Capsule Cursor Label on Gallery Video Cards */
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-black font-mono text-[10px] font-bold tracking-widest uppercase shadow-2xl shadow-accent/40 animate-in fade-in zoom-in-90 duration-150 transform -translate-y-2">
          <Play className="w-2.5 h-2.5 fill-current" />
          <span>{cursorLabel}</span>
        </div>
      ) : (
        /* Standard Camera / Viewfinder Reticle */
        <div
          className={`relative flex items-center justify-center transition-all duration-200 ${
            isHoveringInteractive
              ? 'w-10 h-10 scale-110'
              : 'w-6 h-6 scale-100 opacity-70'
          }`}
        >
          {/* Center Point */}
          <span
            className={`w-1 h-1 rounded-full ${
              isHoveringInteractive ? 'bg-accent scale-150' : 'bg-white/80'
            }`}
          />

          {/* Reticle Brackets */}
          <div className="absolute inset-0 border border-accent/40 rounded-sm">
            <span className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 border-t border-l border-accent" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 border-t border-r border-accent" />
            <span className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 border-b border-l border-accent" />
            <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border-b border-r border-accent" />
          </div>
        </div>
      )}
    </div>
  );
}
