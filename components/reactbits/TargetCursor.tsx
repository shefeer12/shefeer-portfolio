'use client';

import React, { useEffect, useState } from 'react';

export default function TargetCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPointerFine, setIsPointerFine] = useState(false);

  useEffect(() => {
    // Strictly desktop-only with fine pointer
    const mediaQuery = window.matchMedia('(pointer: fine)');
    setIsPointerFine(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsPointerFine(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    if (!mediaQuery.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest('button') ||
          target.closest('a') ||
          target.closest('[role="button"]') ||
          target.closest('.project-card'))
      ) {
        setIsHoveringInteractive(true);
      } else {
        setIsHoveringInteractive(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
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
      {/* Reticle Container */}
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
          {/* Top-left tick */}
          <span className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 border-t border-l border-accent" />
          {/* Top-right tick */}
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 border-t border-r border-accent" />
          {/* Bottom-left tick */}
          <span className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 border-b border-l border-accent" />
          {/* Bottom-right tick */}
          <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border-b border-r border-accent" />
        </div>
      </div>
    </div>
  );
}
