'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface VariableProximityProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  fromFontWeight?: number;
  toFontWeight?: number;
  radius?: number;
  className?: string;
  letterClassName?: string;
}

export default function VariableProximity({
  label,
  fromFontWeight = 400,
  toFontWeight = 900,
  radius = 80,
  className = '',
  letterClassName = '',
  ...props
}: VariableProximityProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [isPointerFine, setIsPointerFine] = useState(false);

  useEffect(() => {
    // Only enable on desktop devices with fine pointer (mouse/trackpad)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    setIsPointerFine(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsPointerFine(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  useEffect(() => {
    if (!isPointerFine) return;

    const handleMouseMove = (e: MouseEvent) => {
      letterRefs.current.forEach((letterEl) => {
        if (!letterEl) return;
        const rect = letterEl.getBoundingClientRect();
        const letterCenterX = rect.left + rect.width / 2;
        const letterCenterY = rect.top + rect.height / 2;

        const distance = Math.hypot(e.clientX - letterCenterX, e.clientY - letterCenterY);

        if (distance < radius) {
          const proximity = 1 - distance / radius;
          const targetWeight = Math.round(
            fromFontWeight + proximity * (toFontWeight - fromFontWeight)
          );
          letterEl.style.fontWeight = `${targetWeight}`;
          letterEl.style.color = proximity > 0.4 ? 'var(--accent-orange)' : '';
        } else {
          letterEl.style.fontWeight = `${fromFontWeight}`;
          letterEl.style.color = '';
        }
      });
    };

    const handleMouseLeave = () => {
      letterRefs.current.forEach((letterEl) => {
        if (!letterEl) return;
        letterEl.style.fontWeight = `${fromFontWeight}`;
        letterEl.style.color = '';
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isPointerFine, fromFontWeight, toFontWeight, radius]);

  return (
    <div
      ref={containerRef}
      className={cn('inline-flex flex-wrap select-none', className)}
      {...props}
    >
      {label.split('').map((letter, i) => (
        <span
          key={i}
          ref={(el) => {
            letterRefs.current[i] = el;
          }}
          className={cn('inline-block transition-colors duration-150', letterClassName)}
          style={{ fontWeight: fromFontWeight }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </span>
      ))}
    </div>
  );
}
